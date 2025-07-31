// src/services/api.js
import axios from 'axios';

// ✅ IMPORTANT: VITE_API_BASE_URL should be set in your .env file in the project root.
// Example: VITE_API_BASE_URL=https://cloud-fund-i1kt.onrender.com
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- 1. Main API Instance (for general use or endpoints not fitting specific prefixes) ---
// This instance is used for endpoints like /api/personal-cause-submissions which are not under /api/public or /admin
const API = axios.create({
  baseURL: BASE_URL,
});

// --- 2. Public API Instance ---
// This instance is for all public routes like /api/public/causes, /api/public/volunteer/register etc.
const PublicApiInstance = axios.create({
  baseURL: `${BASE_URL}/api/public`,
});

// --- 3. Admin API Instance ---
// This instance is for all admin routes.
const AdminApiInstance = axios.create({
  baseURL: `${BASE_URL}/admin`,
});


// --- API Endpoints ---

export const PublicApi = {
  // All these calls will now go to BASE_URL/api/public/...
  registerVolunteer: (data) => PublicApiInstance.post(`volunteer/register`, data),
  contactMessage: (data) => PublicApiInstance.post(`contact/send`, data),
  homePageStats: () => PublicApiInstance.get(`homepage-stats`),
  getEvents: () => PublicApiInstance.get(`events`),
  getEventById: (id) => PublicApiInstance.get(`events/${id}`),
  getDonation: () => PublicApiInstance.get(`donations`),
  getCauses: () => PublicApiInstance.get(`causes`),
  getCausesById: (id) => PublicApiInstance.get(`causes/${id}`),
  getAllDonations: () => PublicApiInstance.get(`donations`), // If this is a public endpoint

  // Public Blog Endpoints (Confirmed by Swagger to be under /api/public/)
  getBlogs: () => PublicApiInstance.get(`blogs`),
  getBlogById: (slug) => PublicApiInstance.get(`blogs/${slug}`), // Assuming you fetch by slug for public detail page

  // ⭐ NEW: Personal Cause Submission Public Endpoints (using main API instance 'API' as per docs)
  submitPersonalCauseJson: (data) => API.post(`/api/personal-cause-submissions`, data, {
    headers: { 'Content-Type': 'application/json' } // Explicitly set for JSON body
  }),
  submitPersonalCauseWithImage: (formData) => API.post(`/api/personal-cause-submissions/with-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' } // Important for FormData
  }),
  submitPersonalCauseWithFiles: (formData) => API.post(`/api/personal-cause-submissions/with-files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' } // Important for FormData
  }),
  getUserSubmissionsByEmail: (email) => API.get(`/api/personal-cause-submissions/by-email/${encodeURIComponent(email)}`),
};

export const PaymentApi = {
  // These might also go through PublicApiInstance if they don't require admin auth
  createDonationAndOrder: (data) => PublicApiInstance.post(`donate-and-pay`, data),
  getPayment: () => PublicApiInstance.get(`payment/currencies`),
  getSupportedCurrencies: () => PublicApiInstance.get(`payment/currencies`),
  verifyPayment: (data) => PublicApiInstance.post(`payment/verify`, data),
};


export const AdminApi = {
  // Helper to attach Basic Auth headers
  _authHeader: () => {
    const token = localStorage.getItem("adminToken"); // This token is the base64(username:password)
    return token ? { Authorization: `Basic ${token}` } : {};
  },

  // All these calls will now go to BASE_URL/admin/... and will include the Basic token
  // Events (These will hit /admin/events)
  getAllEvents: () => AdminApiInstance.get(`events`, { headers: AdminApi._authHeader() }),
  getEventsById: (id) => AdminApiInstance.get(`events/${id}`, { headers: AdminApi._authHeader() }),
  createEvents: (data) => AdminApiInstance.post(`events/with-image`, data, { headers: AdminApi._authHeader() }),
  updateEvents: (id, data) => AdminApiInstance.put(`events/${id}/with-image`, data, { headers: AdminApi._authHeader() }),
  deleteEvents: (id) => AdminApiInstance.delete(`events/${id}`, { headers: AdminApi._authHeader() }),

  // Causes
  getAllCauses: () => AdminApiInstance.get(`causes`, { headers: AdminApi._authHeader() }),
  getCausesById: (id) => AdminApiInstance.get(`causes/${id}`, { headers: AdminApi._authHeader() }),
  createCauses: (data) => AdminApiInstance.post(`causes/with-image`, data, { headers: AdminApi._authHeader() }),
  updateCauses: (id, data) => AdminApiInstance.put(`causes/${id}/with-image`, data, { headers: AdminApi._authHeader() }),
  deleteCauses: (id) => AdminApiInstance.delete(`causes/${id}`, { headers: AdminApi._authHeader() }),

  // Volunteers
  getAllVolunteer: () => AdminApiInstance.get(`volunteers`, { headers: AdminApi._authHeader() }),

  // Admin Blog Endpoints (Confirmed by Swagger to be under /admin/)
  getAllBlogs: () => AdminApiInstance.get(`blogs`, { headers: AdminApi._authHeader() }),
  getBlogById: (id) => AdminApiInstance.get(`blogs/${id}`, { headers: AdminApi._authHeader() }),
  createBlog: (data) => AdminApiInstance.post(`blogs/with-image`, data, { headers: AdminApi._authHeader() }),
  updateBlog: (id, data) => AdminApiInstance.put(`blogs/${id}/update-with-content-and-image`, data, { headers: AdminApi._authHeader() }),
  deleteBlog: (id) => AdminApiInstance.delete(`blogs/${id}`, { headers: AdminApi._authHeader() }),
  publishBlog: (id) => AdminApiInstance.post(`blogs/${id}/publish`, {}, { headers: AdminApi._authHeader() }),
  unpublishBlog: (id) => AdminApiInstance.post(`blogs/${id}/unpublish`, {}, { headers: AdminApi._authHeader() }),


  // Other Admin
  getAllDonationsAdmin: () => AdminApiInstance.get(`donations`, { headers: AdminApi._authHeader() }),
  deleteDonation: (id) => AdminApiInstance.delete(`donations/${id}`, { headers: AdminApi._authHeader() }), // Added delete donation

  // ⭐ NEW: Admin Personal Cause Submission Endpoints ⭐
  getPersonalCauseSubmissions: () => AdminApiInstance.get(`personal-cause-submissions`, { headers: AdminApi._authHeader() }),
  getPersonalCauseSubmissionById: (id) => AdminApiInstance.get(`personal-cause-submissions/${id}`, { headers: AdminApi._authHeader() }),
  getPersonalCauseSubmissionsByStatus: (status) => AdminApiInstance.get(`personal-cause-submissions/by-status/${status}`, { headers: AdminApi._authHeader() }),
  approvePersonalCauseSubmission: (id, data) => AdminApiInstance.post(`personal-cause-submissions/${id}/approve`, data, { headers: { ...AdminApi._authHeader(), 'Content-Type': 'application/json' } }),
  rejectPersonalCauseSubmission: (id, data) => AdminApiInstance.post(`personal-cause-submissions/${id}/reject`, data, { headers: { ...AdminApi._authHeader(), 'Content-Type': 'application/json' } }),
  deletePersonalCauseSubmission: (id) => AdminApiInstance.delete(`personal-cause-submissions/${id}`, { headers: AdminApi._authHeader() }),
};

export default API;