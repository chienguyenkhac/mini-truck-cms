import React, { useState } from 'react';

interface PaymentModalProps {
    customerId: number;
    customerCode: string;
    currentDebt: number;
    onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ customerCode, currentDebt, onClose }) => {
    const [formData, setFormData] = useState({
        amount: Math.abs(currentDebt),
        paymentMethod: 'cash',
        note: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Đã thanh toán ${new Intl.NumberFormat('vi-VN').format(formData.amount)}đ cho khách hàng ${customerCode}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Thanh toán công nợ</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-500 mb-1">Khách hàng</p>
                        <p className="font-bold text-slate-800">{customerCode}</p>
                        <p className="text-sm text-slate-500 mt-2 mb-1">Công nợ hiện tại</p>
                        <p className={`font-bold text-xl ${currentDebt > 0 ? 'text-green-600' : currentDebt < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                            {new Intl.NumberFormat('vi-VN').format(currentDebt)}đ
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Số tiền thanh toán <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            max={Math.abs(currentDebt)}
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phương thức thanh toán <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="input"
                        >
                            <option value="cash">Tiền mặt</option>
                            <option value="bank">Chuyển khoản</option>
                            <option value="card">Thẻ</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="input min-h-[100px]"
                            placeholder="Ghi chú về thanh toán..."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium">
                            Hủy
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium">
                            Xác nhận thanh toán
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;

