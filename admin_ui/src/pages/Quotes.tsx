import React, { useState } from 'react';
import CreateQuoteModal from '../components/CreateQuoteModal';
import * as XLSX from 'xlsx';

// Mock quotes data
const mockQuotes = [
    { id: 1, code: 'BG-001', customer: 'Công ty ABC', money: 50000000, date: '2024-12-20', status: 'Đã gửi', validUntil: '2024-12-27' },
    { id: 2, code: 'BG-002', customer: 'Nguyễn Văn A', money: 25000000, date: '2024-12-21', status: 'Chờ duyệt', validUntil: '2024-12-28' },
    { id: 3, code: 'BG-003', customer: 'Garage XYZ', money: 75000000, date: '2024-12-22', status: 'Đã hủy', validUntil: '2024-12-29' },
];

const Quotes: React.FC = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const filteredQuotes = mockQuotes.filter(q => {
        const matchesSearch = q.code.toLowerCase().includes(search.toLowerCase()) ||
            q.customer.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || 
            (statusFilter === 'sent' && q.status === 'Đã gửi') ||
            (statusFilter === 'pending' && q.status === 'Chờ duyệt') ||
            (statusFilter === 'cancelled' && q.status === 'Đã hủy');
        return matchesSearch && matchesStatus;
    });

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredQuotes);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Báo giá');
        XLSX.writeFile(wb, `bao-gia-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleView = (id: number) => {
        alert(`Xem chi tiết báo giá #${id}`);
    };

    const handleExportPDF = (id: number) => {
        alert(`Xuất PDF báo giá #${id}`);
    };

    const handleEdit = (id: number) => {
        alert(`Sửa báo giá #${id}`);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Báo giá</h1>
                    <p className="text-slate-500">Quản lý báo giá cho khách hàng</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Tạo báo giá
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã báo giá, khách hàng..."
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
                        <option value="sent">Đã gửi</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="cancelled">Đã hủy</option>
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

            {/* Quotes Table */}
            <div className="card p-0 overflow-hidden">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã BG</th>
                            <th>Khách hàng</th>
                            <th>Giá trị</th>
                            <th>Ngày tạo</th>
                            <th>Hiệu lực đến</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQuotes.map((quote) => (
                            <tr key={quote.id}>
                                <td className="font-mono text-slate-800">{quote.code}</td>
                                <td className="font-medium text-slate-800">{quote.customer}</td>
                                <td className="text-slate-600">{new Intl.NumberFormat('vi-VN').format(quote.money)}đ</td>
                                <td className="text-slate-600">{quote.date}</td>
                                <td className="text-slate-600">{quote.validUntil}</td>
                                <td>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        quote.status === 'Đã gửi' ? 'bg-blue-100 text-blue-700' :
                                        quote.status === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {quote.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleView(quote.id)}
                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors" 
                                            title="Chi tiết"
                                        >
                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                        </button>
                                        <button 
                                            onClick={() => handleExportPDF(quote.id)}
                                            className="p-1 text-slate-400 hover:text-green-600 transition-colors" 
                                            title="Xuất PDF"
                                        >
                                            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(quote.id)}
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
                    Hiển thị {filteredQuotes.length} / {mockQuotes.length} báo giá
                </p>
            </div>

            {showCreateModal && <CreateQuoteModal onClose={() => setShowCreateModal(false)} />}
        </div>
    );
};

export default Quotes;

