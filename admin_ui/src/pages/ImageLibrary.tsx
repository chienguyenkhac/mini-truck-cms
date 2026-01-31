import React, { useState, useEffect } from 'react';
import { useNotification } from '../components/shared/Notification';
import ConfirmDeleteModal from '../components/shared/ConfirmDeleteModal';
import { supabase } from '../services/supabase';

interface GalleryImage {
    id: number;
    title: string | null;
    image_path: string;
    created_at: string;
}

const ITEMS_PER_PAGE = 20;

const ImageLibrary: React.FC = () => {
    const notification = useNotification();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [deleteImage, setDeleteImage] = useState<GalleryImage | null>(null);

    // Load images
    const loadImages = async () => {
        setLoading(true);
        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const response = await fetch(`${API_BASE}/gallery-images?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
            const result = await response.json();

            if (result.data) {
                setImages(result.data);
                setTotalCount(result.count || 0);
            } else if (Array.isArray(result)) {
                setImages(result);
                setTotalCount(result.length);
            }
        } catch (err) {
            console.error('Error loading images:', err);
            notification.error('Không thể tải danh sách ảnh');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadImages();
    }, [currentPage]);

    // Handle file upload
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        try {
            for (const file of Array.from(files)) {
                // Convert to base64
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                });
                reader.readAsDataURL(file);
                const base64 = await base64Promise;

                // Upload via API
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: base64,
                        fileName: file.name.replace(/\.[^/.]+$/, '')
                    })
                });

                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.message || 'Upload failed');
                }

                // Save to gallery_images table
                await supabase
                    .from('gallery_images')
                    .insert({
                        title: file.name.replace(/\.[^/.]+$/, ''),
                        image_path: result.url
                    })
                    .then((res: any) => {
                        if (res.error) throw res.error;
                    });
            }

            notification.success(`Đã upload ${files.length} ảnh thành công`);
            loadImages();
        } catch (err: any) {
            console.error('Upload error:', err);
            notification.error(err.message || 'Upload thất bại');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    // Handle delete
    const confirmDelete = async () => {
        if (!deleteImage) return;

        try {
            await supabase
                .from('gallery_images')
                .delete()
                .eq('id', deleteImage.id)
                .then((res: any) => {
                    if (res.error) throw res.error;
                });
            
            notification.success('Đã xóa ảnh');
            setDeleteImage(null);
            loadImages();
        } catch (err) {
            console.error('Delete error:', err);
            notification.error('Không thể xóa ảnh');
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Get image URL with proxy
    const getImageUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
        return `${API_BASE}/image?path=${encodeURIComponent(path)}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Thư viện ảnh</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý ảnh hiển thị trên trang thư viện</p>
                </div>

                {/* Upload Button */}
                <label className={`inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl cursor-pointer hover:bg-primary/90 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <span className="material-symbols-outlined text-xl">
                        {uploading ? 'sync' : 'add_photo_alternate'}
                    </span>
                    {uploading ? 'Đang upload...' : 'Upload ảnh'}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            </div>

            {/* Stats */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">photo_library</span>
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
                    <p className="text-slate-500 text-sm">Tổng số ảnh</p>
                </div>
            </div>

            {/* Image Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-200 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:border-primary/50 transition-all cursor-pointer"
                            onClick={() => setSelectedImage(img)}
                        >
                            <img
                                src={getImageUrl(img.image_path)}
                                alt={img.title || 'Gallery image'}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteImage(img); }}
                                    className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                                    title="Xóa"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">photo_library</span>
                    <p className="text-slate-500">Chưa có ảnh nào</p>
                    <p className="text-slate-400 text-sm mt-2">Bấm nút "Upload ảnh" để thêm ảnh mới</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            )}

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-4xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                        <img
                            src={getImageUrl(selectedImage.image_path)}
                            alt={selectedImage.title || 'Gallery image'}
                            className="w-full rounded-xl shadow-2xl"
                        />
                        {selectedImage.title && (
                            <p className="mt-4 text-center text-white text-lg">{selectedImage.title}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteImage && (
                <ConfirmDeleteModal
                    isOpen={!!deleteImage}
                    onClose={() => setDeleteImage(null)}
                    onConfirm={confirmDelete}
                    title="Xác nhận xóa ảnh"
                    message="Bạn có chắc chắn muốn xóa ảnh này khỏi thư viện?"
                    itemName={deleteImage.title || 'Ảnh không có tiêu đề'}
                />
            )}
        </div>
    );
};

export default ImageLibrary;
