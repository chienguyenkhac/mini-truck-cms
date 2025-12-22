import React, { useState } from 'react';

interface EditCustomerModalProps {
    customerId: number;
    onClose: () => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ customerId, onClose }) => {
    const [formData, setFormData] = useState({
        code: `KH${String(customerId).padStart(3, '0')}`,
        name: 'Công ty TNHH ABC',
        phone: '0901234567',
        email: 'contact@abc.com',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        person: 'Nguyễn Văn A',
        bulk: true,
        monthly_discount: 5,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Khách hàng đã được cập nhật');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Sửa khách hàng</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Mã khách hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Tên khách hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Người liên hệ</label>
                        <input
                            type="text"
                            value={formData.person}
                            onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Giảm giá hàng tháng (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.monthly_discount}
                                onChange={(e) => setFormData({ ...formData, monthly_discount: Number(e.target.value) })}
                                className="input"
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.bulk}
                                    onChange={(e) => setFormData({ ...formData, bulk: e.target.checked })}
                                    className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-slate-700">Khách hàng sỉ</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium">
                            Hủy
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium">
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCustomerModal;

