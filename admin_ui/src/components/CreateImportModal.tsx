import React, { useState } from 'react';

interface CreateImportModalProps {
    onClose: () => void;
    onSave?: (importData: any) => void;
}

const CreateImportModal: React.FC<CreateImportModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        tenphieu: '',
        supplier: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSave) {
            onSave(formData);
        }
        alert('Phiếu nhập kho đã được tạo thành công');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Tạo phiếu nhập kho</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Mã phiếu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.tenphieu}
                                onChange={(e) => setFormData({ ...formData, tenphieu: e.target.value })}
                                className="input"
                                placeholder="NK-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Nhà cung cấp <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.supplier}
                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                className="input"
                                placeholder="Nhà cung cấp A"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Ngày nhập <span className="text-red-500">*</span>
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
                            placeholder="Ghi chú về phiếu nhập..."
                        />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-600 mb-2">Danh sách sản phẩm nhập kho</p>
                        <button type="button" className="text-sm text-primary hover:text-primary-dark">
                            + Thêm sản phẩm
                        </button>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium">
                            Hủy
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium">
                            Tạo phiếu nhập
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateImportModal;

