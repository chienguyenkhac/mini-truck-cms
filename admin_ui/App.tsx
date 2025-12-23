import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './src/components/shared/Notification';
import Sidebar from './src/components/Layout/Sidebar';
import Dashboard from './src/pages/Dashboard';
import Products from './src/pages/Products';
import Orders from './src/pages/Orders';
import Customers from './src/pages/Customers';
import Exports from './src/pages/Exports';
import Imports from './src/pages/Imports';
import Quotes from './src/pages/Quotes';
import './src/index.css';

function App() {
  return (
    <NotificationProvider>
      <Router basename="/secret">
        <div className="admin-layout">
          <Sidebar />
          <main className="admin-main">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/exports" element={<Exports />} />
              <Route path="/imports" element={<Imports />} />
              <Route path="/quotes" element={<Quotes />} />
            </Routes>
          </main>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
