import React, { useState } from 'react';
import { useNotification } from './shared/Notification';
import ProductSelectionModal from './ProductSelectionModal';

interface ProductItem {
    id: number;
    code: string;
    name: string;
    quantity: number;
    price: number;
}

interface CreateExportModalProps {
    onClose: () => void;
    onSave?: (exportData: any) => void;
}

const CreateExportModal: React.FC<CreateExportModalProps> = ({ onClose, onSave }) => {
    const notification = useNotification();
    const [formData, setFormData] = useState({
        tenphieu: '',
        customer: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
    });
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [showProductModal, setShowProductModal] = useState(false);

    const handleAddProduct = (product: any, quantity: number) => {
        const newProduct: ProductItem = {
            id: product.id,
            code: product.code,
            name: product.name,
            quantity: quantity,
            price: product.price,
        };
        setProducts([...products, newProduct]);
    };

    const handleRemoveProduct = (id: number) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (products.length === 0) {
            notification.warning('Vui lòng thêm ít nhất một sản phẩm');
            return;
        }
        if (onSave) {
            onSave({ ...formData, products });
        }
        notification.success('Phiếu xuất kho đã được tạo thành công');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Tạo phiếu xuất kho</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Mã phiếu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.tenphieu}
                                onChange={(e) => setFormData({ ...formData, tenphieu: e.target.value })}
                                className="input"
                                placeholder="XK-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Khách hàng <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.customer}
                                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                className="input"
                            >
                                <option value="">Chọn khách hàng</option>
                                <option value="1">Công ty ABC</option>
                                <option value="2">Nguyễn Văn A</option>
                                <option value="3">Garage XYZ</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Ngày xuất <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="input min-h-[100px]"
                            placeholder="Ghi chú về phiếu xuất..."
                        />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-slate-700">Danh sách sản phẩm xuất kho</p>
                            <button
                                type="button"
                                onClick={() => setShowProductModal(true)}
                                className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                Thêm sản phẩm
                            </button>
                        </div>
                        <div className="space-y-2">
                            {products.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.</p>
                            ) : (
                                products.map((product) => (
                                    <div key={product.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-800">{product.name}</p>
                                            <p className="text-xs text-slate-500">Mã: {product.code} | Số lượng: {product.quantity}</p>
                                            <p className="text-xs font-bold text-primary mt-1">
                                                {new Intl.NumberFormat('vi-VN').format(product.price * product.quantity)}đ
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProduct(product.id)}
                                            className="text-red-500 hover:text-red-700 ml-4"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium">
                            Hủy
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium">
                            Tạo phiếu xuất
                        </button>
                    </div>
                </form>
            </div>

            {showProductModal && (
                <ProductSelectionModal
                    onClose={() => setShowProductModal(false)}
                    onSelect={handleAddProduct}
                />
            )}
        </div>
    );
};

export default CreateExportModal;

