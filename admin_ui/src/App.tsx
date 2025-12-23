import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { NotificationProvider } from './components/shared/Notification';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Login from './pages/Login';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const checkAuth = () => {
        try {
            return localStorage.getItem('isAuthenticated') === 'true';
        } catch (e) {
            return false;
        }
    };

    if (!checkAuth()) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Public Route Component (redirect if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const checkAuth = () => {
        try {
            return localStorage.getItem('isAuthenticated') === 'true';
        } catch (e) {
            return false;
        }
    };

    if (checkAuth()) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    // Check auth status safely
    const checkAuth = () => {
        try {
            return localStorage.getItem('isAuthenticated') === 'true';
        } catch (e) {
            return false;
        }
    };

    return (
        <NotificationProvider>
            <Routes>
                {/* Root path - redirect based on auth status */}
                <Route
                    path="/"
                    element={
                        checkAuth()
                            ? <Navigate to="/dashboard" replace />
                            : <Navigate to="/login" replace />
                    }
                />

                {/* Login route - public, redirect if already logged in */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <LoginWrapper />
                        </PublicRoute>
                    }
                />

                {/* Protected routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/products"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Products />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </NotificationProvider>
    );
};

// Login wrapper to handle navigation after login
const LoginWrapper: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard', { replace: true });
    };

    return <Login onLogin={handleLogin} />;
};

export default App;
