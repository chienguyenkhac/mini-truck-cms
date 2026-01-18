import { loginUser, getSiteSettings } from '../lib/supabase';
import { useEffect } from 'react';

interface LoginProps {
    onLogin?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [logo, setLogo] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getSiteSettings();
            if (settings?.company_logo) {
                setLogo(settings.company_logo);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setIsLoading(true);

        try {
            // Try Supabase login first
            const user = await loginUser(username, password);

            if (user) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userId', String(user.id));
                localStorage.setItem('username', user.username);
                localStorage.setItem('sinotruk_admin_name', user.full_name);
                if (user.avatar) {
                    localStorage.setItem('sinotruk_admin_avatar', user.avatar);
                }

                if (onLogin) {
                    onLogin();
                } else {
                    window.location.reload();
                }
                return;
            }

            // Fallback to mock credentials for demo
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
        } catch (err) {
            console.error('Login error:', err);
            setError('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo - matching frontend Navbar exactly */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center mb-4">
                        {logo ? (
                            <img src={logo} alt="Logo" className="h-20 w-auto object-contain" />
                        ) : (
                            <div className="flex items-center justify-center gap-3 overflow-hidden py-1">
                                <div className="w-20 h-20 text-primary animate-truck-drive">
                                    <span className="material-symbols-outlined text-7xl font-bold">local_shipping</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-slate-800 text-5xl font-bold tracking-tight leading-none uppercase mb-2">Sinotruk</span>
                        <span className="text-primary text-base font-bold tracking-[0.4em] leading-none uppercase">Admin Panel</span>
                    </div>
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                Đang đăng nhập...
                            </>
                        ) : (
                            <>
                                Đăng nhập
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </>
                        )}
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
