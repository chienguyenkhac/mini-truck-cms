import React from 'react';

interface Notification {
    id: number;
    type: 'order' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

interface ViewAllNotificationsModalProps {
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: number) => void;
}

const ViewAllNotificationsModal: React.FC<ViewAllNotificationsModalProps> = ({ onClose, notifications, onMarkAsRead }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined">notifications</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Tất cả thông báo</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {notifications.length === 0 ? (
                        <div className="py-20 text-center text-slate-400">
                            <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">notifications_off</span>
                            <p className="text-lg">Không có thông báo nào</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => onMarkAsRead(notification.id)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer ${!notification.read
                                        ? 'bg-primary/5 border-primary/20 shadow-sm'
                                        : 'bg-white border-slate-100 hover:border-primary/30'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${notification.type === 'order'
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-800 text-white'
                                        }`}>
                                        <span className="material-symbols-outlined text-2xl">
                                            {notification.type === 'order' ? 'shopping_cart' : 'info'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-slate-800 text-lg">{notification.title}</h4>
                                            <span className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">{notification.time}</span>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed">{notification.message}</p>
                                        {!notification.read && (
                                            <div className="mt-3 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                                Mới
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewAllNotificationsModal;
