import React, { useState } from 'react';
import { useNotification } from './shared/Notification';

interface CreateOrderModalProps {
    onClose: () => void;
    onSave?: (orderData: any) => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onSave }) => {
    const notification = useNotification();
    const [formData, setFormData] = useState({
        tenphieu: '',
        customer: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSave) {
            onSave(formData);
        }
        notification.success('Đơn hàng đã được tạo thành công');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Tạo đơn hàng</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                                placeholder="Đơn hàng TQ #001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Khách hàng <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.customer}
                                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                className="input"
                            >
                                <option value="">Chọn khách hàng</option>
                                <option value="1">Công ty ABC</option>
                                <option value="2">Nguyễn Văn A</option>
                                <option value="3">Garage XYZ</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Ngày tạo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="input min-h-[100px]"
                            placeholder="Ghi chú về đơn hàng..."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium">
                            Hủy
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium">
                            Tạo đơn hàng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrderModal;





