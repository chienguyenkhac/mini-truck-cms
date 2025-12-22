import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Stats card data
const stats = [
    { label: 'Tổng sản phẩm', value: '2,298', icon: 'inventory_2', color: 'bg-blue-500' },
    { label: 'Đơn hàng', value: '156', icon: 'shopping_cart', color: 'bg-green-500' },
    { label: 'Khách hàng', value: '240', icon: 'people', color: 'bg-purple-500' },
    { label: 'Doanh thu', value: '₫1.2B', icon: 'payments', color: 'bg-primary' },
];

const recentOrders = [
    { id: 'ORD-001', customer: 'Công ty ABC', amount: '₫15,000,000', status: 'Hoàn thành' },
    { id: 'ORD-002', customer: 'Nguyễn Văn A', amount: '₫8,500,000', status: 'Đang xử lý' },
    { id: 'ORD-003', customer: 'Công ty XYZ', amount: '₫25,000,000', status: 'Chờ duyệt' },
];

// Chart data
const revenueData = [
    { month: 'T1', revenue: 1200000000 },
    { month: 'T2', revenue: 1500000000 },
    { month: 'T3', revenue: 1800000000 },
    { month: 'T4', revenue: 1400000000 },
    { month: 'T5', revenue: 2000000000 },
    { month: 'T6', revenue: 2200000000 },
];

const orderStatusData = [
    { name: 'Hoàn thành', value: 45, color: '#10b981' },
    { name: 'Đang xử lý', value: 30, color: '#f59e0b' },
    { name: 'Chờ duyệt', value: 25, color: '#6b7280' },
];

const categoryData = [
    { name: 'CABIN', orders: 45 },
    { name: 'ĐỘNG CƠ', orders: 38 },
    { name: 'PHANH', orders: 28 },
    { name: 'LY HỢP', orders: 22 },
    { name: 'KHÁC', orders: 15 },
];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                <p className="text-slate-500">Tổng quan hệ thống quản lý</p>
            </div>

            {/* Stats Grid - matching frontend current theme */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card flex items-center gap-4">
                        <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                            <span className="material-symbols-outlined text-white text-2xl">{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">{stat.label}</p>
                            <p className="text-slate-800 text-2xl font-bold tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="card">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6">Doanh thu theo tháng</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#64748b" />
                            <YAxis 
                                stroke="#64748b"
                                tickFormatter={(value) => `₫${(value / 1000000).toFixed(0)}M`}
                            />
                            <Tooltip 
                                formatter={(value: number) => [`₫${new Intl.NumberFormat('vi-VN').format(value)}`, 'Doanh thu']}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#0ea5e9" 
                                strokeWidth={3}
                                dot={{ fill: '#0ea5e9', r: 4 }}
                                name="Doanh thu"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Order Status Pie Chart */}
                <div className="card">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6">Trạng thái đơn hàng</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={orderStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {orderStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Chart */}
            <div className="card">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6">Đơn hàng theo danh mục</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Bar dataKey="orders" fill="#0ea5e9" name="Số đơn hàng" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Đơn hàng gần đây</h2>
                    <button 
                        onClick={() => navigate('/orders')}
                        className="btn btn-outline text-sm"
                    >
                        Xem tất cả
                    </button>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Giá trị</th>
                            <th>Trạng thái</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="font-medium text-slate-800">{order.id}</td>
                                <td className="text-slate-600">{order.customer}</td>
                                <td className="text-slate-600">{order.amount}</td>
                                <td>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
