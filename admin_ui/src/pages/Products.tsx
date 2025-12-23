import React, { useState } from 'react';
import { useNotification } from '../components/shared/Notification';
import AddProductModal from '../components/AddProductModal';
import * as XLSX from 'xlsx';

// Mock products data - will be replaced with API
const mockProducts = [
    { id: 1, code: 'XLKVX', name: 'Xilanh kích cabin VX350', price: 850000, total: 15, category: 'CABIN', image: '/images/xilanh.jpg' },
    { id: 2, code: 'TBTSI', name: 'Tăm bét trước SITRAK', price: 1200000, total: 8, category: 'ĐỘNG CƠ', image: '/images/sitrakg7s.webp' },
    { id: 3, code: 'LDDC-A7', name: 'Lọc dầu động cơ HOWO A7', price: 350000, total: 25, category: 'ĐỘNG CƠ', image: '/images/locdau.webp' },
    { id: 4, code: 'LC420', name: 'Lá côn HOWO 420', price: 2500000, total: 4, category: 'LY HỢP', image: '/images/daulockhi.webp' },
    { id: 5, code: 'PTTS', name: 'Phanh tang trống sau', price: 1800000, total: 12, category: 'PHANH', image: '/images/phanhchongtang.jpg' },
];

const Products: React.FC = () => {
    const notification = useNotification();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [showAddModal, setShowAddModal] = useState(false);

    const categories = [
        { id: 'ALL', label: 'Tất cả' },
        { id: 'CABIN', label: 'CABIN' },
        { id: 'ĐỘNG CƠ', label: 'ĐỘNG CƠ' },
        { id: 'LY HỢP', label: 'LY HỢP' },
        { id: 'PHANH', label: 'PHANH' },
    ];

    const filteredProducts = mockProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.code.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeTab === 'ALL' || p.category === activeTab;
        return matchesSearch && matchesCategory;
    });

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
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight uppercase">Danh mục phụ tùng</h1>
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

            {/* Scientific Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border-2 ${activeTab === cat.id
                            ? 'bg-primary border-primary text-white shadow-md'
                            : 'bg-white border-slate-100 text-slate-500 hover:border-primary/30'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
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
                            onChange={(e) => setSearch(e.target.value)}
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
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
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
                                            <span className="badge badge-gray">{product.category}</span>
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

            {/* Catalog Info Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <p className="text-slate-500 text-sm">
                    Đang hiển thị <span className="font-bold text-slate-800">{filteredProducts.length}</span> trên tổng số <span className="font-bold text-slate-800">{mockProducts.length}</span> mặt hàng trong danh mục
                </p>
            </div>

            {showAddModal && (
                <AddProductModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={(product) => {
                        // In production, call API to add product
                        console.log('Adding product:', product);
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default Products;
