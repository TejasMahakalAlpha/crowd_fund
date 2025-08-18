// src/routes/AppRoutes.jsx
import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Home from '../pages/Home';
import About from '../pages/About';
import Causes from '../pages/Causes';
import Contact from '../pages/Contact';
import Events from '../pages/Events';
import Gallery from '../pages/Gallery';
import Blog from '../pages/Blog';
import BlogDetails from '../pages/BlogDetails';
import VolunteerForm from '../pages/VolunteerForm';
import SubmitCause from '../pages/SubmitCause';
import WhatsApp from '../components/WhatsApp';
import CauseDetails from '../components/CausesDetails'; // Sahi component import karein
import EventDetailPage from '../components/EventDetailPage';
import Login from '../admin/Login';
import Dashboard from '../admin/Dashboard';
import ManageBlogs from '../admin/ManageBlogs';
import ManageCauses from '../admin/ManageCauses';
import ManageDonations from '../admin/ManageDonations';
import ManageVolunteers from '../admin/ManageVolunteers';
import ManageEvents from '../admin/ManageEvents';
import ManageContacts from "../admin/ManageContacts";
import ManagePersonalCauses from '../admin/ManagePersonalCauses';

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { token } = useContext(AuthContext);
  const isLoggedIn = !!token;

  const ProtectedRoute = ({ element }) => {
    return isLoggedIn ? element : <Navigate to="/admin/login" replace />;
  };

  useEffect(() => {
    // ✅ YAHAN BADLAAV KIYA GAYA HAI
    // Yeh check karega ki code browser mein chal raha hai ya nahi
    if (typeof window !== 'undefined') {
      if (!isAdminRoute) {
        document.body.style.paddingTop = "60px"; // Ab yeh sirf browser mein chalega
      } else {
        document.body.style.paddingTop = "0";
      }
    }
  }, [isAdminRoute]);

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/causes" element={<Causes />} />
        <Route path="/causes/:causeSlug" element={<CauseDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetails />} />
        <Route path="/volunteer" element={<VolunteerForm />} />
        <Route path="/submit-cause" element={<SubmitCause />} />
        <Route path="/events/:eventSlug" element={<EventDetailPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/admin/manage-blogs" element={<ProtectedRoute element={<ManageBlogs />} />} />
        <Route path="/admin/manage-causes" element={<ProtectedRoute element={<ManageCauses />} />} />
        <Route path="/admin/manage-donations" element={<ProtectedRoute element={<ManageDonations />} />} />
        <Route path="/admin/manage-volunteers" element={<ProtectedRoute element={<ManageVolunteers />} />} />
        <Route path="/admin/manage-events" element={<ProtectedRoute element={<ManageEvents />} />} />
        <Route path="/admin/manage-contacts" element={<ProtectedRoute element={<ManageContacts />} />} />
        <Route path="/admin/manage-personal-causes" element={<ProtectedRoute element={<ManagePersonalCauses />} />} />
      </Routes>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsApp />}
    </>
  );
};

export default AppRoutes;