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
  registerVolunteer: (data) => API.post(`api/public/volunteer/register`, data),
  contactMessage: (data) => API.post(`api/public/contact/send`, data),
  homePageStats: () => API.get(`api/public/homepage-stats`),
  getEvents: () => API.get(`api/public/events`),
  getEventById: (id) => API.get(`api/public/events/${id}`),
  getDonation: () => API.get(`api/public/donations`),
  getCauses: () => API.get(`api/public/causes`),
  getCausesById: (id) => API.get(`api/public/causes/${id}`),
  getAllDonations: () => API.get(`api/public/donations`),
  getAllBlogs: () => API.get(`api/public/blogs`),
};

export const PaymentApi = {
  // ✅ Always attach Basic Auth for donation/payment routes
  createDonationAndOrder: (data) => API.post(`api/public/donate-and-pay`, data),
  getPayment: () => API.get(`api/public/payment/currencies`),
  getSupportedCurrencies: () => API.get(`api/public/payment/currencies`),
  verifyPayment: (data) => API.post(`api/public/payment/verify`, data),
}


export const AdminApi = {
  //events
  getevents: (id) => API.get(`admin/events/${id}`),
  updateEvents: (id, data) => API.put(`admin/events/${id}/with-image`, data),
  deleteEvents: (id) => API.delete(`admin/events/${id}`),
  getAllEvents: () => API.get(`admin/events`),
  createEvents: (data) => API.post(`admin/events/with-image`, data),

  //causes
  getCauses: (id) => API.get(`admin/causes/${id}`),
  updateCauses: (id, data) => API.put(`admin/causes/${id}/with-image`, data),
  deleteCauses: (id) => API.delete(`admin/causes/${id}`),
  getAllCauses: () => API.get(`admin/causes`),
  createCauses: (data) => API.post(`admin/causes/with-image`, data),

  //blogs
  getAllBlogs: () => API.get(`admin/blogs`),
  createBlogs: (data) => API.post(`admin/blogs`, data),
  deleteBlogs: (id) => API.delete(`admin/blogs/${id}`),
  updateBlogs: (id, data) => API.put(`admin/blogs/${id}`, data),
  getBlogById: (id) => API.get(`admin/blogs/${id}`),
  createBlogsWithImage: (data) => API.post(`admin/blogs/with-image`, data),

  //other
  getAllVolunteer: () => API.get(`admin/volunteers`),
  getAllDonations: () => API.get(`api/public/donations`),
};

export default API;
