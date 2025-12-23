import React, { useState } from 'react';
import { useNotification } from './shared/Notification';

interface EditOrderModalProps {
    orderId: number;
    onClose: () => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ orderId, onClose }) => {
    const notification = useNotification();
    const [formData, setFormData] = useState({
        tenphieu: `Đơn hàng TQ #${String(orderId).padStart(3, '0')}`,
        money: 15000000,
        completed: false,
        lock: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        notification.success('Đơn hàng đã được cập nhật');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Sửa đơn hàng</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tên phiếu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.tenphieu}
                            onChange={(e) => setFormData({ ...formData, tenphieu: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tổng tiền <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            value={formData.money}
                            onChange={(e) => setFormData({ ...formData, money: Number(e.target.value) })}
                            className="input"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.completed}
                                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                                className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-slate-700">Hoàn thành</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.lock}
                                onChange={(e) => setFormData({ ...formData, lock: e.target.checked })}
                                className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-slate-700">Khóa</span>
                        </label>
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

export default EditOrderModal;


