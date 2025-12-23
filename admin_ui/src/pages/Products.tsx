import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '../components/shared/Notification';
import AddProductModal from '../components/AddProductModal';
import * as XLSX from 'xlsx';

import { productService, categoryService, Product, Category } from '../services/supabase';

const PAGE_SIZE = 10;

const Products: React.FC = () => {
    const notification = useNotification();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [_loading, setLoading] = useState(true);

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

    const handleEdit = (id: number) => {
        notification.info(`Sửa thông tin kỹ thuật #${id}`);
    };

    const handleDelete = (id: number) => {
        notification.warning(`Xác nhận gỡ sản phẩm #${id} khỏi danh mục?`);
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
                    <p className="text-slate-500 text-sm md:text-base italic">Kho lưu trữ khoa học & Catalog thông số kỹ thuật</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleExportExcel}
                        className="btn btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2"
                        title="Tải Catalog Excel"
                    >
                        <span className="material-symbols-outlined">download</span>
                        <span className="hidden sm:inline">Xuất Catalog</span>
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
                            placeholder="Tra cứu nhanh theo tên, mã sản phẩm, thông số..."
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
            </div>

            {/* Products Catalog Table */}
            <div className="card p-0 overflow-hidden border-slate-200/60">
                <div className="overflow-x-auto">
                    <table className="admin-table w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="w-24 text-center">Ảnh kỹ thuật</th>
                                <th className="w-40">Mã định danh (PN)</th>
                                <th>Tên gọi khoa học</th>
                                <th>Giá niêm yết</th>
                                <th>Trạng thái tồn</th>
                                <th>Phân loại</th>
                                <th className="text-right px-6">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.products.length > 0 ? (
                                paginatedData.products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4">
                                            <div className="w-16 h-16 mx-auto rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm group relative cursor-zoom-in">
                                                <img
                                                    src={product.image || 'https://res.cloudinary.com/dgv7d7n6q/image/upload/v1734944400/product_placeholder.png'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-mono text-sm font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10">
                                                {product.code}
                                            </span>
                                        </td>
                                        <td className="max-w-[250px]">
                                            <p className="font-bold text-slate-800 leading-tight">{product.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase mt-1">Sinotruk Genuine Parts</p>
                                        </td>
                                        <td className="font-bold text-slate-700">
                                            {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-xs font-bold ${product.total < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                    Số lượng: {product.total}
                                                </span>
                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${product.total < 10 ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${Math.min(product.total, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-gray">{categories.find(c => c.id === product.category_id)?.name || '-'}</span>
                                        </td>
                                        <td className="text-right px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(product.id)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200"
                                                    title="Sửa thông số"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit_note</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-xl border border-slate-100 shadow-sm hover:border-red-200"
                                                    title="Gỡ khỏi danh mục"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete_sweep</span>
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
                        // Reload products after adding
                        loadData();
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default Products;
