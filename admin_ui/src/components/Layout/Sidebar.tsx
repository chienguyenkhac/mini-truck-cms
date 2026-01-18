import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getProfile } from '../../lib/supabase';
import ProfileModal from '../ProfileModal';

const ADMIN_NAME_KEY = 'sinotruk_admin_name';
const ADMIN_AVATAR_KEY = 'sinotruk_admin_avatar';

const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
    const [adminName, setAdminName] = useState(() => localStorage.getItem(ADMIN_NAME_KEY) || 'Admin');
    const [adminAvatar, setAdminAvatar] = useState(() => localStorage.getItem(ADMIN_AVATAR_KEY) || '');
    const [adminUsername, setAdminUsername] = useState(() => localStorage.getItem('username') || '');
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Load profile from Supabase on mount
    useEffect(() => {
        const loadProfile = async () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                try {
                    const profile = await getProfile(parseInt(userId));
                    if (profile) {
                        setAdminName(profile.full_name);
                        setAdminUsername(profile.username);
                        localStorage.setItem(ADMIN_NAME_KEY, profile.full_name);
                        localStorage.setItem('username', profile.username);
                        if (profile.avatar) {
                            setAdminAvatar(profile.avatar);
                            localStorage.setItem(ADMIN_AVATAR_KEY, profile.avatar);
                        }
                        // Notify Header
                        window.dispatchEvent(new Event('profileUpdate'));
                    }
                } catch (error) {
                    console.error('Error loading profile:', error);
                }
            }
        };
        loadProfile();
    }, []);

    const handleSaveProfile = (name: string, avatar: string, username: string) => {
        setAdminName(name);
        setAdminAvatar(avatar);
        setAdminUsername(username);
        localStorage.setItem(ADMIN_NAME_KEY, name);
        localStorage.setItem(ADMIN_AVATAR_KEY, avatar);
        localStorage.setItem('username', username);
        window.dispatchEvent(new Event('profileUpdate'));
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-50 transform transition-transform duration-300 md:translate-x-0 admin-sidebar ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 text-primary">
                            <span className="material-symbols-outlined text-4xl font-bold">local_shipping</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-800 text-lg font-bold tracking-tight uppercase leading-tight">Sinotruk</span>
                            <span className="text-primary text-[10px] font-bold tracking-[0.15em] uppercase leading-tight">Admin</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavLink
                        to="/dashboard"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-700 hover:bg-slate-100'}`
                        }
                    >
                        <span className="material-symbols-outlined text-xl">dashboard</span>
                        <span className="font-medium">Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/products"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-700 hover:bg-slate-100'}`
                        }
                    >
                        <span className="material-symbols-outlined text-xl">inventory_2</span>
                        <span className="font-medium">Sản phẩm</span>
                    </NavLink>

                    <NavLink
                        to="/categories"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-700 hover:bg-slate-100'}`
                        }
                    >
                        <span className="material-symbols-outlined text-xl">category</span>
                        <span className="font-medium">Danh mục</span>
                    </NavLink>

                    <NavLink
                        to="/catalogs"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-700 hover:bg-slate-100'}`
                        }
                    >
                        <span className="material-symbols-outlined text-xl">article</span>
                        <span className="font-medium">Bài viết</span>
                    </NavLink>

                    <NavLink
                        to="/image-library"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-700 hover:bg-slate-100'}`
                        }
                    >
                        <span className="material-symbols-outlined text-xl">photo_library</span>
                        <span className="font-medium">Thư viện ảnh</span>
                    </NavLink>

                    <NavLink
                        to="/settings"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-700 hover:bg-slate-100'}`
                        }
                    >
                        <span className="material-symbols-outlined text-xl">settings</span>
                        <span className="font-medium">Cài đặt</span>
                    </NavLink>
                </nav>

                {/* User - Click to open profile modal */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div
                            onClick={() => setShowProfileModal(true)}
                            className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 flex-shrink-0 cursor-pointer overflow-hidden hover:border-primary transition-colors"
                            title="Click để chỉnh sửa hồ sơ"
                        >
                            {adminAvatar ? (
                                <img src={adminAvatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-slate-600 text-sm">person</span>
                            )}
                        </div>

                        <div
                            className="flex-1 min-w-0 cursor-pointer group"
                            onClick={() => setShowProfileModal(true)}
                            title="Click để chỉnh sửa hồ sơ"
                        >
                            <p className="text-slate-800 text-xs font-bold truncate group-hover:text-primary transition-colors">{adminName}</p>
                            <p className="text-slate-500 text-[10px] truncate">Quản trị</p>
                        </div>

                        <button
                            onClick={() => {
                                localStorage.removeItem('isAuthenticated');
                                localStorage.removeItem('username');
                                localStorage.removeItem('userId');
                                window.location.href = '/';
                            }}
                            className="text-slate-400 hover:text-primary transition-colors flex-shrink-0"
                            title="Đăng xuất"
                        >
                            <span className="material-symbols-outlined text-sm">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Profile Modal */}
            {showProfileModal && (
                <ProfileModal
                    onClose={() => setShowProfileModal(false)}
                    currentUsername={adminUsername}
                    currentName={adminName}
                    currentAvatar={adminAvatar}
                    onSave={handleSaveProfile}
                />
            )}
        </>
    );
};

export default Sidebar;
