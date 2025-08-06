// src/services/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
  baseURL: BASE_URL,
});

const PublicApiInstance = axios.create({
  baseURL: `${BASE_URL}/api/public`,
});

const AdminApiInstance = axios.create({
  baseURL: `${BASE_URL}/admin`,
});


// --- API Endpoints ---

export const PublicApi = {
  registerVolunteer: (data) => PublicApiInstance.post(`volunteer/register`, data),
  contactMessage: (data) => PublicApiInstance.post(`contact/send`, data),
  homePageStats: () => PublicApiInstance.get(`homepage-stats`),
  getEvents: () => PublicApiInstance.get(`events`),
  getEventById: (id) => PublicApiInstance.get(`events/${id}`),
  getDonation: () => PublicApiInstance.get(`donations`),
  getCauses: () => PublicApiInstance.get(`causes`),

  // 👇 **सिर्फ इस लाइन को ठीक किया गया है**
  getCauseById: (id) => PublicApiInstance.get(`causes/${id}`),

  getAllDonations: () => PublicApiInstance.get(`donations`),

  getBlogs: () => PublicApiInstance.get(`blogs`),
  getBlogById: (slug) => PublicApiInstance.get(`blogs/${slug}`),

  submitCauseWithImageVideoAndDocumnent: (data) => API.post(`/api/personal-cause-submissions/submit`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // submitPersonalCauseJson: (data) => API.post(`/api/personal-cause-submissions`, data, {
  //   headers: { 'Content-Type': 'application/json' }
  // }),
  // submitPersonalCauseWithImage: (formData) => API.post(`/api/personal-cause-submissions/with-image`, formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' }
  // }),
  // submitPersonalCauseWithFiles: (formData) => API.post(`/api/personal-cause-submissions/with-files`, formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' }
  // }),
  getUserSubmissionsByEmail: (email) => API.get(`/api/personal-cause-submissions/by-email/${encodeURIComponent(email)}`),
};

export const PaymentApi = {
  createDonationAndOrder: (data) => PublicApiInstance.post(`donate-and-pay`, data),
  getPayment: () => PublicApiInstance.get(`payment/currencies`),
  getSupportedCurrencies: () => PublicApiInstance.get(`payment/currencies`),
  verifyPayment: (data) => PublicApiInstance.post(`payment/verify`, data),
};


export const AdminApi = {
  _authHeader: () => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Basic ${token}` } : {};
  },

  // Events
  getAllEvents: () => AdminApiInstance.get(`events`, { headers: AdminApi._authHeader() }),
  getEventsById: (id) => AdminApiInstance.get(`events/${id}`, { headers: AdminApi._authHeader() }),
  createEvents: (data) => AdminApiInstance.post(`events/with-image`, data, { headers: AdminApi._authHeader() }),
  updateEvents: (id, data) => AdminApiInstance.put(`events/${id}/with-image`, data, { headers: AdminApi._authHeader() }),
  deleteEvents: (id) => AdminApiInstance.delete(`events/${id}`, { headers: AdminApi._authHeader() }),

  // Causes
  getAllCauses: () => AdminApiInstance.get(`causes`, { headers: AdminApi._authHeader() }),
  getCausesById: (id) => AdminApiInstance.get(`causes/${id}`, { headers: AdminApi._authHeader() }),
  // createCauses: (data) => AdminApiInstance.post(`causes/with-image`, data, { headers: AdminApi._authHeader() }),
  //   createCauses: (data) => AdminApiInstance.post(`causes/with-video`, data, { headers: AdminApi._authHeader() }),

  // updateCauses: (id, data) => AdminApiInstance.put(`causes/${id}/with-image`, data, { headers: AdminApi._authHeader() }),
  // PURANE WALE KO IN NAYE FUNCTIONS SE BADAL DEIN

  createCauseWithImage: (data) => AdminApiInstance.post(`causes/with-image`, data, { headers: { ...AdminApi._authHeader(), 'Content-Type': 'multipart/form-data' } }),
  createCauseWithVideo: (data) => AdminApiInstance.post(`causes/with-video`, data, { headers: { ...AdminApi._authHeader(), 'Content-Type': 'multipart/form-data' } }),

  updateCauseWithImage: (id, data) => AdminApiInstance.put(`causes/${id}/with-image`, data, { headers: { ...AdminApi._authHeader(), 'Content-Type': 'multipart/form-data' } }),
  updateCauseWithVideo: (id, data) => AdminApiInstance.put(`causes/${id}/with-video`, data, { headers: { ...AdminApi._authHeader(), 'Content-Type': 'multipart/form-data' } }),
  deleteCauses: (id) => AdminApiInstance.delete(`causes/${id}`, { headers: AdminApi._authHeader() }),

  // Volunteers
  getAllVolunteer: () => AdminApiInstance.get(`volunteers`, { headers: AdminApi._authHeader() }),

  // Admin Blog Endpoints
  getAllBlogs: () => AdminApiInstance.get(`blogs`, { headers: AdminApi._authHeader() }),
  getBlogById: (id) => AdminApiInstance.get(`blogs/${id}`, { headers: AdminApi._authHeader() }),
  createBlog: (data) => AdminApiInstance.post(`blogs/with-image`, data, { headers: AdminApi._authHeader() }),
  updateBlog: (id, data) => AdminApiInstance.put(`blogs/${id}/update-with-content-and-image`, data, { headers: AdminApi._authHeader() }),
  deleteBlog: (id) => AdminApiInstance.delete(`blogs/${id}`, { headers: AdminApi._authHeader() }),
  publishBlog: (id) => AdminApiInstance.post(`blogs/${id}/publish`, {}, { headers: AdminApi._authHeader() }),
  unpublishBlog: (id) => AdminApiInstance.post(`blogs/${id}/unpublish`, {}, { headers: AdminApi._authHeader() }),

  // Other Admin
  getAllDonationsAdmin: () => AdminApiInstance.get(`donations`, { headers: AdminApi._authHeader() }),
  deleteDonation: (id) => AdminApiInstance.delete(`donations/${id}`, { headers: AdminApi._authHeader() }),

  // Admin Personal Cause Submission Endpoints
  getPersonalCauseSubmissions: () => AdminApiInstance.get(`personal-cause-submissions`, { headers: AdminApi._authHeader() }),
  getPersonalCauseSubmissionById: (id) => AdminApiInstance.get(`personal-cause-submissions/${id}`, { headers: AdminApi._authHeader() }),
  getPersonalCauseSubmissionsByStatus: (status) => AdminApiInstance.get(`personal-cause-submissions/by-status/${status}`, { headers: AdminApi._authHeader() }),
  approvePersonalCauseSubmission: (id, data) => AdminApiInstance.post(`personal-cause-submissions/${id}/approve`, data, { headers: { ...AdminApi._authHeader(), 'Content-Type': 'application/json' } }),
  rejectPersonalCauseSubmission: (id, data) => AdminApiInstance.post(`personal-cause-submissions/${id}/reject`, data, { headers: { ...AdminApi._authHeader(), 'Content-Type': 'application/json' } }),
  deletePersonalCauseSubmission: (id) => AdminApiInstance.delete(`personal-cause-submissions/${id}`, { headers: AdminApi._authHeader() }),
};

export default API;