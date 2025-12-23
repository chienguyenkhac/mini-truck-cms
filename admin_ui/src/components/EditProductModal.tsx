import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNotification } from './shared/Notification';
import { productService, categoryService, Category, Product } from '../services/supabase';

interface EditProductModalProps {
    product: Product;
    onClose: () => void;
    onSave?: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave }) => {
    const notification = useNotification();
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        code: product.code || '',
        name: product.name || '',
        price: product.price || 0,
        price_bulk: product.price_bulk || 0,
        total: product.total || 0,
        category_ids: product.category_ids || (product.category_id ? [product.category_id] : []),
        description: product.description || '',
        image: product.image || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data);
            } catch (err) {
                console.error('Error loading categories:', err);
            }
        };
        loadCategories();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            notification.error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
            return;
        }

        setIsUploading(true);

        try {
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const base64Image = await base64Promise;

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const result = await response.json();
            setFormData({ ...formData, image: result.secure_url });
            notification.success('Tải ảnh lên thành công!');
        } catch (error: any) {
            console.error('Error uploading image:', error);
            notification.error(error.message || 'Không thể tải ảnh lên.');
        } finally {
            setIsUploading(false);
        }
    };

    const toggleCategory = (categoryId: number) => {
        setFormData(prev => {
            const ids = prev.category_ids.includes(categoryId)
                ? prev.category_ids.filter(id => id !== categoryId)
                : [...prev.category_ids, categoryId];
            return { ...prev, category_ids: ids };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.code) {
            notification.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsSubmitting(true);

        try {
            await productService.update(product.id, {
                code: formData.code,
                name: formData.name,
                price: formData.price,
                price_bulk: formData.price_bulk,
                total: formData.total,
                category_id: formData.category_ids[0] || null,
                category_ids: formData.category_ids,
                description: formData.description,
                image: formData.image || null,
            });

            notification.success('Đã cập nhật sản phẩm thành công!');

            if (onSave) {
                onSave();
            }

            onClose();
        } catch (error: any) {
            console.error('Error updating product:', error);
            notification.error('Không thể cập nhật: ' + (error.message || 'Lỗi không xác định'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-2xl font-bold text-slate-800">Sửa sản phẩm</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

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
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tồn kho</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.total}
                                onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                                className="input"
                            />
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
                        />
                    </div>

                    {/* Multi-select Categories */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Danh mục (chọn nhiều)
                        </label>
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${formData.category_ids.includes(cat.id)
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    {formData.category_ids.includes(cat.id) && (
                                        <span className="material-symbols-outlined text-sm mr-1 align-middle">check</span>
                                    )}
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        {formData.category_ids.length === 0 && (
                            <p className="text-xs text-slate-400 mt-1">Click để chọn danh mục</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Giá lẻ (VNĐ)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Giá sỉ (VNĐ)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.price_bulk}
                                onChange={(e) => setFormData({ ...formData, price_bulk: Number(e.target.value) })}
                                className="input"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
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
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-white text-xs font-bold">Đổi</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                    {isUploading ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                                            <span className="text-[9px] font-bold">TẢI ẢNH</span>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex-1 flex flex-col justify-center h-20">
                                <p className="text-sm font-bold text-slate-700">
                                    {isUploading ? 'Đang tải lên...' : formData.image ? 'Đã có ảnh' : 'Nhấn để chọn ảnh'}
                                </p>
                                <p className="text-xs text-slate-400">JPG, PNG, WEBP. Max 5MB.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input min-h-[60px]"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isUploading}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                'Lưu thay đổi'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default EditProductModal;
