import React, { useState } from 'react';
import { useNotification } from './shared/Notification';

interface AddProductModalProps {
    onClose: () => void;
    onAdd?: (product: any) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAdd }) => {
    const notification = useNotification();
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        price: 0,
        total: 0,
        category: '',
        description: '',
        image: '', // URL of the uploaded image
    });
    const [isUploading, setIsUploading] = useState(false);

    // Cloudinary configuration - Replace with real credentials
    const CLOUDINARY_UPLOAD_PRESET = 'antigravity_preset'; // Replace with user's preset
    const CLOUDINARY_CLOUD_NAME = 'dgv7d7n6q'; // Replace with user's cloud name

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: data,
                }
            );

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            setFormData({ ...formData, image: result.secure_url });
            notification.success('Tải ảnh lên thành công');
        } catch (error) {
            console.error('Error uploading image:', error);
            notification.error('Không thể tải ảnh lên. Vui lòng kiểm tra cấu hình Cloudinary.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onAdd) {
            onAdd(formData);
        }
        notification.success('Sản phẩm đã được thêm thành công');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-2xl font-bold text-slate-800">Thêm sản phẩm mới</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Mã sản phẩm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="input"
                                placeholder="VD: XLKVX"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Danh mục <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input"
                            >
                                <option value="">Chọn danh mục</option>
                                <option value="CABIN">CABIN</option>
                                <option value="ĐỘNG CƠ">ĐỘNG CƠ</option>
                                <option value="LY HỢP">LY HỢP</option>
                                <option value="PHANH">PHANH</option>
                                <option value="ĐIỆN">ĐIỆN</option>
                                <option value="THÂN XE">THÂN XE</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tên sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            placeholder="VD: Xilanh kích cabin VX350"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Giá lẻ (VNĐ) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="input"
                                placeholder="850000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Số lượng tồn kho <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.total}
                                onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                                className="input"
                                placeholder="10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Hình ảnh sản phẩm</label>
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary transition-colors cursor-pointer relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={isUploading}
                            />

                            {formData.image ? (
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-md">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-white text-xs font-bold">Thay đổi</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                    {isUploading ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                                            <span className="text-[10px] mt-1 font-bold">TẢI ẢNH</span>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex-1 flex flex-col justify-center h-24">
                                <p className="text-sm font-bold text-slate-700">
                                    {isUploading ? 'Đang tải lên...' : formData.image ? 'Đã tải ảnh lên' : 'Nhấn để chọn ảnh'}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Định dạng: JPG, PNG, WEBP. Tối đa 5MB.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input min-h-[100px]"
                            placeholder="Mô tả chi tiết về sản phẩm..."
                        />
                    </div>

                    {/* Preview */}
                    {formData.name && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-sm text-slate-500 mb-2">Xem trước</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-800">{formData.name}</p>
                                    <p className="text-xs text-slate-500">Mã: {formData.code || '---'} | Danh mục: {formData.category || '---'}</p>
                                </div>
                                <p className="font-bold text-primary text-lg">
                                    {new Intl.NumberFormat('vi-VN').format(formData.price)}đ
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
                        >
                            Thêm sản phẩm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
