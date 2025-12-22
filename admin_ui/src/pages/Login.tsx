import React, { useState } from 'react';

interface LoginProps {
    onLogin?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Simple validation - in production, call API
        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        // Mock login - in production, call Laravel API
        // Default admin account for demo
        const validCredentials = [
            { username: 'admin', password: 'admin' },
            { username: 'admin', password: '123456' },
        ];

        const isValid = validCredentials.some(
            cred => cred.username === username && cred.password === password
        );

        if (!isValid) {
            setError('Tên đăng nhập hoặc mật khẩu không đúng');
            return;
        }

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        
        if (onLogin) {
            onLogin();
        } else {
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo - matching frontend Navbar exactly */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 text-primary">
                            <span className="material-symbols-outlined text-5xl font-bold">local_shipping</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-slate-800 text-3xl font-bold tracking-tight leading-none uppercase">Sinotruk</span>
                        <span className="text-primary text-sm font-bold tracking-[0.3em] leading-none uppercase">Admin Panel</span>
                    </div>
                    <p className="text-slate-500 mt-4">Đăng nhập để tiếp tục</p>
                    <p className="text-xs text-slate-400 mt-2">
                        Demo: <span className="font-mono">admin</span> / <span className="font-mono">admin</span>
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="card space-y-6">
                    <div>
                        <label className="block text-slate-700 text-sm mb-2">Tên đăng nhập</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Nhập tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 text-sm mb-2">Mật khẩu</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20">
                        Đăng nhập
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </form>

                <p className="text-center text-slate-400 text-sm mt-6">
                    © 2024 SINOTRUK Hà Nội. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
