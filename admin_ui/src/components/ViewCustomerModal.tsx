import React from 'react';

interface ViewCustomerModalProps {
    customerId: number;
    onClose: () => void;
}

const ViewCustomerModal: React.FC<ViewCustomerModalProps> = ({ customerId, onClose }) => {
    // Mock customer data
    const customer = {
        id: customerId,
        code: `KH${String(customerId).padStart(3, '0')}`,
        name: 'Công ty TNHH ABC',
        phone: '0901234567',
        email: 'contact@abc.com',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        person: 'Nguyễn Văn A',
        money: 15000000,
        bulk: true,
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Chi tiết khách hàng</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Mã khách hàng</p>
                            <p className="font-bold text-slate-800">{customer.code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Tên khách hàng</p>
                            <p className="font-bold text-slate-800">{customer.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Số điện thoại</p>
                            <p className="font-bold text-slate-800">{customer.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Email</p>
                            <p className="font-bold text-slate-800">{customer.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Người liên hệ</p>
                            <p className="font-bold text-slate-800">{customer.person}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Loại</p>
                            <p className="font-bold text-slate-800">{customer.bulk ? 'Khách sỉ' : 'Khách lẻ'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-slate-500 mb-1">Địa chỉ</p>
                            <p className="font-bold text-slate-800">{customer.address}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Công nợ</p>
                            <p className={`font-bold text-xl ${customer.money > 0 ? 'text-green-600' : customer.money < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                {new Intl.NumberFormat('vi-VN').format(customer.money)}đ
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewCustomerModal;





