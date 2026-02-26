import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { dashboardService } from '../services/supabase';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        categoriesCount: 0,
        articlesCount: 0
    });
    const [categoryDistribution, setCategoryDistribution] = useState<{ name: string; value: number; color: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const dashboardData = await dashboardService.getStats();
                
                setStats({
                    totalProducts: dashboardData.totalProducts,
                    categoriesCount: dashboardData.categoriesCount,
                    articlesCount: dashboardData.articlesCount
                });

                setCategoryDistribution(dashboardData.categoryDistribution);
            } catch (err) {
                console.error('Error loading dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const statsConfig = [
        { label: 'Tổng sản phẩm', icon: 'inventory_2', color: 'bg-blue-500', value: stats.totalProducts.toLocaleString() },
        { label: 'Danh mục', icon: 'category', color: 'bg-primary', value: stats.categoriesCount.toLocaleString() },
        { label: 'Bài viết', icon: 'article', color: 'bg-green-500', value: stats.articlesCount.toLocaleString() },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-2 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {statsConfig.map((stat, i) => (
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
            <div className="grid grid-cols-1 gap-6">
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
        </div>
    );
};

export default Dashboard;
