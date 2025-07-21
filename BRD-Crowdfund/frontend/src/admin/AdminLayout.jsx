// src/admin/AdminLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  const { pathname } = useLocation();

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="logo">Admin</h2>
        <nav className="admin-nav">
          <Link to="/admin/dashboard" className={pathname === '/admin/dashboard' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/admin/manage-blogs" className={pathname === '/admin/manage-blogs' ? 'active' : ''}>
            Manage Blogs
          </Link>
          <Link to="/admin/manage-causes" className={pathname === '/admin/manage-causes' ? 'active' : ''}>
            Manage Causes
          </Link>
          <Link to="/admin/manage-donations" className={pathname === '/admin/manage-donations' ? 'active' : ''}>
            Manage Donations
          </Link>
          <Link to="/admin/manage-volunteers" className={pathname === '/admin/manage-volunteers' ? 'active' : ''}>
            Manage Volunteers
          </Link>
          <Link to="/admin/manage-events" className={pathname === '/admin/manage-events' ? 'active' : ''}>
            Manage Events
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1>{pathname.replace('/admin/', '').replace('-', ' ').toUpperCase()}</h1>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
