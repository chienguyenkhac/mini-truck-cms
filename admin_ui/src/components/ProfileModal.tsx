import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ProfileModalProps {
    onClose: () => void;
    currentName: string;
    currentAvatar: string;
    onSave: (name: string, avatar: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, currentName, currentAvatar, onSave }) => {
    const [name, setName] = useState(currentName);
    const [avatar, setAvatar] = useState(currentAvatar);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => document.body.classList.remove('modal-open');
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setAvatar(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        onSave(name.trim() || 'Admin', avatar);
        onClose();
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">Chỉnh sửa hồ sơ</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-3">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden"
                        >
                            {avatar ? (
                                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-slate-400 text-3xl">add_a_photo</span>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-primary font-medium hover:underline"
                        >
                            {avatar ? 'Đổi ảnh' : 'Tải ảnh lên'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tên hiển thị</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên..."
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="p-5 border-t border-slate-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProfileModal;
