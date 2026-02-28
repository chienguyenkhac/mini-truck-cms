import React, { useState, useEffect } from 'react';
import { useNotification } from '../components/shared/Notification';

interface Setting {
    id: number;
    key: string;
    value: string | null;
    type: string;
    description: string;
}

const Settings: React.FC = () => {
    const notification = useNotification();
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});

    useEffect(() => {
        loadSettings();
    }, []);

    // Separate useEffect to update formData when settings change
    useEffect(() => {
        if (settings.length > 0) {
            const initialData: Record<string, string> = {};
            settings.forEach((s: Setting) => {
                initialData[s.key] = s.value || '';
            });
            setFormData(initialData);
        }
    }, [settings]);

    const loadSettings = async () => {
        try {
            const response = await fetch('/api/site-settings', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch settings: ${response.status}`);
            }

            const data = await response.json();
            setSettings(data || []);
        } catch (err) {
            console.error('Error loading settings:', err);
            notification.error('Không thể tải cấu hình');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Build updates object - send all current formData
            const updates: Record<string, string | null> = {};
            
            // Send all formData values (including empty ones as null)
            Object.keys(formData).forEach(key => {
                updates[key] = formData[key] || null;
            });
            
            // If formData is empty but we have settings, use current form values
            if (Object.keys(updates).length === 0 && settings.length > 0) {
                settings.forEach(setting => {
                    updates[setting.key] = formData[setting.key] || setting.value || null;
                });
            }

            if (Object.keys(updates).length === 0) {
                notification.error('Không có dữ liệu để lưu');
                return;
            }

            // Send all updates in one request
            const response = await fetch('/api/site-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            notification.success('Đã lưu cấu hình thành công!');
            loadSettings(); // Reload to get fresh data
        } catch (err) {
            console.error('Error saving settings:', err);
            notification.error('Không thể lưu cấu hình');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

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
                console.error('Logo upload failed:', result);
                const errorMsg = result.error || result.message || response.statusText;
                const bucketInfo = result.availableBuckets ? ` (Buckets: ${result.availableBuckets})` : '';
                throw new Error(`${errorMsg}${bucketInfo}`);
            }
            handleChange('site_logo', result.url);
            notification.success('Đã tải logo lên');
        } catch (err: any) {
            console.error('Error uploading logo:', err);
            notification.error(`Không thể tải logo: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }



    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Cài đặt</h1>
                    <p className="text-slate-500 mt-1">Quản lý thông tin công ty và cấu hình hệ thống</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            Lưu cấu hình
                        </>
                    )}
                </button>
            </div>

            {/* Company Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">business</span>
                        Thông tin công ty
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    {/* Logo */}
                    <div className="flex items-start gap-6">
                        <div className="w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
                            {formData.site_logo ? (
                                <img src={formData.site_logo} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Logo công ty</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            <p className="text-xs text-slate-400 mt-2">Định dạng: PNG, JPG, SVG. Tối đa 2MB.</p>
                        </div>
                    </div>

                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tên công ty</label>
                        <input
                            type="text"
                            value={formData.site_name || ''}
                            onChange={(e) => handleChange('site_name', e.target.value)}
                            className="input"
                            placeholder="SINOTRUK Hà Nội"
                        />
                    </div>

                    {/* Company Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả công ty</label>
                        <textarea
                            value={formData.site_description || ''}
                            onChange={(e) => handleChange('site_description', e.target.value)}
                            className="input min-h-[80px]"
                            placeholder="Mô tả ngắn gọn về công ty, dịch vụ, thế mạnh..."
                        />
                    </div>

                    {/* Hotline */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Số hotline</label>
                        <input
                            type="text"
                            value={formData.contact_phone || ''}
                            onChange={(e) => handleChange('contact_phone', e.target.value)}
                            className="input"
                            placeholder="0915595166"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email liên hệ</label>
                        <input
                            type="email"
                            value={formData.contact_email || ''}
                            onChange={(e) => handleChange('contact_email', e.target.value)}
                            className="input"
                            placeholder="info@sinotruk.vn"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ công ty</label>
                        <textarea
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="input min-h-[80px]"
                            placeholder="Thái Bình Hạy Ho"
                        />
                    </div>
                </div>
            </div>

            {/* Watermark Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">branding_watermark</span>
                        Cấu hình Watermark
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Bật watermark</label>
                            <p className="text-xs text-slate-400 mt-1">Tự động thêm watermark vào ảnh sản phẩm khi tải xuống</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.watermark_enabled === 'true'}
                                onChange={(e) => handleChange('watermark_enabled', e.target.checked ? 'true' : 'false')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>


                    {/* Watermark Opacity */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Độ trong suốt: {formData.watermark_opacity || 40}%
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={formData.watermark_opacity || '40'}
                            onChange={(e) => handleChange('watermark_opacity', e.target.value)}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Integrations Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">webhook</span>
                        Tích hợp & Webhook
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    {/* Enable Webhook Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Cho phép tạo sản phẩm qua Webhook</label>
                            <p className="text-xs text-slate-400 mt-1">Cho phép các hệ thống bên thứ ba tự động tạo sản phẩm mới thông qua API Webhook.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.webhook_enabled === 'true'}
                                onChange={(e) => handleChange('webhook_enabled', e.target.checked ? 'true' : 'false')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
