import React from 'react';
import { NavLink } from 'react-router-dom';

const menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/products', icon: 'inventory_2', label: 'Sản phẩm' },
    { path: '/orders', icon: 'shopping_cart', label: 'Đơn hàng' },
    { path: '/customers', icon: 'people', label: 'Khách hàng' },
    { path: '/exports', icon: 'output', label: 'Xuất kho' },
    { path: '/imports', icon: 'input', label: 'Nhập kho' },
    { path: '/quotes', icon: 'request_quote', label: 'Báo giá' },
];

const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
            {/* Logo - matching frontend Navbar exactly */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200">
                <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 text-primary">
                        <span className="material-symbols-outlined text-4xl font-bold">local_shipping</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-800 text-xl font-bold tracking-tight leading-none uppercase">Sinotruk</span>
                        <span className="text-primary text-[10px] font-bold tracking-[0.2em] leading-none uppercase">Admin</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-800'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                        <span className="material-symbols-outlined text-slate-600">person</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-800 text-sm font-medium">Admin</p>
                        <p className="text-slate-500 text-xs">Quản trị viên</p>
                    </div>
                    <button 
                        onClick={() => {
                            localStorage.removeItem('isAuthenticated');
                            localStorage.removeItem('username');
                            window.location.href = '/';
                        }}
                        className="text-slate-500 hover:text-primary transition-colors"
                        title="Đăng xuất"
                    >
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
