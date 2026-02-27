import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNotification } from './shared/Notification';
import { productService, categoryService, imageService, productImageService, Category } from '../services/supabase';
import ExcelJS from 'exceljs';

interface ImportExcelModalProps {
    onClose: () => void;
    onImportComplete: () => void;
}

const ImportExcelModal: React.FC<ImportExcelModalProps> = ({ onClose, onImportComplete }) => {
    const notification = useNotification();
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

    const handleDownloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Nhập sản phẩm');

        // Define columns
        sheet.columns = [
            { header: 'MÃ SẢN PHẨM (*)', key: 'code', width: 20 },
            { header: 'TÊN SẢN PHẨM (*)', key: 'name', width: 35 },
            { header: 'MÃ NHÀ SẢN XUẤT', key: 'manufacturer_code', width: 25 },
            { header: 'DANH MỤC (*)', key: 'category', width: 25 },
            { header: 'TÊN FILE ẢNH', key: 'images', width: 35 },
            { header: 'MÔ TẢ', key: 'description', width: 40 },
            { header: 'HIỆN TRANG CHỦ (1/0)', key: 'show_on_homepage', width: 20 }
        ];

        // Add example row
        sheet.addRow({
            code: 'BCBL',
            name: 'Bạc côn Ba Lăng Xê',
            manufacturer_code: 'WG9901938801',
            category: 'Nhập Tên hoặc ID (Sheet 2)',
            images: 'anh1.jpg, anh2.png, anh3.webp',
            description: 'Phụ tùng chính hãng Sinotruk',
            show_on_homepage: '1'
        });

        // Add category reference sheet
        const catSheet = workbook.addWorksheet('Danh mục (tham khảo)');
        catSheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Tên danh mục', key: 'name', width: 25 },
            { header: 'Loại', key: 'type', width: 15 }
        ];

        categories.forEach(cat => {
            catSheet.addRow({
                id: cat.id,
                name: cat.name,
                type: cat.is_vehicle_name ? 'Xe' : 'Phụ tùng'
            });
        });

        // Generate and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'mau-nhap-san-pham-sinotruk.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);

        notification.success('Đã tải file mẫu');
    };

    const handleImport = async () => {
        if (!selectedFile) {
            notification.warning('Vui lòng chọn file Excel');
            return;
        }

        setIsImporting(true);

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet(1);
            if (!worksheet) {
                notification.error('File không có dữ liệu');
                setIsImporting(false);
                return;
            }

            const rows: any[] = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header

                rows.push({
                    rowNumber,
                    data: row.values
                });
            });

            if (rows.length === 0) {
                notification.error('File không có dữ liệu');
                setIsImporting(false);
                return;
            }

            setImportProgress({ current: 0, total: rows.length });

            let imported = 0;
            let failed = 0;

            for (let i = 0; i < rows.length; i++) {
                const { data } = rows[i];
                setImportProgress({ current: i + 1, total: rows.length });

                // ExcelJS row.values is 1-indexed, so:
                // [empty, code, name, manufacturer_code, category, images_text, description, show_on_homepage]
                const code = String(data[1] || '').trim();
                const name = String(data[2] || '').trim();

                if (!code || !name) {
                    failed++;
                    continue;
                }

                // Map category
                const categoryInput = String(data[4] || '').trim().toLowerCase();
                let categoryId: number | null = null;

                if (categoryInput) {
                    const foundCat = categories.find(c =>
                        c.id.toString() === categoryInput ||
                        c.name.toLowerCase() === categoryInput
                    );
                    if (foundCat) {
                        categoryId = foundCat.id;
                    } else if (!isNaN(parseInt(categoryInput))) {
                        categoryId = parseInt(categoryInput);
                    }
                }

                // Xử lý danh sách tên file ảnh
                const imagesText = String(data[5] || '').trim();
                const imageNames = imagesText ? imagesText.split(',').map(img => img.trim()).filter(Boolean) : [];
                
                const primaryImage = imageNames.length > 0 ? imageNames[0] : null;

                const product = {
                    code: code.toUpperCase(),
                    name: name,
                    manufacturer_code: data[3] || null,
                    category_id: categoryId,
                    description: data[6] || 'Phụ tùng chính hãng Sinotruk, nhập khẩu trực tiếp từ nhà máy.',
                    image: primaryImage,
                    thumbnail: primaryImage,
                    show_on_homepage: data[7] !== '0' && data[7] !== 0,
                };

                try {
                    const newProduct = await productService.create(product);
                    
                    // Nếu có nhiều ảnh, thêm vào album (product_images)
                    if (newProduct && newProduct.id && imageNames.length > 0) {
                        // Import productImageService and imageService at the top or use them if already imported
                        // Wait, we need to import them! I will add imports later.
                        
                        for (let j = 0; j < imageNames.length; j++) {
                            const imgName = imageNames[j];
                            try {
                                // 1. Tạo image record
                                const newImage = await imageService.create(imgName);
                                // 2. Link với product
                                await productImageService.addToProduct(
                                    newProduct.id, 
                                    newImage.id, 
                                    j === 0, // isPrimary = true cho ảnh đầu tiên
                                    j // sortOrder
                                );
                            } catch (imgErr) {
                                console.error(`Lỗi khi thêm ảnh ${imgName} cho sản phẩm ${code}:`, imgErr);
                            }
                        }
                    }
                    
                    imported++;
                } catch (err: any) {
                    console.error('Error importing row:', data, err);
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
                                <p className="text-sm text-blue-600 mt-1">Tải file mẫu để biết định dạng chuẩn. Cột "Tên file ảnh" nhập tên các file cách nhau bằng dấu phẩy (VD: hinh1.jpg, hinh2.png).</p>
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
                        <label className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors block ${selectedFile ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-primary bg-slate-50'
                            }`}>
                            <input
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
                                    <span className="text-sm text-slate-500 hover:text-red-500 underline mt-2">
                                        Chọn file khác
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">upload_file</span>
                                    <p className="font-medium text-slate-600">Click để chọn file</p>
                                    <p className="text-sm text-slate-400">Định dạng: .xlsx, .xls</p>
                                </div>
                            )}
                        </label>
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
