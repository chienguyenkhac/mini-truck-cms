import React from 'react';
import { NavLink } from 'react-router-dom';

const menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/products', icon: 'inventory_2', label: 'Sản phẩm' },
];

const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            ></div>

            <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-50 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Logo - matching frontend Navbar exactly */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 text-primary">
                            <span className="material-symbols-outlined text-4xl font-bold">local_shipping</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-800 text-xl font-bold tracking-tight leading-none uppercase">Sinotruk</span>
                            <span className="text-primary text-[10px] font-bold tracking-[0.2em] leading-none uppercase">Admin</span>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
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
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 flex-shrink-0">
                            <span className="material-symbols-outlined text-slate-600 text-sm">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-800 text-xs font-bold truncate">Admin</p>
                            <p className="text-slate-500 text-[10px] truncate">Quản trị</p>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('isAuthenticated');
                                localStorage.removeItem('username');
                                window.location.href = '/';
                            }}
                            className="text-slate-400 hover:text-primary transition-colors flex-shrink-0"
                            title="Đăng xuất"
                        >
                            <span className="material-symbols-outlined text-sm">logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
