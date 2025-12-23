import React from 'react';
import { useNotification } from './shared/Notification';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const notification = useNotification();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Cài đặt</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* General Settings */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Cài đặt chung</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Tên công ty
                                </label>
                                <input
                                    type="text"
                                    defaultValue="SINOTRUK HÀ NỘI"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email liên hệ
                                </label>
                                <input
                                    type="email"
                                    defaultValue="hnsinotruk@gmail.com"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    defaultValue="0382.890.990"
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* System Settings */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Cài đặt hệ thống</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-800">Thông báo email</p>
                                    <p className="text-sm text-slate-500">Nhận thông báo qua email</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-800">Thông báo đơn hàng mới</p>
                                    <p className="text-sm text-slate-500">Thông báo khi có đơn hàng mới</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={() => {
                                notification.success('Cài đặt đã được lưu');
                                onClose();
                            }}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;


