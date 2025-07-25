import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 🔁 Set in your .env file
});

// ✅ Automatically attach token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Basic ${token}`;
  }
  return config;
});

export const PublicApi = {
  registerVolunteer: (data) => API.post(`volunteer/register`, data),
  donate: (data) => API.post(`donate`, data),
  contactMessage: (data) => API.post(`contact/send`, data),
  getPayment: () => API.get(`payment/currencies`),
  homePageStats: () => API.get(`homepage-stats`),
  getEvents: () => API.get(`events`),
  getEventById: (id) => API.get(`events/${id}`),
  getDonation: () => API.get(`donations`),
  getCauses: () => API.get(`causes`),
  getCausesById: (id) => API.get(`causes/${id}`),

  // ✅ Razorpay integration
  makeDonation: (donationData) => API.post(`/donate`, donationData),
  getAllDonations: () => API.get(`/donations`),
  getSupportedCurrencies: () => API.get(`/payment/currencies`),

  // ✅   ⭐ Add these for the new payment flow:
  createDonationAndOrder: (donationData) => API.post(`/donate-and-pay`, donationData),
  verifyPayment: (verifyData) => API.post(`/payment/verify`, verifyData),
};

export const AdminApi = {
  getevents: (id) => API.get(`admin/events/${id}`),
  updateEvents: (id, data) => API.put(`admin/events/${id}/with-image`, data),
  deleteEvents: (id) => API.delete(`admin/events/${id}`),
  getCauses: (id) => API.get(`admin/causes/${id}`),
  updateCauses: (id, data) => API.put(`admin/causes/${id}/with-image`, data),
  deleteCauses: (id) => API.delete(`admin/causes/${id}`),
  getAllEvents: () => API.get(`admin/events`),
  // createEvents: (data) => API.post(`admin/events`, data),
  createEvents: (data) => API.post(`admin/events/with-image`, data),
  getAllCauses: () => API.get(`admin/causes`),
  // createCauses: (data) => API.post(`admin/causes`, data),
  createCauses: (data) => API.post(`admin/causes/with-image`, data),
  getAllVolunteer: () => API.get(`admin/volunteers`),
  getAllBlogs: () => API.get(`admin/blogs`),
  getAllDonations: () => API.get(`donations`),
  // getAllContacts: () => API.get(`admin/contacts`),
};

export default API;
