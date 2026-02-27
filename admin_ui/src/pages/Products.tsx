import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '../components/shared/Notification';
import ConfirmDeleteModal from '../components/shared/ConfirmDeleteModal';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import ImportExcelModal from '../components/ImportExcelModal';
import ExcelJS from 'exceljs';

import { productService, categoryService, getImageUrl, Product, Category, PaginatedResponse } from '../services/supabase';

const PAGE_SIZE = 10;

const Products: React.FC = () => {
    const notification = useNotification();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [_loading, setLoading] = useState(true);
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        hasNext: false,
        hasPrev: false
    });

    // Get category and page from URL params  
    const categoryFilter = searchParams.get('category') || 'ALL';
    const pageParam = searchParams.get('page');
    const currentCursor = pageParam ? parseInt(pageParam, 10) - 1 : 0; // Convert to 0-based index

    // Load products and categories with server-side pagination
    // Load categories once
    const loadCategories = async () => {
        try {
            const categoriesData = await categoryService.getAll();
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    // Load products with server-side pagination
    const loadProducts = async () => {
        setLoading(true);
        try {
            const offset = currentCursor ? currentCursor * PAGE_SIZE : 0;
            
            // Build API options for server-side filtering
            const options: any = { 
                limit: PAGE_SIZE, 
                offset,
                paginated: true
            };
            
            // Category filter
            if (categoryFilter !== 'ALL') {
                options.category = categoryFilter;
            }
            
            // Search filter
            if (debouncedSearch) {
                options.search = debouncedSearch;
            }
            
            const productsData = await productService.getAll(options);
            
            // Handle API response format
            if (Array.isArray(productsData)) {
                // It's a Product[] array
                setProducts(productsData);
                setPagination({
                    total: productsData.length,
                    totalPages: 1,
                    currentPage: 1,
                    hasNext: false,
                    hasPrev: false
                });
            } else {
                // It's a PaginatedResponse
                const paginatedData = productsData as PaginatedResponse<Product>;
                setProducts(paginatedData.data);
                setPagination(paginatedData.pagination);
            }
        } catch (err) {
            console.error('Error loading products:', err);
            notification.error('Không thể tải dữ liệu từ database');
        } finally {
            setLoading(false);
        }
    };

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // Load categories once on mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Load products when pagination/filter/search changes
    useEffect(() => {
        loadProducts();
    }, [currentCursor, categoryFilter, debouncedSearch]);

    // Server-side pagination with accurate metadata
    const paginatedData = useMemo(() => {
        return {
            products: products,
            hasNextPage: pagination.hasNext,
            hasPrevPage: pagination.hasPrev,
            startIndex: currentCursor * PAGE_SIZE,
            totalCount: pagination.total,
            totalPages: pagination.totalPages,
            currentPage: pagination.currentPage
        };
    }, [products, pagination, currentCursor]);

    const handleNextPage = () => {
        if (paginatedData.hasNextPage) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('page', (currentCursor + 2).toString()); // Convert back to 1-based
            setSearchParams(newParams);
        }
    };

    const handlePrevPage = () => {
        const newParams = new URLSearchParams(searchParams);
        if (currentCursor > 0) {
            newParams.set('page', currentCursor.toString()); // Convert back to 1-based
        } else {
            newParams.delete('page');
        }
        setSearchParams(newParams);
    };

    const handleFirstPage = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('page');
        setSearchParams(newParams);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProductIds(paginatedData.products.map(p => p.id));
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSelectProduct = (productId: number) => {
        setSelectedProductIds(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const confirmBatchDelete = async () => {
        if (selectedProductIds.length === 0) return;
        try {
            // Delete sequentially to avoid overwhelming the server
            for (const id of selectedProductIds) {
                await productService.delete(id);
            }
            notification.success(`Đã xóa ${selectedProductIds.length} sản phẩm`);
            setSelectedProductIds([]);
            setShowBatchDeleteConfirm(false);
            loadProducts();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra khi xóa sản phẩm');
        }
    };

    const handleExportExcel = async () => {
        try {
            // Export all products, not just current page
            const allProductsResponse = await productService.getAll({
                category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
                search: debouncedSearch || undefined
            });
            
            const allProducts = Array.isArray(allProductsResponse) 
                ? allProductsResponse 
                : (allProductsResponse as PaginatedResponse<Product>).data;
            
            if (!allProducts || allProducts.length === 0) {
                notification.error('Không có dữ liệu để xuất');
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Danh mục sản phẩm');

            // Lấy danh sách các cột từ phần tử đầu tiên
            const headers = Object.keys(allProducts[0]);
            
            // Thêm header (chuyển thành in hoa)
            const headerRow = worksheet.addRow(headers.map(header => header.toUpperCase()));

            // Style cho header: thêm background, đổi màu chữ, in đậm
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4F81BD' } // Nền xanh dương đậm
                };
                cell.font = {
                    color: { argb: 'FFFFFFFF' }, // Chữ trắng
                    bold: true
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            // Thêm các dòng dữ liệu
            allProducts.forEach(product => {
                worksheet.addRow(headers.map(header => {
                    const value = product[header as keyof typeof product];
                    // Xử lý các giá trị là mảng (như vehicle_ids) để không bị ngoặc vuông []
                    if (Array.isArray(value)) {
                        return value.join(', ');
                    }
                    return value;
                }));
            });

            // Auto-fit độ rộng cột và căn giữa các cột chỉ định
            worksheet.columns.forEach((column, index) => {
                const headerName = headers[index].toUpperCase();
                
                let maxLength = 0;
                column.eachCell!({ includeEmpty: true }, (cell, rowNumber) => {
                    // Căn giữa cho ID và CATEGORY_ID ở các dòng dữ liệu (không phải header)
                    if (rowNumber > 1 && (headerName === 'ID' || headerName === 'CATEGORY_ID')) {
                        cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    }

                    const columnLength = cell.value ? cell.value.toString().length : 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = maxLength < 10 ? 10 : maxLength + 2;
            });

            // Ghi file và tải xuống
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sinotruk-catalog-${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);

            notification.success('Đã xuất danh mục sản phẩm (Excel) thành công');
        } catch (error) {
            console.error('Lỗi xuất Excel:', error);
            notification.error('Có lỗi xảy ra khi xuất Excel');
        }
    };

    const handleImportComplete = () => {
        loadProducts();
        setShowImportModal(false);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
    };

    const handleDelete = async (product: Product) => {
        setDeleteProduct(product);
    };

    const confirmDelete = async () => {
        if (!deleteProduct) return;
        try {
            await productService.delete(deleteProduct.id);
            notification.success(`Đã xóa sản phẩm "${deleteProduct.name}"`);
            setDeleteProduct(null);
            loadProducts();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra khi xóa sản phẩm');
        }
    };

    const handleToggleHomepage = async (product: Product) => {
        try {
            await productService.update(product.id, { show_on_homepage: !product.show_on_homepage });
            notification.success(product.show_on_homepage ? 'Đã ẩn sản phẩm khỏi trang chủ' : 'Đã hiển thị sản phẩm trên trang chủ');
            loadProducts();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleCopyLink = (product: Product) => {
        // Get the base URL without /secret path
        const origin = window.location.origin;
        // If we're on admin (port 5174 or /secret), use the client base URL
        const baseUrl = origin.includes(':5174') 
            ? origin.replace(':5174', ':5173')  // Local dev: switch from admin port to client port
            : origin; // Production: same origin, just remove /secret path
        
        // Use slug if available, otherwise fallback to id
        const productIdentifier = product.slug || product.id;
        const url = `${baseUrl}/product/${productIdentifier}`;
        navigator.clipboard.writeText(url);
        notification.success('Đã copy link sản phẩm');
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight uppercase">
                        Danh mục phụ tùng
                        {categoryFilter !== 'ALL' && (
                            <span className="text-primary ml-2">- {categoryFilter}</span>
                        )}
                    </h1>

                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {selectedProductIds.length > 0 && (
                        <button
                            onClick={() => setShowBatchDeleteConfirm(true)}
                            className="btn flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white transition-colors"
                            title="Xóa các mục đã chọn"
                        >
                            <span className="material-symbols-outlined">delete</span>
                            <span className="hidden sm:inline">Xóa ({selectedProductIds.length})</span>
                        </button>
                    )}
                    {/* Import Excel */}
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="btn btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2"
                        title="Nhập sản phẩm từ Excel"
                    >
                        <span className="material-symbols-outlined">upload</span>
                        <span className="hidden sm:inline">Nhập Excel</span>
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="btn btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2"
                        title="Tải Catalog Excel"
                    >
                        <span className="material-symbols-outlined">download</span>
                        <span className="hidden sm:inline">Xuất Excel</span>
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        Thêm SP
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="card">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Tra cứu nhanh theo tên, mã sản phẩm..."
                            className="input w-full"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                // Reset page when searching
                                const newParams = new URLSearchParams(searchParams);
                                newParams.delete('page');
                                setSearchParams(newParams);
                            }}
                        />
                    </div>
                </div>

                {/* Category Filter Chips */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <button
                        onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('category');
                            newParams.delete('page');
                            setSearchParams(newParams);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${categoryFilter === 'ALL'
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Tất cả
                    </button>
                </div>

                {/* Vehicle Categories */}
                <div className="mt-4">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Theo loại xe</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.filter(c => c.is_vehicle_name).map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.set('category', String(cat.id));
                                    newParams.delete('page');
                                    setSearchParams(newParams);
                                }}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${categoryFilter === String(cat.id)
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Part Categories */}
                <div className="mt-4">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Theo loại phụ tùng</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.filter(c => !c.is_vehicle_name).map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.set('category', String(cat.id));
                                    newParams.delete('page');
                                    setSearchParams(newParams);
                                }}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${categoryFilter === String(cat.id)
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Catalog Table */}
            <div className="card p-0 overflow-hidden border-slate-200/60">
                <div className="overflow-x-auto">
                    <table className="admin-table w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="w-12 text-center px-4">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                        checked={paginatedData.products.length > 0 && selectedProductIds.length === paginatedData.products.length}
                                        onChange={handleSelectAll}
                                        title="Chọn tất cả"
                                    />
                                </th>
                                <th className="w-20 text-center">Ảnh</th>
                                <th className="w-36">Mã SP (PN)</th>
                                <th>Tên sản phẩm</th>
                                <th className="w-44">Danh mục</th>
                                <th className="w-24 text-center">Show on Homepage</th>
                                <th className="text-right px-6 w-40">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.products.length > 0 ? (
                                paginatedData.products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="text-center px-4">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                                checked={selectedProductIds.includes(product.id)}
                                                onChange={() => handleSelectProduct(product.id)}
                                                title={`Chọn ${product.name}`}
                                            />
                                        </td>
                                        <td className="py-3">
                                            <div className="w-14 h-14 mx-auto rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm">
                                                <img
                                                    src={getImageUrl(product.thumbnail || product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-mono text-sm font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10">
                                                {product.code}
                                            </span>
                                        </td>
                                        <td className="max-w-[280px]">
                                            <p className="font-bold text-slate-800 leading-tight truncate">{product.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase mt-1">Sinotruk Genuine Parts</p>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <span className="badge badge-gray text-xs">{categories.find(c => c.id === product.category_id)?.name || '-'}</span>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => handleToggleHomepage(product)}
                                                className={`w-10 h-6 rounded-full relative transition-colors ${product.show_on_homepage !== false ? 'bg-green-500' : 'bg-slate-300'}`}
                                                title={product.show_on_homepage !== false ? 'Đang hiện trên trang chủ' : 'Đang ẩn khỏi trang chủ'}
                                            >
                                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${product.show_on_homepage !== false ? 'left-5' : 'left-1'}`}></span>
                                            </button>
                                        </td>
                                        <td className="text-right px-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleCopyLink(product)}
                                                    className="p-2 text-slate-400 hover:text-green-600 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm hover:border-green-200"
                                                    title="Copy link sản phẩm"
                                                >
                                                    <span className="material-symbols-outlined text-base">link</span>
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm hover:border-blue-200"
                                                    title="Sửa sản phẩm"
                                                >
                                                    <span className="material-symbols-outlined text-base">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm hover:border-red-200"
                                                    title="Xóa sản phẩm"
                                                >
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <span className="material-symbols-outlined text-6xl">inventory_2</span>
                                            <p className="font-bold">Không tìm thấy sản phẩm nào phù hợp</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cursor Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <p className="text-slate-500 text-sm">
                    Đang hiển thị <span className="font-bold text-slate-800">{paginatedData.startIndex + 1}</span>-<span className="font-bold text-slate-800">{Math.min(paginatedData.startIndex + paginatedData.products.length, paginatedData.totalCount)}</span> trên tổng số <span className="font-bold text-slate-800">{paginatedData.totalCount}</span> mặt hàng
                </p>

                <div className="flex items-center gap-2">
                    {/* First Page Button */}
                    <button
                        onClick={handleFirstPage}
                        disabled={currentCursor === 0}
                        className={`flex items-center justify-center h-10 w-10 rounded-lg text-sm font-semibold transition-colors ${currentCursor > 0
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                            }`}
                        title="Trang đầu"
                    >
                        <span className="material-symbols-outlined text-lg">first_page</span>
                    </button>

                    {/* Previous Page Button */}
                    <button
                        onClick={handlePrevPage}
                        disabled={currentCursor === 0}
                        className={`flex items-center justify-center gap-1 h-10 w-24 rounded-lg text-sm font-semibold transition-colors ${currentCursor > 0
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                        <span className="hidden sm:inline">Trước</span>
                    </button>

                    {/* Page Indicator */}
                    <div className="flex items-center justify-center px-4 h-10 bg-primary/10 text-primary font-bold rounded-lg text-sm">
                        Trang {currentCursor + 1}
                    </div>

                    {/* Next Page Button */}
                    <button
                        onClick={handleNextPage}
                        disabled={!paginatedData.hasNextPage}
                        className={`flex items-center justify-center gap-1 h-10 w-24 rounded-lg text-sm font-semibold transition-colors ${paginatedData.hasNextPage
                            ? 'bg-primary text-white hover:bg-primary-dark'
                            : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                            }`}
                    >
                        <span className="hidden sm:inline">Tiếp</span>
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                </div>
            </div>

            {showAddModal && (
                <AddProductModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={() => {
                        loadProducts();
                        setShowAddModal(false);
                    }}
                />
            )}

            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSave={() => {
                        loadProducts();
                        setEditingProduct(null);
                    }}
                />
            )}

            <ConfirmDeleteModal
                isOpen={!!deleteProduct}
                onClose={() => setDeleteProduct(null)}
                onConfirm={confirmDelete}
                title="Xóa sản phẩm"
                message="Bạn có chắc chắn muốn xóa sản phẩm này?"
                itemName={deleteProduct?.name}
            />

            <ConfirmDeleteModal
                isOpen={showBatchDeleteConfirm}
                onClose={() => setShowBatchDeleteConfirm(false)}
                onConfirm={confirmBatchDelete}
                title="Xóa nhiều sản phẩm"
                message={`Bạn có chắc chắn muốn xóa ${selectedProductIds.length} sản phẩm đã chọn?`}
            />

            {showImportModal && (
                <ImportExcelModal
                    onClose={() => setShowImportModal(false)}
                    onImportComplete={handleImportComplete}
                />
            )}
        </div>
    );
};

export default Products;
