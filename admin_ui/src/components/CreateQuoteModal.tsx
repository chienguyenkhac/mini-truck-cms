import React, { useState } from 'react';

interface CreateQuoteModalProps {
    onClose: () => void;
    onSave?: (quote: any) => void;
}

const CreateQuoteModal: React.FC<CreateQuoteModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        customer: '',
        validUntil: '',
        note: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, call API
        if (onSave) {
            onSave(formData);
        }
        alert('Báo giá đã được tạo thành công');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Tạo báo giá</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Khách hàng <span className="text-red-500">*</span>
                            </label>
                            <select required className="input">
                                <option value="">Chọn khách hàng</option>
                                <option value="1">Công ty ABC</option>
                                <option value="2">Nguyễn Văn A</option>
                                <option value="3">Garage XYZ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Hiệu lực đến <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.validUntil}
                                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="input min-h-[100px]"
                            placeholder="Ghi chú về báo giá..."
                        />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-600 mb-2">Danh sách sản phẩm sẽ được thêm ở đây</p>
                        <button type="button" className="text-sm text-primary hover:text-primary-dark">
                            + Thêm sản phẩm
                        </button>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium">
                            Hủy
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium">
                            Tạo báo giá
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuoteModal;

