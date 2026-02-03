import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useNotification } from './shared/Notification';
import { productService, categoryService, imageService, productImageService, Category } from '../services/supabase';

interface UploadedImage {
    id?: number;
    url: string;
    isNew?: boolean;
}

interface AddProductModalProps {
    onClose: () => void;
    onAdd?: (product: any) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAdd }) => {
    const notification = useNotification();
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        category_id: 0,
        vehicle_ids: [] as number[],
        manufacturer_code: '',
        description: 'SINOTRUK HÀ NỘI nhập khẩu trực tiếp từ Trung Quốc. Cam kết 100% hàng chính hãng, bảo hành theo tiêu chuẩn nhà sản xuất.',
        show_on_homepage: true,
    });
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load categories from Supabase
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

    // Separate categories: Part categories vs Vehicle types
    const partCategories = useMemo(() =>
        categories.filter(c => !c.is_vehicle_name),
        [categories]
    );

    const vehicleCategories = useMemo(() =>
        categories.filter(c => c.is_vehicle_name),
        [categories]
    );

    // Handle vehicle checkbox toggle
    const handleVehicleToggle = (vehicleId: number) => {
        setFormData(prev => ({
            ...prev,
            vehicle_ids: prev.vehicle_ids.includes(vehicleId)
                ? prev.vehicle_ids.filter(id => id !== vehicleId)
                : [...prev.vehicle_ids, vehicleId]
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.size > 5 * 1024 * 1024) {
                notification.error(`Ảnh ${file.name} quá lớn. Tối đa 5MB.`);
                failCount++;
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
                    body: JSON.stringify({ image: base64Image, fileName: file.name }),
                });

                const result = await response.json();

                if (!response.ok) {
                    console.error('Upload failed:', result);
                    const errorMsg = result.error || result.message || response.statusText;
                    const bucketInfo = result.availableBuckets ? ` (Buckets: ${result.availableBuckets})` : '';
                    throw new Error(`${errorMsg}${bucketInfo}`);
                }

                setImages(prev => [...prev, { url: result.url, isNew: true }]);
                successCount++;
            } catch (error: any) {
                console.error('Error uploading image:', error);
                notification.error(`Lỗi tải ảnh ${file.name}: ${error.message}`);
                failCount++;
            }
        }

        setIsUploading(false);
        if (successCount > 0 && failCount === 0) {
            notification.success('Đã tải bộ ảnh lên thành công');
        } else if (successCount > 0 && failCount > 0) {
            notification.success(`Đã tải ${successCount} ảnh, ${failCount} ảnh thất bại`);
        }
        e.target.value = ''; // Reset input
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.code) {
            notification.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create product first
            const thumbnail = images.length > 0 ? images[0].url : null;
            const newProduct = await productService.create({
                code: formData.code,
                name: formData.name,
                manufacturer_code: formData.manufacturer_code || null,
                category_id: formData.category_id || null,
                vehicle_ids: formData.vehicle_ids.length > 0 ? formData.vehicle_ids : undefined,
                description: formData.description,
                image: thumbnail,
                thumbnail: thumbnail,
                show_on_homepage: formData.show_on_homepage,
            });

            // Save images to images table and link to product
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                // Create image record
                const savedImage = await imageService.create(img.url);
                // Link to product
                await productImageService.addToProduct(
                    newProduct.id,
                    savedImage.id,
                    i === 0, // First image is primary
                    i
                );
            }

            notification.success('Sản phẩm đã được thêm thành công!');

            if (onAdd) {
                onAdd(newProduct);
            }

            onClose();
        } catch (error: any) {
            console.error('Error adding product:', error);
            notification.error('Không thể thêm sản phẩm: ' + (error.message || 'Lỗi không xác định'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-2xl font-bold text-slate-800">Thêm sản phẩm mới</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Danh mục phụ tùng
                            </label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                                className="input"
                            >
                                <option value={0}>Chọn danh mục</option>
                                {partCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Vehicle Types - Multi-select */}
                    {vehicleCategories.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Loại xe áp dụng <span className="text-slate-400 text-xs">(có thể chọn nhiều)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {vehicleCategories.map((vehicle) => (
                                    <label
                                        key={vehicle.id}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${formData.vehicle_ids.includes(vehicle.id)
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.vehicle_ids.includes(vehicle.id)}
                                            onChange={() => handleVehicleToggle(vehicle.id)}
                                            className="sr-only"
                                        />
                                        <span className="material-symbols-outlined text-sm">
                                            {formData.vehicle_ids.includes(vehicle.id) ? 'check_box' : 'check_box_outline_blank'}
                                        </span>
                                        <span className="text-sm font-medium">{vehicle.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

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

                    {/* Multi-Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Hình ảnh sản phẩm <span className="text-slate-400 text-xs">(có thể chọn nhiều ảnh)</span>
                        </label>

                        {/* Image Gallery */}
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

                            {/* Upload Button */}
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

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input min-h-[100px]"
                            placeholder="Mô tả chi tiết về sản phẩm..."
                        />
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
                                'Thêm sản phẩm'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AddProductModal;
