// src/routes/AppRoutes.jsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context for authentication
import { AuthContext } from '../context/AuthContext';

// Public Components (Pages)
import Header from '../components/Header';   
import Footer from '../components/Footer';   
import Home from '../pages/Home';             
import About from '../pages/About';           
import Causes from '../pages/Causes';         
import Contact from '../pages/Contact';       
import Events from '../pages/Events';         
import Gallery from '../pages/Gallery';       
import Blog from '../pages/Blog';             
import VolunteerForm from '../pages/VolunteerForm'; 
import SubmitCause from '../pages/SubmitCause';     // ⭐ UNCOMMENTED and kept
import WhatsApp from '../components/WhatsApp';     // ⭐ Kept one instance of WhatsApp import
import BlogDetails from '../pages/BlogDetails';   // ⭐ Added BlogDetails import from conflict ⭐


// Admin Pages
import Login from '../admin/Login';                     
import Dashboard from '../admin/Dashboard';             
import ManageBlogs from '../admin/ManageBlogs';         
import ManageCauses from '../admin/ManageCauses';       
import ManageDonations from '../admin/ManageDonations'; 
import ManageVolunteers from '../admin/ManageVolunteers'; 
import ManageEvents from '../admin/ManageEvents';       
import ManageContacts from "../admin/ManageContacts";   
import ManagePersonalCauses from '../admin/ManagePersonalCauses'; // ⭐ UNCOMMENTED and kept


const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { token } = useContext(AuthContext); 
  const isLoggedIn = !!token; 

  const ProtectedRoute = ({ element }) => {
    return isLoggedIn ? element : <Navigate to="/admin/login" replace />;
  };

  return (
    <>
      {/* Header is shown only if it's NOT an admin route */}
      {!isAdminRoute && <Header />}

      {/* Define all your application routes here */}
      <Routes>
        {/* 🌐 Public Routes - accessible to everyone */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/causes" element={<Causes />} />
        <Route path="/causes/:id" element={<ManageCauses />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blogs/:slugOrId" element={<BlogDetails />} /> {/* ⭐ BlogDetails route added from conflict ⭐ */}
        <Route path="/volunteer" element={<VolunteerForm />} />
        <Route path="/submit-cause" element={<SubmitCause/>} /> {/* ⭐ UNCOMMENTED SubmitCause route ⭐ */}

        {/* 🔒 Admin Routes - protected by authentication */}
        <Route path="/admin/login" element={<Login />} /> 

        {/* All routes below this point use ProtectedRoute */}
        <Route path="/admin/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/admin/manage-blogs" element={<ProtectedRoute element={<ManageBlogs />} />} />
        <Route path="/admin/manage-causes" element={<ProtectedRoute element={<ManageCauses />} />} />
        <Route path="/admin/manage-donations" element={<ProtectedRoute element={<ManageDonations />} />} />
        <Route path="/admin/manage-volunteers" element={<ProtectedRoute element={<ManageVolunteers />} />} />
        <Route path="/admin/manage-events" element={<ProtectedRoute element={<ManageEvents />} />} />
        <Route path="/admin/manage-contacts" element={<ProtectedRoute element={<ManageContacts />} />} />
        <Route path="/admin/manage-personal-causes" element={<ProtectedRoute element={<ManagePersonalCauses />} />} /> {/* ⭐ UNCOMMENTED ManagePersonalCauses route ⭐ */}
      </Routes>

      {/* Footer is shown only if it's NOT an admin route */}
      {!isAdminRoute && <Footer />}
      
      {/* WhatsApp component added here conditionally */}
      {!isAdminRoute && <WhatsApp />} 
    </>
  );
};

export default AppRoutes;
