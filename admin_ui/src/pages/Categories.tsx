import React, { useState, useEffect } from 'react';
import { useNotification } from '../components/shared/Notification';
import { categoryService, Category } from '../services/supabase';

interface CategoryWithVehicle extends Category {
    is_vehicle_name?: boolean;
}

const Categories: React.FC = () => {
    const notification = useNotification();
    const [categories, setCategories] = useState<CategoryWithVehicle[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newIsVehicle, setNewIsVehicle] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editIsVehicle, setEditIsVehicle] = useState(false);
    const [_loading, setLoading] = useState(true);

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
        if (!newCategoryName.trim()) {
            notification.warning('Vui lòng nhập tên danh mục');
            return;
        }

        try {
            await categoryService.create(newCategoryName.toUpperCase(), newIsVehicle);
            notification.success(`Đã thêm danh mục "${newCategoryName}"`);
            setNewCategoryName('');
            setNewIsVehicle(false);
            setIsAdding(false);
            loadCategories();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (cat: CategoryWithVehicle) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditIsVehicle(cat.is_vehicle_name || false);
    };

    const handleSaveEdit = async () => {
        if (!editName.trim() || !editingId) return;

        try {
            await categoryService.update(editingId, editName.toUpperCase(), editIsVehicle);
            notification.success('Đã cập nhật danh mục');
            setEditingId(null);
            loadCategories();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteCategory = async (category: CategoryWithVehicle) => {
        if (confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
            try {
                await categoryService.delete(category.id);
                notification.success(`Đã xóa danh mục "${category.name}"`);
                loadCategories();
            } catch (error: any) {
                notification.error(error.message || 'Có lỗi xảy ra');
            }
        }
    };

    const vehicleCategories = categories.filter(c => c.is_vehicle_name);
    const partCategories = categories.filter(c => !c.is_vehicle_name);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight uppercase">Quản lý danh mục</h1>
                    <p className="text-slate-500 text-sm md:text-base italic">Tạo và quản lý các danh mục sản phẩm</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Thêm danh mục
                </button>
            </div>

            {/* Add Category Form */}
            {isAdding && (
                <div className="card">
                    <h3 className="font-bold text-slate-800 mb-4">Thêm danh mục mới</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Nhập tên danh mục (ví dụ: ĐỘNG CƠ hoặc HOWO)"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            className="input w-full"
                            autoFocus
                        />
                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary transition-colors">
                            <input
                                type="checkbox"
                                checked={newIsVehicle}
                                onChange={(e) => setNewIsVehicle(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <div>
                                <span className="font-medium text-slate-700">Đây là tên xe</span>
                                <p className="text-xs text-slate-400">Ví dụ: HOWO, SITRAK, SINOTRUK</p>
                            </div>
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddCategory}
                                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                            >
                                Lưu
                            </button>
                            <button
                                onClick={() => { setIsAdding(false); setNewCategoryName(''); setNewIsVehicle(false); }}
                                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Vehicle Categories */}
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    <h3 className="font-bold text-slate-800">Loại xe ({vehicleCategories.length})</h3>
                </div>
                {vehicleCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {vehicleCategories.map(cat => (
                            <div key={cat.id} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                                {editingId === cat.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="input py-1 px-2 text-sm w-32"
                                        />
                                        <label className="flex items-center gap-1 text-xs">
                                            <input type="checkbox" checked={editIsVehicle} onChange={(e) => setEditIsVehicle(e.target.checked)} />
                                            Xe
                                        </label>
                                        <button onClick={handleSaveEdit} className="text-green-600 hover:bg-green-100 p-1 rounded">
                                            <span className="material-symbols-outlined text-sm">check</span>
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="font-medium text-blue-700">{cat.name}</span>
                                        <button onClick={() => handleEdit(cat)} className="text-slate-400 hover:text-blue-600 p-1">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button onClick={() => handleDeleteCategory(cat)} className="text-slate-400 hover:text-red-500 p-1">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">Chưa có loại xe nào</p>
                )}
            </div>

            {/* Part Categories */}
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">category</span>
                    <h3 className="font-bold text-slate-800">Bộ phận ({partCategories.length})</h3>
                </div>
                {partCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {partCategories.map(cat => (
                            <div key={cat.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                                {editingId === cat.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="input py-1 px-2 text-sm w-32"
                                        />
                                        <label className="flex items-center gap-1 text-xs">
                                            <input type="checkbox" checked={editIsVehicle} onChange={(e) => setEditIsVehicle(e.target.checked)} />
                                            Xe
                                        </label>
                                        <button onClick={handleSaveEdit} className="text-green-600 hover:bg-green-100 p-1 rounded">
                                            <span className="material-symbols-outlined text-sm">check</span>
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="font-medium text-slate-700">{cat.name}</span>
                                        <button onClick={() => handleEdit(cat)} className="text-slate-400 hover:text-blue-600 p-1">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button onClick={() => handleDeleteCategory(cat)} className="text-slate-400 hover:text-red-500 p-1">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">Chưa có bộ phận nào</p>
                )}
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 px-2 text-slate-500 text-sm">
                <span className="material-symbols-outlined text-lg">info</span>
                <span>Tổng cộng <span className="font-bold text-slate-800">{categories.length}</span> danh mục.</span>
            </div>
        </div>
    );
};

export default Categories;
