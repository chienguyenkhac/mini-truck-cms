import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNotification } from '../components/shared/Notification';
import ConfirmDeleteModal from '../components/shared/ConfirmDeleteModal';
import { catalogService, CatalogArticle } from '../services/supabase';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import ImageTool from '@editorjs/image';

const Catalogs: React.FC = () => {
    const notification = useNotification();
    const [articles, setArticles] = useState<CatalogArticle[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingArticle, setEditingArticle] = useState<CatalogArticle | null>(null);
    const [formData, setFormData] = useState({ title: '', slug: '' });
    const [_loading, setLoading] = useState(true);
    const [deleteArticle, setDeleteArticle] = useState<CatalogArticle | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const editorRef = useRef<EditorJS | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadArticles = async () => {
        setLoading(true);
        try {
            const data = await catalogService.getAll();
            setArticles(data);
        } catch (err) {
            console.error('Error loading articles:', err);
            notification.error('Không thể tải bài viết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArticles();
    }, []);

    // Upload image handler for EditorJS
    const uploadImageByFile = async (file: File) => {
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

            const result = await response.json();

            if (!response.ok) {
                console.error('Catalog upload failed:', result);
                const errorMsg = result.error || result.message || response.statusText;
                const bucketInfo = result.availableBuckets ? ` (Buckets: ${result.availableBuckets})` : '';
                throw new Error(`${errorMsg}${bucketInfo}`);
            }

            return {
                success: 1,
                file: { url: result.url }
            };
        } catch (error: any) {
            console.error('Error uploading catalog image:', error);
            notification.error(`Không thể tải ảnh lên: ${error.message}`);
            return { success: 0 };
        }
    };

    const uploadImageByUrl = async (url: string) => {
        return {
            success: 1,
            file: { url }
        };
    };

    const initEditor = useCallback((content?: object) => {
        if (editorRef.current) {
            editorRef.current.destroy();
        }

        if (editorContainerRef.current) {
            editorRef.current = new EditorJS({
                holder: editorContainerRef.current,
                tools: {
                    header: {
                        class: Header as any,
                        config: {
                            levels: [2, 3, 4],
                            defaultLevel: 2
                        },
                        inlineToolbar: true
                    },
                    list: {
                        class: List as any,
                        inlineToolbar: true,
                        config: {
                            defaultStyle: 'unordered'
                        }
                    },
                    paragraph: {
                        class: Paragraph as any,
                        inlineToolbar: true
                    },
                    image: {
                        class: ImageTool as any,
                        config: {
                            uploader: {
                                uploadByFile: uploadImageByFile,
                                uploadByUrl: uploadImageByUrl
                            }
                        }
                    }
                },
                data: content as any || { blocks: [] },
                placeholder: 'Bắt đầu viết nội dung...',
                autofocus: true,
                minHeight: 300,
            });
        }
    }, []);

    const handleNewArticle = () => {
        setEditingArticle(null);
        setFormData({ title: '', slug: '' });
        setIsEditing(true);
        setTimeout(() => initEditor(), 100);
    };

    const handleEditArticle = (article: CatalogArticle) => {
        setEditingArticle(article);
        setFormData({ title: article.title, slug: article.slug });
        setIsEditing(true);
        setTimeout(() => initEditor(article.content), 100);
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            notification.warning('Vui lòng nhập tiêu đề');
            return;
        }

        try {
            const content = await editorRef.current?.save();
            const slug = formData.slug || formData.title.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            if (editingArticle) {
                await catalogService.update(editingArticle.id, {
                    title: formData.title,
                    slug,
                    content: content || {}
                });
                notification.success('Đã cập nhật bài viết');
            } else {
                await catalogService.create({
                    title: formData.title,
                    slug,
                    content: content || {},
                    is_published: false
                });
                notification.success('Đã tạo bài viết mới');
            }

            setIsEditing(false);
            editorRef.current?.destroy();
            editorRef.current = null;
            loadArticles();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleTogglePublish = async (article: CatalogArticle) => {
        try {
            await catalogService.update(article.id, { is_published: !article.is_published });
            notification.success(article.is_published ? 'Đã ẩn bài viết' : 'Đã xuất bản bài viết');
            loadArticles();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const confirmDelete = async () => {
        if (!deleteArticle) return;
        try {
            await catalogService.delete(deleteArticle.id);
            notification.success('Đã xóa bài viết');
            setDeleteArticle(null);
            loadArticles();
        } catch (error: any) {
            notification.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        editorRef.current?.destroy();
        editorRef.current = null;
    };

    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800">
                        {editingArticle ? 'Sửa bài viết' : 'Tạo bài viết mới'}
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">save</span>
                            Lưu bài viết
                        </button>
                    </div>
                </div>

                <div className="card space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Tiêu đề bài viết <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input w-full"
                                placeholder="Nhập tiêu đề bài viết"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Slug (URL) <span className="text-slate-400 text-xs">(tự động tạo nếu để trống)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="input w-full"
                                placeholder="vi-du-slug-bai-viet"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nội dung bài viết
                        </label>
                        <div
                            ref={editorContainerRef}
                            className="border-2 border-slate-200 rounded-xl p-6 min-h-[400px] bg-white focus-within:border-primary transition-colors"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight uppercase">Bài viết</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="w-8 h-8 rounded-full border-2 border-slate-300 text-slate-400 hover:border-primary hover:text-primary flex items-center justify-center transition-colors"
                        title="Hướng dẫn sử dụng"
                    >
                        <span className="text-sm font-bold">?</span>
                    </button>
                    <button
                        onClick={handleNewArticle}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        Viết bài mới
                    </button>
                </div>
            </div>

            {/* Search Box */}
            <div className="card">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết theo tiêu đề..."
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

            {/* Articles List */}
            <div className="card p-0 overflow-hidden">
                <table className="admin-table w-full">
                    <thead>
                        <tr className="bg-slate-50">
                            <th>Tiêu đề</th>
                            <th className="w-32">Trạng thái</th>
                            <th className="w-40">Ngày tạo</th>
                            <th className="text-right px-6 w-36">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.length > 0 ? articles
                            .filter(article =>
                                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                article.slug.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(article => (
                                <tr key={article.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td>
                                        <p className="font-bold text-slate-800">{article.title}</p>
                                        <p className="text-xs text-slate-400">/{article.slug}</p>
                                    </td>
                                    <td>
                                        <span className={`badge ${article.is_published ? 'badge-green' : 'badge-gray'}`}>
                                            {article.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                                        </span>
                                    </td>
                                    <td className="text-sm text-slate-500">
                                        {new Date(article.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="text-right px-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleTogglePublish(article)}
                                                className={`p-2 rounded-lg transition-colors ${article.is_published ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={article.is_published ? 'Ẩn' : 'Xuất bản'}
                                            >
                                                <span className="material-symbols-outlined text-base">
                                                    {article.is_published ? 'visibility_off' : 'publish'}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => handleEditArticle(article)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Sửa"
                                            >
                                                <span className="material-symbols-outlined text-base">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setDeleteArticle(article)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <span className="material-symbols-outlined text-base">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                            <tr>
                                <td colSpan={4} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-50">
                                        <span className="material-symbols-outlined text-5xl">article</span>
                                        <p className="font-medium">Chưa có bài viết nào</p>
                                        <button onClick={handleNewArticle} className="text-primary font-bold hover:underline">
                                            Tạo bài viết đầu tiên
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDeleteModal
                isOpen={!!deleteArticle}
                onClose={() => setDeleteArticle(null)}
                onConfirm={confirmDelete}
                title="Xóa bài viết"
                message="Bạn có chắc chắn muốn xóa bài viết này?"
                itemName={deleteArticle?.title}
            />

            {/* Help Modal - rendered at root level via Portal */}
            {showHelp && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowHelp(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">Hướng dẫn sử dụng Editor</h3>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-slate-600">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary mt-0.5">edit</span>
                                <div>
                                    <p className="font-bold text-slate-800">Viết nội dung</p>
                                    <p className="text-sm">Click vào vùng soạn thảo và bắt đầu gõ nội dung bài viết.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary mt-0.5">add_circle</span>
                                <div>
                                    <p className="font-bold text-slate-800">Thêm block mới</p>
                                    <p className="text-sm">Nhấn <strong>Enter</strong> để tạo dòng mới. Click dấu <strong>+</strong> bên trái để thêm heading, list, hoặc ảnh.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary mt-0.5">format_bold</span>
                                <div>
                                    <p className="font-bold text-slate-800">Định dạng văn bản</p>
                                    <p className="text-sm">Bôi đen text rồi chọn <strong>Bold</strong>, <em>Italic</em>, hoặc <u>Link</u> từ thanh công cụ hiện ra.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary mt-0.5">image</span>
                                <div>
                                    <p className="font-bold text-slate-800">Chèn hình ảnh</p>
                                    <p className="text-sm">Click dấu <strong>+</strong> → chọn <strong>Image</strong> → upload ảnh hoặc paste URL.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary mt-0.5">drag_indicator</span>
                                <div>
                                    <p className="font-bold text-slate-800">Sắp xếp lại</p>
                                    <p className="text-sm">Kéo thả các block bằng icon <strong>⋮⋮</strong> bên trái để thay đổi thứ tự.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-green-500 mt-0.5">publish</span>
                                <div>
                                    <p className="font-bold text-slate-800">Xuất bản / Ẩn bài</p>
                                    <p className="text-sm">Bấm nút <span className="inline-flex items-center"><span className="material-symbols-outlined text-xs text-green-500">publish</span></span> để <strong>xuất bản</strong> bài viết lên trang khách hàng. Bấm nút <span className="inline-flex items-center"><span className="material-symbols-outlined text-xs text-red-500">visibility_off</span></span> để <strong>ẩn</strong> bài.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
                            >
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </div>, document.body
            )}
        </div>
    );
};

export default Catalogs;
