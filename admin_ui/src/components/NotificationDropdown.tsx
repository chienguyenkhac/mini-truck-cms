import React, { useState, useEffect, useRef } from 'react';
import ViewAllNotificationsModal from './ViewAllNotificationsModal';

interface Notification {
    id: number;
    type: 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, type: 'system', title: 'Bảo trì định kỳ', message: 'Hệ thống sẽ bảo trì vào 23:00 tối nay', time: '10 phút trước', read: false },
        { id: 2, type: 'system', title: 'Cập nhật Catalog', message: 'Đã cập nhật 20 sản phẩm mới vào danh mục CABIN', time: '1 giờ trước', read: false },
        { id: 3, type: 'system', title: 'Thông báo hệ thống', message: 'Chào mừng bạn đến với Sinotruk Admin Panel', time: '5 giờ trước', read: true },
    ]);
    const [showAllModal, setShowAllModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Simulate system notifications (optional, removed order simulation)
    useEffect(() => {
        // ... simplified or removed as per request
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:text-primary transition-colors"
            >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-primary hover:text-primary-dark transition-colors"
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2 block">notifications_off</span>
                                <p>Không có thông báo</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600">
                                            <span className="material-symbols-outlined text-xl">
                                                info
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-slate-800 text-sm">{notification.title}</h4>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-slate-600 text-xs mb-1">{notification.message}</p>
                                            <p className="text-slate-400 text-[10px]">{notification.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-200 text-center">
                            <button
                                onClick={() => {
                                    setShowAllModal(true);
                                    setIsOpen(false);
                                }}
                                className="text-sm font-bold text-primary hover:text-primary-dark transition-colors px-4 py-1"
                            >
                                Xem tất cả
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showAllModal && (
                <ViewAllNotificationsModal
                    notifications={notifications}
                    onClose={() => setShowAllModal(false)}
                    onMarkAsRead={markAsRead}
                />
            )}
        </div>
    );
};

export default NotificationDropdown;





