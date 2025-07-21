// src/routes/AppRoutes.jsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context for authentication
import { AuthContext } from '../context/AuthContext';

// Public Components
import Header from '../components/Header';
import Footer from '../components/Footer';

// Public Pages
import Home from '../pages/Home';
import About from '../pages/About';
import Causes from '../pages/Causes';
import Contact from '../pages/Contact';
import Events from '../pages/Events';
import Gallery from '../pages/Gallery';
import Blog from '../pages/Blog';
import BlogDetail from '../pages/BlogDetail';
import VolunteerForm from '../pages/VolunteerForm';

// Admin Pages
import Login from '../admin/Login';
import Dashboard from '../admin/Dashboard';
import ManageBlogs from '../admin/ManageBlogs';
import ManageCauses from '../admin/ManageCauses';
import ManageDonations from '../admin/ManageDonations';
import ManageVolunteers from '../admin/ManageVolunteers';
import ManageEvents from '../admin/ManageEvents';
import ManageContacts from "../admin/ManageContacts";

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { token } = useContext(AuthContext); // ✅ Get token from context
  const isLoggedIn = !!token; // ✅ Boolean check

  // 🔐 Protected admin routes
  const ProtectedRoute = ({ element }) => {
    return isLoggedIn ? element : <Navigate to="/admin/login" replace />;
  };

  return (
    <>
      {!isAdminRoute && <Header />}

      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/causes" element={<Causes />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/volunteer" element={<VolunteerForm />} />

        {/* 🔒 Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/admin/manage-blogs" element={<ProtectedRoute element={<ManageBlogs />} />} />
        <Route path="/admin/manage-causes" element={<ProtectedRoute element={<ManageCauses />} />} />
        <Route path="/admin/manage-donations" element={<ProtectedRoute element={<ManageDonations />} />} />
        <Route path="/admin/manage-volunteers" element={<ProtectedRoute element={<ManageVolunteers />} />} />
        <Route path="/admin/manage-events" element={<ProtectedRoute element={<ManageEvents />} />} />
        <Route path="/admin/manage-contacts" element={<ProtectedRoute element={<ManageContacts />} />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
};

export default AppRoutes;
