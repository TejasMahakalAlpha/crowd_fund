// src/services/api.js
import axios from 'axios';

// ✅ IMPORTANT: VITE_API_BASE_URL will now be just the base domain, e.g., https://cloud-fund-i1kt.onrender.com or http://localhost:8080
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- 1. Main API Instance (for general use if needed, but we'll use specific ones) ---
const API = axios.create({
  baseURL: BASE_URL,
});

// --- 2. Public API Instance ---
// This instance will be used for all public routes like /api/public/causes, /api/public/volunteer/register etc.
// It does NOT attach any authentication token.
const PublicApiInstance = axios.create({
  baseURL: `${BASE_URL}/api/public`,
});

// --- 3. Admin API Instance ---
// This instance will be used for all admin routes like /api/admin/causes, /api/admin/login etc.
// It will ATTACH the adminToken from localStorage.
const AdminApiInstance = axios.create({
  baseURL: `${BASE_URL}/api/admin`, // Assuming your admin routes start with /api/admin
});

// Request Interceptor for Admin API Instance: Attach the JWT to outgoing requests
AdminApiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken"); // Retrieve the token (expecting a JWT now)
    if (token) {
      // ✅ Change from 'Basic' to 'Bearer' for JWT authentication
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response Interceptor for Admin API Instance to handle 401/403 errors
AdminApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Authentication/Authorization error for Admin API. Redirecting to login.");
      localStorage.removeItem("adminToken"); // Clear invalid token
      // You might want to use react-router-dom's navigate here, e.g., navigate('/admin/login');
      // For simplicity, using window.location for now, but better to handle in AuthContext or higher component
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);


// --- API Endpoints ---

export const PublicApi = {
  // All these calls will now go to BASE_URL/api/public/...
  registerVolunteer: (data) => PublicApiInstance.post(`volunteer/register`, data),
  contactMessage: (data) => PublicApiInstance.post(`contact/send`, data),
  homePageStats: () => PublicApiInstance.get(`homepage-stats`),
  getEvents: () => PublicApiInstance.get(`events`),
  getEventById: (id) => PublicApiInstance.get(`events/${id}`),
  getDonation: () => PublicApiInstance.get(`donations`),
  getCauses: () => PublicApiInstance.get(`causes`), // This will hit /api/public/causes
  getCausesById: (id) => PublicApiInstance.get(`causes/${id}`),
  getAllDonations: () => PublicApiInstance.get(`donations`), // This will hit /api/public/donations (if public)

  // ✅ NEW: Public Blog Endpoints
  getBlogs: () => PublicApiInstance.get(`blogs`), // Get all public blogs
  getBlogById: (id) => PublicApiInstance.get(`blogs/${id}`), // Get a single public blog by ID
};

export const PaymentApi = {
  // These might also go through PublicApiInstance if they don't require admin auth
  // Assuming these are also public-facing under /api/public
  createDonationAndOrder: (data) => PublicApiInstance.post(`donate-and-pay`, data),
  getPayment: () => PublicApiInstance.get(`payment/currencies`),
  getSupportedCurrencies: () => PublicApiInstance.get(`payment/currencies`),
  verifyPayment: (data) => PublicApiInstance.post(`payment/verify`, data),
};


export const AdminApi = {
  // Admin Login (This will use AdminApiInstance, which has no token initially, but receives it)
  // Ensure your backend has a POST /api/admin/login endpoint that returns a JWT
  login: (credentials) => AdminApiInstance.post(`/login`, credentials), // This will hit /api/admin/login

  // All these calls will now go to BASE_URL/api/admin/... and will include the Bearer token
  // Events
  getAllEvents: () => AdminApiInstance.get(`events`), // All events (renamed for consistency)
  getEventsById: (id) => AdminApiInstance.get(`events/${id}`), // Specific event
  updateEvents: (id, data) => AdminApiInstance.put(`events/${id}/with-image`, data), // For multipart/form-data
  deleteEvents: (id) => AdminApiInstance.delete(`events/${id}`),
  createEvents: (data) => AdminApiInstance.post(`events/with-image`, data), // For multipart/form-data

  // Causes
  getAllCauses: () => AdminApiInstance.get(`causes`), // All causes (renamed for consistency)
  getCausesById: (id) => AdminApiInstance.get(`causes/${id}`), // Specific cause
  updateCauses: (id, data) => AdminApiInstance.put(`causes/${id}/with-image`, data), // For multipart/form-data
  deleteCauses: (id) => AdminApiInstance.delete(`causes/${id}`),
  createCauses: (data) => AdminApiInstance.post(`causes/with-image`, data), // For multipart/form-data

  // Volunteers
  getAllVolunteer: () => AdminApiInstance.get(`volunteers`),
  createVolunteer: (data) => AdminApiInstance.post(`volunteers`, data), // For admin panel to add volunteer

  // ✅ NEW: Admin Blog Endpoints
  getAllBlogs: () => AdminApiInstance.get(`blogs`), // Get all blogs for admin
  getBlogById: (id) => AdminApiInstance.get(`blogs/${id}`), // Get a single blog by ID for editing
  createBlog: (data) => AdminApiInstance.post(`blogs/with-image`, data), // Create a new blog (expects FormData with image)
  updateBlog: (id, data) => AdminApiInstance.put(`blogs/${id}/with-image`, data), // Update a blog (expects FormData with image)
  deleteBlog: (id) => AdminApiInstance.delete(`blogs/${id}`), // Delete a blog by ID

  // Other Admin
  getAllDonationsAdmin: () => AdminApiInstance.get(`donations`), // Admin-specific donations view
};

// Export the main API instance if needed for other routes not explicitly categorized
export default API;