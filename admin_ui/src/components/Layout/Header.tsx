import React, { useState } from 'react';
import { useNotification } from '../shared/Notification';
import NotificationDropdown from '../NotificationDropdown';
import SettingsModal from '../SettingsModal';

const Header: React.FC = () => {
    const notification = useNotification();
    const [showSettings, setShowSettings] = useState(false);

    const handleExportReport = () => {
        // In production, call API to export report
        notification.info('Tính năng xuất báo cáo đang được phát triển. Báo cáo sẽ được tải xuống dạng Excel.');
        // Example: window.open('/api/reports/export', '_blank');
    };

    return (
        <>
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
                {/* Search */}
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm, khách hàng..."
                        className="input"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <NotificationDropdown />
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 text-slate-600 hover:text-primary transition-colors"
                        title="Cài đặt"
                    >
                        <span className="material-symbols-outlined">settings</span>
                    </button>

                    {/* CTA Button matching frontend exactly */}
                    <button
                        onClick={handleExportReport}
                        className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                    >
                        Xuất báo cáo
                        <span className="material-symbols-outlined text-sm">download</span>
                    </button>
                </div>
            </header>

            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        </>
    );
};

export default Header;
