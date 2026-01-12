import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNotification } from './shared/Notification';
import { productService, categoryService, imageService, productImageService, Category, Product, ProductImage } from '../services/supabase';

interface CategoryWithVehicle extends Category {
    is_vehicle_name?: boolean;
}

interface UploadedImage {
    id?: number;
    url: string;
    isNew?: boolean;
    imageId?: number;
}

interface EditProductModalProps {
    product: Product;
    onClose: () => void;
    onSave?: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave }) => {
    const notification = useNotification();
    const [categories, setCategories] = useState<CategoryWithVehicle[]>([]);
    const [formData, setFormData] = useState({
        code: product.code || '',
        name: product.name || '',
        category_id: product.category_id || null,
        vehicle_ids: product.vehicle_ids || [],
        manufacturer_code: product.manufacturer_code || '',
        description: product.description || '',
        show_on_homepage: product.show_on_homepage !== false,
    });
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const catData = await categoryService.getAll();
                setCategories(catData);

                const productImages = await productImageService.getByProduct(product.id);
                const existingImages = productImages.map((pi: ProductImage) => ({
                    id: pi.id,
                    imageId: pi.image_id,
                    url: pi.image?.url || '',
                    isNew: false
                }));

                if (existingImages.length === 0 && product.image) {
                    setImages([{ url: product.image, isNew: false }]);
                } else {
                    setImages(existingImages);
                }
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };
        loadData();
    }, [product.id, product.image]);

    const vehicleCategories = categories.filter(c => c.is_vehicle_name);
    const partCategories = categories.filter(c => !c.is_vehicle_name);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.size > 5 * 1024 * 1024) {
                notification.error(`Ảnh ${file.name} quá lớn. Tối đa 5MB.`);
                continue;
            }

            try {
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const base64Image = await base64Promise;

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Image }),
                });

                if (!response.ok) throw new Error('Upload failed');

                const result = await response.json();
                setImages(prev => [...prev, { url: result.secure_url, isNew: true }]);
            } catch (error: any) {
                console.error('Error uploading image:', error);
                notification.error(`Không thể tải ảnh ${file.name}`);
            }
        }

        setIsUploading(false);
        notification.success('Đã tải ảnh lên');
        e.target.value = '';
    };

    const removeImage = async (index: number) => {
        const img = images[index];

        if (img.id && img.imageId) {
            try {
                await productImageService.removeFromProduct(product.id, img.imageId);
            } catch (err) {
                console.error('Error removing image:', err);
            }
        }

        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const toggleVehicle = (vehicleId: number) => {
        setFormData(prev => {
            const ids = prev.vehicle_ids.includes(vehicleId)
                ? prev.vehicle_ids.filter((id: number) => id !== vehicleId)
                : [...prev.vehicle_ids, vehicleId];
            return { ...prev, vehicle_ids: ids };
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
            const thumbnail = images.length > 0 ? images[0].url : null;
            await productService.update(product.id, {
                code: formData.code,
                name: formData.name,
                manufacturer_code: formData.manufacturer_code || null,
                category_id: formData.category_id,
                vehicle_ids: formData.vehicle_ids,
                description: formData.description,
                image: thumbnail,
                thumbnail: thumbnail,
                show_on_homepage: formData.show_on_homepage,
            });

            // Handle all images - update order and is_primary for existing, create new ones
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const isPrimary = i === 0;

                if (img.isNew) {
                    // New image - create and link to product
                    const savedImage = await imageService.create(img.url);
                    await productImageService.addToProduct(
                        product.id,
                        savedImage.id,
                        isPrimary,
                        i
                    );
                } else if (img.imageId) {
                    // Existing image - update sort_order and is_primary
                    await productImageService.updateOrder(product.id, img.imageId, i);
                    if (isPrimary) {
                        await productImageService.setPrimary(product.id, img.imageId);
                    }
                }
            }

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
                    {/* Row 1: Code + Manufacturer Code */}
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Mã nhà sản xuất
                            </label>
                            <input
                                type="text"
                                value={formData.manufacturer_code}
                                onChange={(e) => setFormData({ ...formData, manufacturer_code: e.target.value })}
                                className="input"
                                placeholder="VD: WEICHAI-612600130777"
                            />
                        </div>
                    </div>

                    {/* Row 2: Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Danh mục
                        </label>
                        <select
                            value={formData.category_id || 0}
                            onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) || null })}
                            className="input"
                        >
                            <option value={0}>Chọn danh mục</option>
                            {partCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Product Name */}
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

                    {/* Vehicle Categories - Multi Select */}
                    {vehicleCategories.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Dòng xe phù hợp
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {vehicleCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => toggleVehicle(cat.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.vehicle_ids.includes(cat.id)
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Multi-Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Hình ảnh sản phẩm <span className="text-slate-400 text-xs">(có thể chọn nhiều ảnh)</span>
                        </label>

                        <div className="grid grid-cols-4 gap-3 mb-3">
                            {images.map((img, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group">
                                    <img src={img.url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                                    {index === 0 && (
                                        <div className="absolute top-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                            CHÍNH
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            ))}

                            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-100">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                                {isUploading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-2xl text-slate-400">add_photo_alternate</span>
                                        <span className="text-[10px] text-slate-400 mt-1 font-bold">THÊM ẢNH</span>
                                    </>
                                )}
                            </label>
                        </div>
                        <p className="text-xs text-slate-400">Ảnh đầu tiên sẽ là ảnh đại diện. Định dạng: JPG, PNG, WEBP. Tối đa 5MB/ảnh.</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input min-h-[100px]"
                            placeholder="Mô tả chi tiết về sản phẩm..."
                        />
                    </div>

                    {/* Homepage Toggle */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <input
                            type="checkbox"
                            id="show_on_homepage"
                            checked={formData.show_on_homepage}
                            onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                            className="w-4 h-4 accent-primary"
                        />
                        <label htmlFor="show_on_homepage" className="text-sm text-slate-700">
                            Hiển thị trên trang chủ
                        </label>
                    </div>

                    {/* Actions */}
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
                            disabled={isSubmitting}
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
