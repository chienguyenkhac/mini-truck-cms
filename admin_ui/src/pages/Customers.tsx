import React, { useState } from 'react';
import AddCustomerModal from '../components/AddCustomerModal';
import ViewCustomerModal from '../components/ViewCustomerModal';
import PaymentModal from '../components/PaymentModal';
import EditCustomerModal from '../components/EditCustomerModal';

const mockCustomers = [
    { id: 1, code: 'KH001', name: 'Công ty TNHH ABC', phone: '0901234567', money: 15000000, bulk: true },
    { id: 2, code: 'KH002', name: 'Nguyễn Văn A', phone: '0912345678', money: -5000000, bulk: false },
    { id: 3, code: 'KH003', name: 'Garage XYZ', phone: '0923456789', money: 0, bulk: true },
];

const Customers: React.FC = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewingCustomer, setViewingCustomer] = useState<number | null>(null);
    const [payingCustomer, setPayingCustomer] = useState<{ id: number; code: string; debt: number } | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<number | null>(null);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Khách hàng</h1>
                    <p className="text-slate-500">Quản lý thông tin khách hàng & công nợ</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Thêm khách hàng
                </button>
            </div>

            {showAddModal && <AddCustomerModal onClose={() => setShowAddModal(false)} />}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl">people</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">Tổng khách hàng</p>
                        <p className="text-slate-800 text-2xl font-bold tracking-tight">240</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-white text-2xl">storefront</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">Khách sỉ</p>
                        <p className="text-slate-800 text-2xl font-bold tracking-tight">85</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-white text-2xl">account_balance</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">Tổng công nợ</p>
                        <p className="text-slate-800 text-2xl font-bold tracking-tight">₫125M</p>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="card p-0 overflow-hidden">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã KH</th>
                            <th>Tên khách hàng</th>
                            <th>Điện thoại</th>
                            <th>Loại</th>
                            <th>Công nợ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockCustomers.map((customer) => (
                            <tr key={customer.id}>
                                <td className="font-mono text-slate-800">{customer.code}</td>
                                <td className="font-medium text-slate-800">{customer.name}</td>
                                <td className="text-slate-600">{customer.phone}</td>
                                <td>
                                    <span className={`px-2 py-1 rounded text-xs ${customer.bulk ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {customer.bulk ? 'Sỉ' : 'Lẻ'}
                                    </span>
                                </td>
                                <td>
                                    <span className={customer.money > 0 ? 'text-green-600' : customer.money < 0 ? 'text-red-600' : 'text-slate-500'}>
                                        {new Intl.NumberFormat('vi-VN').format(customer.money)}đ
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setViewingCustomer(customer.id)}
                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors" 
                                            title="Xem chi tiết"
                                        >
                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                        </button>
                                        <button 
                                            onClick={() => setPayingCustomer({ id: customer.id, code: customer.code, debt: customer.money })}
                                            className="p-1 text-slate-400 hover:text-green-600 transition-colors" 
                                            title="Thanh toán"
                                        >
                                            <span className="material-symbols-outlined text-lg">payments</span>
                                        </button>
                                        <button 
                                            onClick={() => setEditingCustomer(customer.id)}
                                            className="p-1 text-slate-400 hover:text-yellow-600 transition-colors" 
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

            {showAddModal && <AddCustomerModal onClose={() => setShowAddModal(false)} />}
            {viewingCustomer && <ViewCustomerModal customerId={viewingCustomer} onClose={() => setViewingCustomer(null)} />}
            {payingCustomer && (
                <PaymentModal 
                    customerId={payingCustomer.id}
                    customerCode={payingCustomer.code}
                    currentDebt={payingCustomer.debt}
                    onClose={() => setPayingCustomer(null)} 
                />
            )}
            {editingCustomer && <EditCustomerModal customerId={editingCustomer} onClose={() => setEditingCustomer(null)} />}
        </div>
    );
};

export default Customers;
