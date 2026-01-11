import React, { useState, useEffect } from 'react';
import { useNotification } from '../components/shared/Notification';
import { supabase } from '../services/supabase';

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

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .order('id');

            if (error) throw error;

            setSettings(data || []);

            // Initialize form data
            const initialData: Record<string, string> = {};
            (data || []).forEach((s: Setting) => {
                initialData[s.key] = s.value || '';
            });
            setFormData(initialData);
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
            // Update all changed settings
            for (const setting of settings) {
                if (formData[setting.key] !== setting.value) {
                    const { error } = await supabase
                        .from('site_settings')
                        .update({ value: formData[setting.key] || null })
                        .eq('key', setting.key);

                    if (error) throw error;
                }
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

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Logo upload failed with status:', response.status, 'Body:', errorText);
                throw new Error(`Upload failed: ${errorText || response.statusText}`);
            }

            const result = await response.json();
            handleChange('company_logo', result.secure_url);
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
                            {formData.company_logo ? (
                                <img src={formData.company_logo} alt="Logo" className="w-full h-full object-contain" />
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
                            value={formData.company_name || ''}
                            onChange={(e) => handleChange('company_name', e.target.value)}
                            className="input"
                            placeholder="SINOTRUK Hà Nội"
                        />
                    </div>

                    {/* Hotline */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Số hotline</label>
                        <input
                            type="text"
                            value={formData.hotline || ''}
                            onChange={(e) => handleChange('hotline', e.target.value)}
                            className="input"
                            placeholder="0382890990"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ công ty</label>
                        <textarea
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="input min-h-[80px]"
                            placeholder="Số 123, Đường ABC, Quận XYZ, Hà Nội"
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
                            <p className="text-xs text-slate-400 mt-1">Tự động thêm watermark vào ảnh sản phẩm khi upload</p>
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

                    {/* Watermark Text */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Text watermark</label>
                        <input
                            type="text"
                            value={formData.watermark_text || ''}
                            onChange={(e) => handleChange('watermark_text', e.target.value)}
                            className="input"
                            placeholder="SINOTRUK Hà Nội"
                        />
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
        </div>
    );
};

export default Settings;
