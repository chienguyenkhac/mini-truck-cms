import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '../components/shared/Notification';
import ConfirmDeleteModal from '../components/shared/ConfirmDeleteModal';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import ImportExcelModal from '../components/ImportExcelModal';
import * as XLSX from 'xlsx';

import { productService, categoryService, getImageUrl, Product, Category } from '../services/supabase';

const PAGE_SIZE = 10;

const Products: React.FC = () => {
    const notification = useNotification();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [_loading, setLoading] = useState(true);
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);

    // Get category and cursor from URL params  
    const categoryFilter = searchParams.get('category') || 'ALL';
    const cursorParam = searchParams.get('cursor');
    const currentCursor = cursorParam ? parseInt(cursorParam, 10) : null;

    // Load products and categories from Supabase
    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([
                productService.getAll({ limit: 100 }),
                categoryService.getAll()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error loading data:', err);
            notification.error('Không thể tải dữ liệu từ database');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter products by category and search
    const filteredProducts = useMemo(() => {
        return products.filter((p: Product) => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                (p.code?.toLowerCase().includes(search.toLowerCase()) || false);

            // Find category_id from category name if needed
            let matchesCategory = categoryFilter === 'ALL';
            if (!matchesCategory) {
                // Try to match by category name first (from URL like "ĐỘNG CƠ")
                const categoryByName = categories.find(c => c.name === categoryFilter);
                if (categoryByName) {
                    matchesCategory = p.category_id === categoryByName.id;
                } else {
                    // Fallback to parsing as number (if URL has category_id)
                    matchesCategory = p.category_id === parseInt(categoryFilter);
                }
            }

            return matchesSearch && matchesCategory;
        }).sort((a: Product, b: Product) => a.id - b.id);
    }, [products, categories, categoryFilter, search]);

    // Cursor-based pagination logic
    const paginatedData = useMemo(() => {
        let startIndex = 0;

        if (currentCursor !== null) {
            // Find the index of the product with ID equal to cursor
            const cursorIndex = filteredProducts.findIndex(p => p.id === currentCursor);
            if (cursorIndex !== -1) {
                startIndex = cursorIndex + 1; // Start after the cursor
            }
        }

        const pageProducts = filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);
        const hasNextPage = startIndex + PAGE_SIZE < filteredProducts.length;
        const hasPrevPage = currentCursor !== null && startIndex > 0;

        // Get the cursors for navigation
        const nextCursor = pageProducts.length > 0 ? pageProducts[pageProducts.length - 1].id : null;
        const prevCursor = startIndex > 0 ? filteredProducts[Math.max(0, startIndex - PAGE_SIZE)]?.id || null : null;

        return {
            products: pageProducts,
            hasNextPage,
            hasPrevPage,
            nextCursor,
            prevCursor,
            startIndex,
            totalCount: filteredProducts.length,
        };
    }, [filteredProducts, currentCursor]);

    const handleNextPage = () => {
        if (paginatedData.hasNextPage && paginatedData.nextCursor) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('cursor', paginatedData.nextCursor.toString());
            setSearchParams(newParams);
        }
    };

    const handlePrevPage = () => {
        const newParams = new URLSearchParams(searchParams);
        if (paginatedData.prevCursor !== null && paginatedData.startIndex > PAGE_SIZE) {
            newParams.set('cursor', paginatedData.prevCursor.toString());
        } else {
            // Go to first page
            newParams.delete('cursor');
        }
        setSearchParams(newParams);
    };

    const handleFirstPage = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('cursor');
        setSearchParams(newParams);
    };

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredProducts);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh mục sản phẩm');
        XLSX.writeFile(wb, `sinotruk-catalog-${new Date().toISOString().split('T')[0]}.xlsx`);
        notification.success('Đã xuất danh mục sản phẩm (Excel) thành công');
    };

    const handleImportComplete = () => {
        loadData();
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
            loadData();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra khi xóa sản phẩm');
        }
    };

    const handleToggleHomepage = async (product: Product) => {
        try {
            await productService.update(product.id, { show_on_homepage: !product.show_on_homepage });
            notification.success(product.show_on_homepage ? 'Đã ẩn sản phẩm khỏi trang chủ' : 'Đã hiển thị sản phẩm trên trang chủ');
            loadData();
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
                                // Reset cursor when searching
                                const newParams = new URLSearchParams(searchParams);
                                newParams.delete('cursor');
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
                            newParams.delete('cursor');
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
                                    newParams.delete('cursor');
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
                                    newParams.delete('cursor');
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
                                <th className="w-20 text-center">Ảnh</th>
                                <th className="w-36">Mã SP (PN)</th>
                                <th>Tên sản phẩm</th>
                                <th className="w-32">Danh mục</th>
                                <th className="w-24 text-center">Show on Homepage</th>
                                <th className="text-right px-6 w-40">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.products.length > 0 ? (
                                paginatedData.products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
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
                                        <td>
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
                                    <td colSpan={6} className="py-20 text-center">
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
                        disabled={!paginatedData.hasPrevPage && currentCursor === null}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${paginatedData.hasPrevPage || currentCursor !== null
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
                        disabled={!paginatedData.hasPrevPage && currentCursor === null}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${paginatedData.hasPrevPage || currentCursor !== null
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                        <span className="hidden sm:inline">Trước</span>
                    </button>

                    {/* Page Indicator */}
                    <div className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg text-sm">
                        Trang {Math.floor(paginatedData.startIndex / PAGE_SIZE) + 1} / {Math.ceil(paginatedData.totalCount / PAGE_SIZE)}
                    </div>

                    {/* Next Page Button */}
                    <button
                        onClick={handleNextPage}
                        disabled={!paginatedData.hasNextPage}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${paginatedData.hasNextPage
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
                        loadData();
                        setShowAddModal(false);
                    }}
                />
            )}

            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSave={() => {
                        loadData();
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
