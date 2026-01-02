import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNotification } from './shared/Notification';
import { productService, categoryService, Category } from '../services/supabase';
import * as XLSX from 'xlsx';

interface ImportExcelModalProps {
    onClose: () => void;
    onImportComplete: () => void;
}

const ImportExcelModal: React.FC<ImportExcelModalProps> = ({ onClose, onImportComplete }) => {
    const notification = useNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
    const [categories, setCategories] = useState<Category[]>([]);

    // Load categories on mount
    React.useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data);
            } catch (err) {
                console.error('Error loading categories:', err);
            }
        };
        loadCategories();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.match(/\.(xlsx|xls)$/i)) {
                notification.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleDownloadTemplate = () => {
        // Create template data
        const templateData = [
            {
                'Mã sản phẩm (*)': 'VD: XLKVX123',
                'Tên sản phẩm (*)': 'VD: Xilanh kích cabin VX350',
                'Mã nhà sản xuất': 'VD: WEICHAI-612600130777',
                'ID danh mục': 'VD: 1 (xem sheet Danh mục)',
                'Mô tả': 'Phụ tùng chính hãng Sinotruk',
                'Hiện trang chủ (1/0)': '1'
            }
        ];

        // Create category reference sheet
        const categoryData = categories.map(cat => ({
            'ID': cat.id,
            'Tên danh mục': cat.name,
            'Loại': cat.is_vehicle_name ? 'Xe' : 'Phụ tùng'
        }));

        // Create workbook with 2 sheets
        const wb = XLSX.utils.book_new();

        const ws1 = XLSX.utils.json_to_sheet(templateData);
        // Set column widths
        ws1['!cols'] = [
            { wch: 20 }, { wch: 35 }, { wch: 25 }, { wch: 25 }, { wch: 40 }, { wch: 20 }
        ];
        XLSX.utils.book_append_sheet(wb, ws1, 'Nhập sản phẩm');

        const ws2 = XLSX.utils.json_to_sheet(categoryData);
        ws2['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws2, 'Danh mục (tham khảo)');

        // Download
        XLSX.writeFile(wb, `mau-nhap-san-pham-sinotruk.xlsx`);
        notification.success('Đã tải file mẫu');
    };

    const handleImport = async () => {
        if (!selectedFile) {
            notification.warning('Vui lòng chọn file Excel');
            return;
        }

        setIsImporting(true);

        try {
            const data = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                notification.error('File không có dữ liệu');
                setIsImporting(false);
                return;
            }

            setImportProgress({ current: 0, total: jsonData.length });

            let imported = 0;
            let failed = 0;

            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i] as any;
                setImportProgress({ current: i + 1, total: jsonData.length });

                // Map Excel columns to product fields - support both Vietnamese and English column names
                const code = row['Mã sản phẩm (*)'] || row['Mã sản phẩm'] || row.code || row.Code || row['Mã'] || '';
                const name = row['Tên sản phẩm (*)'] || row['Tên sản phẩm'] || row.name || row.Name || row['Tên'] || '';

                if (!code || !name) {
                    failed++;
                    continue;
                }

                const product = {
                    code: String(code).toUpperCase().trim(),
                    name: String(name).trim(),
                    manufacturer_code: row['Mã nhà sản xuất'] || row.manufacturer_code || null,
                    category_id: row['ID danh mục'] ? parseInt(row['ID danh mục']) : (row.category_id ? parseInt(row.category_id) : null),
                    description: row['Mô tả'] || row.description || 'Phụ tùng chính hãng Sinotruk, nhập khẩu trực tiếp từ nhà máy.',
                    image: row.image || row.Image || row['Ảnh'] || null,
                    show_on_homepage: row['Hiện trang chủ (1/0)'] !== '0' && row['Hiện trang chủ (1/0)'] !== 0,
                };

                try {
                    await productService.create(product);
                    imported++;
                } catch (err: any) {
                    console.error('Error importing row:', row, err);
                    failed++;
                }
            }

            if (imported > 0) {
                notification.success(`Đã nhập thành công ${imported} sản phẩm${failed > 0 ? `, ${failed} lỗi` : ''}`);
                onImportComplete();
            } else {
                notification.error('Không nhập được sản phẩm nào. Vui lòng kiểm tra lại file.');
            }

            onClose();
        } catch (error: any) {
            console.error('Import error:', error);
            notification.error('Lỗi đọc file Excel: ' + (error.message || 'Không xác định'));
        } finally {
            setIsImporting(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Nhập sản phẩm từ Excel</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Download Template */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                            <div className="flex-1">
                                <p className="font-medium text-blue-800">Chưa có file mẫu?</p>
                                <p className="text-sm text-blue-600 mt-1">Tải file mẫu để biết định dạng chuẩn cho việc nhập sản phẩm.</p>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    Tải file mẫu Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Chọn file Excel
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${selectedFile ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-primary bg-slate-50'
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                                    <p className="font-medium text-green-700">{selectedFile.name}</p>
                                    <p className="text-sm text-green-600">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                        className="text-sm text-slate-500 hover:text-red-500 underline mt-2"
                                    >
                                        Chọn file khác
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">upload_file</span>
                                    <p className="font-medium text-slate-600">Click để chọn file</p>
                                    <p className="text-sm text-slate-400">Định dạng: .xlsx, .xls</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Import Progress */}
                    {isImporting && (
                        <div className="bg-slate-100 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                <span className="font-medium text-slate-700">Đang nhập dữ liệu...</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                {importProgress.current} / {importProgress.total} sản phẩm
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
                        disabled={isImporting}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!selectedFile || isImporting}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        {isImporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Đang nhập...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">upload</span>
                                Nhập sản phẩm
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ImportExcelModal;
