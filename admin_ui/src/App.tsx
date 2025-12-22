import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Exports from './pages/Exports';
import Imports from './pages/Imports';
import Quotes from './pages/Quotes';
import Login from './pages/Login';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
};

// Public Route Component (redirect if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <Routes>
            {/* Root path - redirect based on auth status */}
            <Route 
                path="/" 
                element={
                    localStorage.getItem('isAuthenticated') === 'true' 
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
            <Route 
                path="/orders" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Orders />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/customers" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Customers />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/exports" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Exports />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/imports" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Imports />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/quotes" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Quotes />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
        </Routes>
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

export default App;
