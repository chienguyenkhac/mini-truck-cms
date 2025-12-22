import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const menu = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Sản phẩm', path: '/products' },
  { label: 'Đơn hàng', path: '/orders' },
  { label: 'Khách hàng', path: '/customers' },
  { label: 'Báo cáo', path: '/reports' },
];

function Sidebar() {
  const location = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Admin Panel</div>
      <nav>
        <ul>
          {menu.map(item => (
            <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
              <Link to={item.path}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
