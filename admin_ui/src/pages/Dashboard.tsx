import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Stats card data
const stats = [
    { label: 'Tổng sản phẩm', value: '2,298', icon: 'inventory_2', color: 'bg-blue-500' },
    { label: 'Sắp hết hàng', value: '45', icon: 'warning', color: 'bg-yellow-500' },
    { label: 'Hết hàng', value: '12', icon: 'error', color: 'bg-red-500' },
    { label: 'Danh mục', value: '8', icon: 'category', color: 'bg-primary' },
];

const lowStockProducts = [
    { code: 'XLKVX', name: 'Xilanh kích cabin VX350', total: 5, category: 'CABIN' },
    { code: 'LDDC-A7', name: 'Lọc dầu động cơ HOWO A7', total: 2, category: 'ĐỘNG CƠ' },
    { code: 'LC420', name: 'Lá côn HOWO 420', total: 0, category: 'LY HỢP' },
];

// Chart data
const categoryDistribution = [
    { name: 'CABIN', value: 450, color: '#0ea5e9' },
    { name: 'ĐỘNG CƠ', value: 380, color: '#10b981' },
    { name: 'PHANH', value: 280, color: '#f59e0b' },
    { name: 'LY HỢP', value: 220, color: '#8b5cf6' },
    { name: 'KHÁC', value: 150, color: '#94a3b8' },
];

const stockTrendData = [
    { month: 'T1', count: 1800 },
    { month: 'T2', count: 1950 },
    { month: 'T3', count: 2100 },
    { month: 'T4', count: 2050 },
    { month: 'T5', count: 2200 },
    { month: 'T6', count: 2298 },
];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-2 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 text-sm md:text-base">Tổng quan kho sản phẩm Sinotruk</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card flex items-center gap-4 p-4 md:p-6 hover:border-primary/30 transition-colors">
                        <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <span className="material-symbols-outlined text-white text-xl md:text-2xl">{stat.icon}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-500 text-xs md:text-sm truncate">{stat.label}</p>
                            <p className="text-slate-800 text-xl md:text-2xl font-bold tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock Trend Chart */}
                <div className="card">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6">Tăng trưởng sản phẩm</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stockTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="month" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#0ea5e9"
                                strokeWidth={4}
                                dot={{ fill: '#0ea5e9', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="Số lượng SP"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution Chart */}
                <div className="card">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6">Phân bổ theo danh mục</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="card border-red-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">warning</span>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Cảnh báo tồn kho thấp</h2>
                    </div>
                    <button
                        onClick={() => navigate('/products')}
                        className="btn btn-outline text-xs md:text-sm px-4"
                    >
                        Xem tất cả
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="admin-table w-full min-w-[600px]">
                        <thead>
                            <tr>
                                <th>Mã sản phẩm</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Tồn kho</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockProducts.map((product) => (
                                <tr key={product.code}>
                                    <td className="font-mono text-slate-800">{product.code}</td>
                                    <td className="font-medium text-slate-800">{product.name}</td>
                                    <td>
                                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`font-bold ${product.total === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                                            {product.total}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <button className="text-slate-400 hover:text-primary transition-colors p-1">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
