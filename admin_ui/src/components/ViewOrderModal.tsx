import React from 'react';

interface ViewOrderModalProps {
    orderId: number;
    onClose: () => void;
}

const ViewOrderModal: React.FC<ViewOrderModalProps> = ({ orderId, onClose }) => {
    // Mock order data - in production, fetch from API
    const order = {
        id: orderId,
        tenphieu: `Đơn hàng TQ #${String(orderId).padStart(3, '0')}`,
        customer: 'Công ty ABC',
        money: 15000000,
        created_at: '2024-12-20',
        completed: true,
        lock: false,
        products: [
            { id: 1, name: 'Xilanh kích cabin VX350', code: 'XLKVX', quantity: 5, price: 850000 },
            { id: 2, name: 'Tăm bét trước SITRAK', code: 'TBTSI', quantity: 3, price: 1200000 },
        ],
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Chi tiết đơn hàng</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Mã đơn hàng</p>
                            <p className="font-bold text-slate-800">{order.tenphieu}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Khách hàng</p>
                            <p className="font-bold text-slate-800">{order.customer}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Ngày tạo</p>
                            <p className="font-bold text-slate-800">{order.created_at}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Tổng tiền</p>
                            <p className="font-bold text-primary text-xl">
                                {new Intl.NumberFormat('vi-VN').format(order.money)}đ
                            </p>
                        </div>
                    </div>

                    {/* Products List */}
                    <div>
                        <h3 className="font-bold text-slate-800 mb-4">Danh sách sản phẩm</h3>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã SP</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên sản phẩm</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Số lượng</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Đơn giá</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.products.map((product) => (
                                        <tr key={product.id} className="border-t border-slate-200">
                                            <td className="px-4 py-3 text-slate-800 font-mono">{product.code}</td>
                                            <td className="px-4 py-3 text-slate-800">{product.name}</td>
                                            <td className="px-4 py-3 text-slate-600">{product.quantity}</td>
                                            <td className="px-4 py-3 text-slate-600">{new Intl.NumberFormat('vi-VN').format(product.price)}đ</td>
                                            <td className="px-4 py-3 text-slate-800 font-bold">
                                                {new Intl.NumberFormat('vi-VN').format(product.quantity * product.price)}đ
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                        >
                            Đóng
                        </button>
                        <button 
                            onClick={() => {
                                alert('Xuất PDF đơn hàng');
                                onClose();
                            }}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
                        >
                            Xuất PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewOrderModal;

