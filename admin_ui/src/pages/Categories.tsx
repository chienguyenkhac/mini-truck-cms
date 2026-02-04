import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../components/shared/Notification';
import ConfirmDeleteModal from '../components/shared/ConfirmDeleteModal';
import { categoryService, Category } from '../services/supabase';

interface CategoryWithExtras extends Category {
    is_vehicle_name?: boolean;
    code?: string;
    thumbnail?: string;
    is_visible?: boolean;
}

const Categories: React.FC = () => {
    const notification = useNotification();
    const [categories, setCategories] = useState<CategoryWithExtras[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [_loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteCategory, setDeleteCategory] = useState<CategoryWithExtras | null>(null);
    const [productCount, setProductCount] = useState<number>(0);

    // New category form - use 'type' field: 'vehicle' or 'part'
    const [newForm, setNewForm] = useState({
        name: '',
        code: '',
        type: 'part' as 'vehicle' | 'part', // Default to 'part' (Phụ tùng)
        is_visible: true,
        thumbnail: ''
    });

    // Edit form
    const [editForm, setEditForm] = useState({
        name: '',
        code: '',
        type: 'part' as 'vehicle' | 'part',
        is_visible: true,
        thumbnail: ''
    });

    // Upload to local server
    const uploadToLocal = async (file: File): Promise<string> => {
        // Convert file to base64
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

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.url;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadToLocal(file);
            if (isEdit) {
                setEditForm({ ...editForm, thumbnail: url });
            } else {
                setNewForm({ ...newForm, thumbnail: url });
            }
            notification.success('Đã tải ảnh lên thành công');
        } catch (error) {
            console.error('Upload error:', error);
            notification.error('Không thể tải ảnh lên');
        } finally {
            setUploading(false);
        }
    };

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (err) {
            console.error('Error loading categories:', err);
            notification.error('Không thể tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleAddCategory = async () => {
        if (!newForm.name.trim()) {
            notification.warning(newForm.type === 'vehicle' ? 'Vui lòng nhập mã xe' : 'Vui lòng nhập tên danh mục');
            return;
        }

        // Validate: If type is 'vehicle', thumbnail is required
        if (newForm.type === 'vehicle' && !newForm.thumbnail) {
            notification.warning('Vui lòng upload ảnh đại diện cho xe');
            return;
        }

        try {
            await categoryService.create({
                name: newForm.name.toUpperCase(),
                code: newForm.code.toUpperCase() || undefined,
                is_vehicle_name: newForm.type === 'vehicle',
                is_visible: newForm.is_visible,
                thumbnail: newForm.thumbnail || undefined
            });
            notification.success(`Đã thêm ${newForm.type === 'vehicle' ? 'xe' : 'danh mục'} "${newForm.name}"`);
            setNewForm({ name: '', code: '', type: 'part', is_visible: true, thumbnail: '' });
            setIsAdding(false);
            loadCategories();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (cat: CategoryWithExtras) => {
        setEditingId(cat.id);
        setEditForm({
            name: cat.name,
            code: cat.code || '',
            type: cat.is_vehicle_name ? 'vehicle' : 'part',
            is_visible: cat.is_visible !== false,
            thumbnail: cat.thumbnail || ''
        });
    };

    const handleSaveEdit = async () => {
        if (!editForm.name.trim() || !editingId) return;

        // Validate: If type is 'vehicle', thumbnail is required
        if (editForm.type === 'vehicle' && !editForm.thumbnail) {
            notification.warning('Vui lòng upload ảnh đại diện cho xe');
            return;
        }

        try {
            await categoryService.update(editingId, {
                name: editForm.name.toUpperCase(),
                code: editForm.code.toUpperCase() || undefined,
                is_vehicle_name: editForm.type === 'vehicle',
                is_visible: editForm.is_visible,
                thumbnail: editForm.thumbnail || undefined
            });
            notification.success('Đã cập nhật danh mục');
            setEditingId(null);
            loadCategories();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleToggleVisibility = async (cat: CategoryWithExtras) => {
        try {
            await categoryService.update(cat.id, { is_visible: cat.is_visible === false });
            notification.success(cat.is_visible === false ? 'Đã hiển thị danh mục' : 'Đã ẩn danh mục');
            loadCategories();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra');
        }
    };

    // Count products in category before showing delete modal
    const handleDeleteClick = async (cat: CategoryWithExtras) => {
        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const response = await fetch(`${API_BASE}/products?category_id=${cat.id}`);
            const products = await response.json();
            const count = Array.isArray(products) ? products.length : 0;
            setProductCount(count);
            setDeleteCategory(cat);
        } catch (error) {
            console.error('Error counting products:', error);
            setProductCount(0);
            setDeleteCategory(cat);
        }
    };

    const confirmDelete = async () => {
        if (!deleteCategory) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/categories/${deleteCategory.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Có lỗi xảy ra');
            }
            
            // Show success message with info about affected products
            if (result.productsAffected > 0) {
                notification.success(
                    `Đã xóa "${deleteCategory.name}". ${result.productsAffected} sản phẩm đã được chuyển sang trạng thái "Không có danh mục".`
                );
            } else {
                notification.success(`Đã xóa "${deleteCategory.name}"`);
            }
            
            setDeleteCategory(null);
            setProductCount(0);
            loadCategories();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra');
        }
    };

    // Filter categories by search term
    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );

    const vehicleCategories = filteredCategories.filter(c => c.is_vehicle_name);
    const partCategories = filteredCategories.filter(c => !c.is_vehicle_name);

    const renderCategoryCard = (cat: CategoryWithExtras, isVehicle: boolean) => (
        <div key={cat.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${cat.is_visible === false ? 'bg-slate-100 border-slate-200 opacity-60' :
            isVehicle ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
            }`}>
            {editingId === cat.id ? (
                <div className="flex flex-wrap items-center gap-2 w-full">
                    {/* Thumbnail upload for edit - only show for vehicle type */}
                    {editForm.type === 'vehicle' && (
                        <div className="relative group">
                            {editForm.thumbnail ? (
                                <img src={editForm.thumbnail} alt="Thumbnail" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-400 text-base">image</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => editFileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={uploading}
                                title="Thay đổi ảnh"
                            >
                                {uploading ? (
                                    <span className="text-white text-xs">...</span>
                                ) : (
                                    <span className="material-symbols-outlined text-white text-base">edit</span>
                                )}
                            </button>
                            <input
                                ref={editFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, true)}
                                className="hidden"
                            />
                        </div>
                    )}
                    
                    {/* Form inputs - compact and organized */}
                    <div className="flex items-center gap-2 flex-1">
                        <input
                            type="text"
                            placeholder={editForm.type === 'vehicle' ? 'Mã xe' : 'Tên danh mục'}
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="input py-2 px-3 text-sm flex-1 min-w-[120px] border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <input
                            type="text"
                            placeholder={editForm.type === 'vehicle' ? 'Hãng xe' : 'Mã'}
                            value={editForm.code}
                            onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                            className="input py-2 px-3 text-sm w-28 border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <select
                            value={editForm.type}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'vehicle' | 'part' })}
                            className="input py-2 px-3 text-sm w-32 border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            <option value="vehicle">🚛 Xe</option>
                            <option value="part">🔧 Phụ tùng</option>
                        </select>
                    </div>

                    {/* Actions group */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={editForm.is_visible} 
                                onChange={(e) => setEditForm({ ...editForm, is_visible: e.target.checked })}
                                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                            />
                            <span className="text-xs font-medium text-slate-600">Hiển thị</span>
                        </label>
                        <button 
                            onClick={handleSaveEdit} 
                            className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm"
                            title="Lưu"
                        >
                            <span className="material-symbols-outlined text-base">check</span>
                            <span className="text-xs font-medium">Lưu</span>
                        </button>
                        <button 
                            onClick={() => setEditingId(null)} 
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Hủy"
                        >
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Thumbnail display */}
                    {cat.thumbnail ? (
                        <img src={cat.thumbnail} alt={cat.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-slate-400 text-lg">{isVehicle ? 'local_shipping' : 'category'}</span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={`font-medium ${isVehicle ? 'text-blue-700' : 'text-slate-700'}`}>{cat.name}</span>
                            {cat.code && (
                                <span className="text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 font-mono">
                                    {isVehicle ? `Hãng: ${cat.code}` : cat.code}
                                </span>
                            )}
                            <span className={`text-xs px-1.5 py-0.5 rounded ${isVehicle ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                {isVehicle ? 'Xe' : 'Phụ tùng'}
                            </span>
                            {cat.is_visible === false && (
                                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Ẩn</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleToggleVisibility(cat)}
                            className={`p-1.5 rounded-lg transition-colors ${cat.is_visible === false ? 'text-green-600 hover:bg-green-100' : 'text-slate-400 hover:bg-slate-200'}`}
                            title={cat.is_visible === false ? 'Hiển thị' : 'Ẩn'}
                        >
                            <span className="material-symbols-outlined text-sm">{cat.is_visible === false ? 'visibility' : 'visibility_off'}</span>
                        </button>
                        <button onClick={() => handleEdit(cat)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDeleteClick(cat)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight uppercase">Quản lý danh mục</h1>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Thêm danh mục
                </button>
            </div>

            {/* Search Box */}
            <div className="card">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục theo tên hoặc mã..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input w-full"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Add Category Form */}
            {isAdding && (
                <div className="card">
                    <h3 className="font-bold text-slate-800 mb-4">Thêm danh mục mới</h3>

                    {/* Type Dropdown - First */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Loại danh mục *</label>
                        <select
                            value={newForm.type}
                            onChange={(e) => setNewForm({ ...newForm, type: e.target.value as 'vehicle' | 'part' })}
                            className="input w-40"
                        >
                            <option value="part">Phụ tùng</option>
                            <option value="vehicle">Xe</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {newForm.type === 'vehicle' ? 'Mã xe *' : 'Tên danh mục *'}
                            </label>
                            <input
                                type="text"
                                placeholder={newForm.type === 'vehicle' ? 'VD: ACX, F123, NBSA' : 'VD: ĐỘNG CƠ, PHANH'}
                                value={newForm.name}
                                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                                className="input w-full"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {newForm.type === 'vehicle' ? 'Hãng xe' : 'Mã danh mục'}
                            </label>
                            <input
                                type="text"
                                placeholder={newForm.type === 'vehicle' ? 'VD: HOWO, CHENGLONG, SITRAK' : 'VD: DC, PHK (tùy chọn)'}
                                value={newForm.code}
                                onChange={(e) => setNewForm({ ...newForm, code: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    {/* Thumbnail Upload - Only show when type is 'vehicle' */}
                    {newForm.type === 'vehicle' && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <label className="block text-sm font-medium text-blue-700 mb-2">
                                Ảnh xe * <span className="text-red-500">(Bắt buộc)</span>
                            </label>
                            <div className="flex items-center gap-4">
                                {newForm.thumbnail ? (
                                    <div className="relative">
                                        <img src={newForm.thumbnail} alt="Preview" className="w-24 h-24 rounded-xl object-cover border-2 border-blue-300" />
                                        <button
                                            type="button"
                                            onClick={() => setNewForm({ ...newForm, thumbnail: '' })}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                        >
                                            <span className="material-symbols-outlined text-xs">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 rounded-xl border-2 border-dashed border-red-400 bg-red-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                                    >
                                        {uploading ? (
                                            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-red-400 text-2xl">add_photo_alternate</span>
                                                <span className="text-xs text-red-400 mt-1">Bắt buộc</span>
                                            </>
                                        )}
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, false)}
                                    className="hidden"
                                />
                                <div className="text-sm text-blue-600">
                                    <p>Ảnh sẽ hiển thị trên trang chủ</p>
                                    <p className="text-xs text-blue-400">JPG, PNG, tối đa 5MB</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-green-50 rounded-xl border border-green-200 hover:border-green-400 transition-colors">
                            <input
                                type="checkbox"
                                checked={newForm.is_visible}
                                onChange={(e) => setNewForm({ ...newForm, is_visible: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="font-medium text-green-700 text-sm">Hiển thị trên website</span>
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleAddCategory}
                            disabled={uploading}
                            className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            Lưu
                        </button>
                        <button
                            onClick={() => { setIsAdding(false); setNewForm({ name: '', code: '', type: 'part', is_visible: true, thumbnail: '' }); }}
                            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Vehicle Categories */}
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    <h3 className="font-bold text-slate-800">Danh mục Xe ({vehicleCategories.length})</h3>
                </div>
                {vehicleCategories.length > 0 ? (
                    <div className="grid gap-2">
                        {vehicleCategories.map(cat => renderCategoryCard(cat, true))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">Chưa có danh mục xe nào</p>
                )}
            </div>

            {/* Part Categories */}
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">category</span>
                    <h3 className="font-bold text-slate-800">Danh mục Phụ tùng ({partCategories.length})</h3>
                </div>
                {partCategories.length > 0 ? (
                    <div className="grid gap-2">
                        {partCategories.map(cat => renderCategoryCard(cat, false))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">Chưa có danh mục phụ tùng nào</p>
                )}
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 px-2 text-slate-500 text-sm">
                <span className="material-symbols-outlined text-lg">info</span>
                <span>Tổng cộng <span className="font-bold text-slate-800">{categories.length}</span> danh mục.</span>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteCategory && (
                <ConfirmDeleteModal
                    isOpen={!!deleteCategory}
                    onClose={() => { setDeleteCategory(null); setProductCount(0); }}
                    onConfirm={confirmDelete}
                    title="Xác nhận xóa danh mục"
                    message={
                        productCount > 0 
                            ? `Danh mục này đang có ${productCount} sản phẩm. Các sản phẩm sẽ được chuyển sang trạng thái "Không có danh mục" (không bị xóa). Bạn có chắc chắn muốn xóa danh mục này?`
                            : "Bạn có chắc chắn muốn xóa danh mục này?"
                    }
                    itemName={deleteCategory.name}
                />
            )}
        </div>
    );
};

export default Categories;
