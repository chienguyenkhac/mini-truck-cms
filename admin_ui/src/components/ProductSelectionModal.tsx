import React, { useState } from 'react';

interface Product {
    id: number;
    code: string;
    name: string;
    price: number;
    stock: number;
}

interface ProductSelectionModalProps {
    onClose: () => void;
    onSelect: (product: Product, quantity: number) => void;
}

const mockProducts: Product[] = [
    { id: 1, code: 'XLKVX', name: 'Xilanh kích cabin VX350', price: 850000, stock: 50 },
    { id: 2, code: 'TBTSI', name: 'Tăm bét trước SITRAK', price: 1200000, stock: 30 },
    { id: 3, code: 'PHANH', name: 'Phanh chống tăng tốc', price: 2500000, stock: 20 },
    { id: 4, code: 'LOCDAU', name: 'Lọc dầu động cơ', price: 450000, stock: 100 },
];

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({ onClose, onSelect }) => {
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);

    const filteredProducts = mockProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = () => {
        if (selectedProduct && quantity > 0) {
            onSelect(selectedProduct, quantity);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Chọn sản phẩm</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="input w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                                    selectedProduct?.id === product.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-800">{product.name}</p>
                                        <p className="text-sm text-slate-500">Mã: {product.code} | Tồn kho: {product.stock}</p>
                                        <p className="text-sm font-bold text-primary mt-1">
                                            {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                                        </p>
                                    </div>
                                    {selectedProduct?.id === product.id && (
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedProduct && (
                    <div className="p-6 border-t border-slate-200 bg-slate-50">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Số lượng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={selectedProduct.stock}
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, Math.min(selectedProduct.stock, Number(e.target.value))))}
                                className="input w-32"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Tồn kho: {selectedProduct.stock} | Tổng: {new Intl.NumberFormat('vi-VN').format(selectedProduct.price * quantity)}đ
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSelect}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
                            >
                                Thêm sản phẩm
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductSelectionModal;





