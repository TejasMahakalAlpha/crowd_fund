// src/admin/AdminLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css'; // Ensure AdminLayout.css is correctly linked

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
          {/* ⭐ ADDED: Link to Manage Personal Causes ⭐ */}
          <Link to="/admin/manage-personal-causes" className={pathname === '/admin/manage-personal-causes' ? 'active' : ''}>
            Manage Personal Causes
          </Link>
          {/* You can add a link for Manage Contacts here if it's active */}
          {/* <Link to="/admin/manage-contacts" className={pathname === '/admin/manage-contacts' ? 'active' : ''}>
            Manage Contacts
          </Link> */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          {/* This logic will display the current page title based on the URL */}
          <h1>{pathname.replace('/admin/', '').replace(/-/g, ' ').toUpperCase()}</h1>
        </div>
        <div className="admin-content">
          <Outlet /> {/* Renders the child route component */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;