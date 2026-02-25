import React, { useState, useEffect } from 'react';

interface HeaderProps {
    onMenuClick?: () => void;
}

const ADMIN_NAME_KEY = 'sinotruk_admin_name';
const ADMIN_AVATAR_KEY = 'sinotruk_admin_avatar';

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [adminName, setAdminName] = useState(() => localStorage.getItem(ADMIN_NAME_KEY) || 'Admin');
    const [adminAvatar, setAdminAvatar] = useState(() => localStorage.getItem(ADMIN_AVATAR_KEY) || '');

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Listen for localStorage changes (when Sidebar updates profile)
    useEffect(() => {
        const handleStorageChange = () => {
            setAdminName(localStorage.getItem(ADMIN_NAME_KEY) || 'Admin');
            setAdminAvatar(localStorage.getItem(ADMIN_AVATAR_KEY) || '');
        };

        // Custom event for same-tab updates
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('profileUpdate', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('profileUpdate', handleStorageChange);
        };
    }, []);

    const formattedDate = currentTime.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const formattedTime = currentTime.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <>
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
                {/* Left Section */}
                <div className="flex items-center gap-3">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-2 text-slate-500 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                    >
                        <span className="material-symbols-outlined text-xl">menu</span>
                    </button>

                    {/* Welcome Message */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
                                {adminAvatar ? (
                                    <img src={adminAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-white text-lg">person</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400">Xin chào,</span>
                                <span className="text-sm font-bold text-slate-800 leading-tight">{adminName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Date & Time */}
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-sm">calendar_today</span>
                            <span className="text-xs font-medium text-slate-600">{formattedDate}</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200"></div>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                            <span className="text-xs font-bold text-slate-700">{formattedTime}</span>
                        </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 rounded-xl border border-green-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wide hidden sm:inline">Online</span>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
