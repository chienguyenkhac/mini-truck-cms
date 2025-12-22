import React, { useState } from 'react';
import CreateExportModal from '../components/CreateExportModal';
import * as XLSX from 'xlsx';

// Mock exports data
const mockExports = [
    { id: 1, tenphieu: 'XK-001', customer: 'Công ty ABC', money: 15000000, date: '2024-12-20', status: 'Hoàn thành' },
    { id: 2, tenphieu: 'XK-002', customer: 'Nguyễn Văn A', money: 8500000, date: '2024-12-21', status: 'Đang xử lý' },
    { id: 3, tenphieu: 'XK-003', customer: 'Garage XYZ', money: 25000000, date: '2024-12-22', status: 'Chờ duyệt' },
];

const Exports: React.FC = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const filteredExports = mockExports.filter(e => {
        const matchesSearch = e.tenphieu.toLowerCase().includes(search.toLowerCase()) ||
            e.customer.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || 
            (statusFilter === 'completed' && e.status === 'Hoàn thành') ||
            (statusFilter === 'processing' && e.status === 'Đang xử lý') ||
            (statusFilter === 'pending' && e.status === 'Chờ duyệt');
        return matchesSearch && matchesStatus;
    });

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredExports);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Xuất kho');
        XLSX.writeFile(wb, `xuat-kho-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleView = (id: number) => {
        alert(`Xem chi tiết phiếu xuất #${id}`);
    };

    const handleExportPDF = (id: number) => {
        alert(`Xuất PDF phiếu xuất #${id}`);
    };

    const handleEdit = (id: number) => {
        alert(`Sửa phiếu xuất #${id}`);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Xuất kho</h1>
                    <p className="text-slate-500">Quản lý phiếu xuất kho</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Tạo phiếu xuất
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã phiếu, khách hàng..."
                            className="input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select 
                        className="input max-w-xs"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="pending">Chờ duyệt</option>
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

            {/* Exports Table */}
            <div className="card p-0 overflow-hidden">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã phiếu</th>
                            <th>Khách hàng</th>
                            <th>Tổng tiền</th>
                            <th>Ngày xuất</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExports.map((exportItem) => (
                            <tr key={exportItem.id}>
                                <td className="font-mono text-slate-800">{exportItem.tenphieu}</td>
                                <td className="font-medium text-slate-800">{exportItem.customer}</td>
                                <td className="text-slate-600">{new Intl.NumberFormat('vi-VN').format(exportItem.money)}đ</td>
                                <td className="text-slate-600">{exportItem.date}</td>
                                <td>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        exportItem.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                                        exportItem.status === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {exportItem.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleView(exportItem.id)}
                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors" 
                                            title="Chi tiết"
                                        >
                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                        </button>
                                        <button 
                                            onClick={() => handleExportPDF(exportItem.id)}
                                            className="p-1 text-slate-400 hover:text-green-600 transition-colors" 
                                            title="Xuất PDF"
                                        >
                                            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(exportItem.id)}
                                            className="p-1 text-slate-400 hover:text-primary transition-colors" 
                                            title="Sửa"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Info */}
            <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm">
                    Hiển thị {filteredExports.length} / {mockExports.length} phiếu xuất
                </p>
            </div>

            {showCreateModal && <CreateExportModal onClose={() => setShowCreateModal(false)} />}
        </div>
    );
};

export default Exports;

