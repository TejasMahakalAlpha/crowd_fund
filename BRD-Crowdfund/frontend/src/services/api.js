// src/services/api.js
import axios from 'axios';

// const username = import.meta.env.VITE_DONATION_API_USERNAME;
// const password = import.meta.env.VITE_DONATION_API_PASSWORD;
// const basicAuth = "Basic " + btoa(`${username}:${password}`);

// const API = axios.create({ baseURL: API_BASE_URL });
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 🔁 Set in your .env file
});
// ✅ Attach admin token only for admin routes
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Basic ${token}`;
  }
  return config;
});


export const PublicApi = {
  registerVolunteer: (data) => API.post(`volunteer/register`, data),
  contactMessage: (data) => API.post(`contact/send`, data),
  homePageStats: () => API.get(`homepage-stats`),
  getEvents: () => API.get(`events`),
  getEventById: (id) => API.get(`events/${id}`),
  getDonation: () => API.get(`donations`),
  getCauses: () => API.get(`causes`),
  getCausesById: (id) => API.get(`causes/${id}`),
  getAllDonations: () => API.get(`donations`),
};

export const PaymentApi = {
  // ✅ Always attach Basic Auth for donation/payment routes
  createDonationAndOrder: (data) => API.post(`donate-and-pay`, data),
  getPayment: () => API.get(`payment/currencies`),
  getSupportedCurrencies: () => API.get(`payment/currencies`),
  verifyPayment: (data) => API.post(`payment/verify`, data),
}


export const AdminApi = {
  getevents: (id) => API.get(`admin/events/${id}`),
  updateEvents: (id, data) => API.put(`admin/events/${id}/with-image`, data),
  deleteEvents: (id) => API.delete(`admin/events/${id}`),
  getCauses: (id) => API.get(`admin/causes/${id}`),
  updateCauses: (id, data) => API.put(`admin/causes/${id}/with-image`, data),
  deleteCauses: (id) => API.delete(`admin/causes/${id}`),
  getAllEvents: () => API.get(`admin/events`),
  createEvents: (data) => API.post(`admin/events/with-image`, data),
  getAllCauses: () => API.get(`admin/causes`),
  createCauses: (data) => API.post(`admin/causes/with-image`, data),
  getAllVolunteer: () => API.get(`admin/volunteers`),
  getAllBlogs: () => API.get(`admin/blogs`),
  getAllDonations: () => API.get(`donations`),
};

export default API;
