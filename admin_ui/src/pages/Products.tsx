import React, { useState } from 'react';
import { useNotification } from '../components/shared/Notification';
import AddProductModal from '../components/AddProductModal';
import * as XLSX from 'xlsx';

// Mock products data - will be replaced with API
const mockProducts = [
    { id: 1, code: 'XLKVX', name: 'Xilanh kích cabin VX350', price: 850000, total: 15, category: 'CABIN' },
    { id: 2, code: 'TBTSI', name: 'Tăm bét trước SITRAK', price: 1200000, total: 8, category: 'ĐỘNG CƠ' },
    { id: 3, code: 'LDDC-A7', name: 'Lọc dầu động cơ HOWO A7', price: 350000, total: 25, category: 'ĐỘNG CƠ' },
    { id: 4, code: 'LC420', name: 'Lá côn HOWO 420', price: 2500000, total: 4, category: 'LY HỢP' },
    { id: 5, code: 'PTTS', name: 'Phanh tang trống sau', price: 1800000, total: 12, category: 'PHANH' },
];

const Products: React.FC = () => {
    const notification = useNotification();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredProducts = mockProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.code.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !categoryFilter ||
            (categoryFilter === 'cabin' && p.category === 'CABIN') ||
            (categoryFilter === 'dong-co' && p.category === 'ĐỘNG CƠ') ||
            (categoryFilter === 'ly-hop' && p.category === 'LY HỢP') ||
            (categoryFilter === 'phanh' && p.category === 'PHANH');
        return matchesSearch && matchesCategory;
    });

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredProducts);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sản phẩm');
        XLSX.writeFile(wb, `san-pham-${new Date().toISOString().split('T')[0]}.xlsx`);
        notification.success('Đã xuất file Excel thành công');
    };

    const handleEdit = (id: number) => {
        notification.info(`Sửa sản phẩm #${id}`);
    };

    const handleDelete = (id: number) => {
        notification.warning(`Xác nhận xóa sản phẩm #${id}?`);
        // In production, show confirmation modal before delete
        // For now, just show notification
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Sản phẩm</h1>
                    <p className="text-slate-500">Quản lý danh sách sản phẩm</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Thêm sản phẩm
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã sản phẩm..."
                            className="input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="input max-w-xs"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">Tất cả danh mục</option>
                        <option value="cabin">CABIN</option>
                        <option value="dong-co">ĐỘNG CƠ</option>
                        <option value="ly-hop">LY HỢP</option>
                        <option value="phanh">PHANH</option>
                    </select>
                    <button
                        onClick={handleExportExcel}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">download</span>
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="card p-0 overflow-hidden">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã SP</th>
                            <th>Tên sản phẩm</th>
                            <th>Giá lẻ</th>
                            <th>Tồn kho</th>
                            <th>Danh mục</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id}>
                                <td className="font-mono text-slate-800">{product.code}</td>
                                <td className="font-medium text-slate-800">{product.name}</td>
                                <td className="text-slate-600">{new Intl.NumberFormat('vi-VN').format(product.price)}đ</td>
                                <td>
                                    <span className={`font-medium ${product.total < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {product.total}
                                    </span>
                                </td>
                                <td>
                                    <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600 border border-slate-200">{product.category}</span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(product.id)}
                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                            title="Sửa"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-1 text-slate-400 hover:text-primary transition-colors"
                                            title="Xóa"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Info - Ẩn pagination, chỉ hiển thị thông tin */}
            <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm">
                    Hiển thị {filteredProducts.length} / {mockProducts.length} sản phẩm
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
