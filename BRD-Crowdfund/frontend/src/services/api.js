// services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 🔁 Replace with your backend URL
});

// ✅ Automatically attach token to all requests

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Basic ${token}`; // Important: prefix with "Basic "
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
  getCausesById: (id) => API.get(`causes/${id}`)
}

export const AdminApi = {
  getevents: (id) => API.get(`admin/events/${id}`),
  updateEvents: (id, data) => API.put(`admin/events/${id}`, data),
  deleteEvents: (id) => API.delete(`admin/events/${id}`),
  getCauses: (id) => API.get(`admin/causes/${id}`),
  updateCauses: (id, data) => API.put(`admin/causes/${id}`, data),
  deleteCauses: (id) => API.delete(`admin/causes/${id}`),
  getAllEvents: () => API.get(`admin/events`),
  // createEvents: (data) => API.post(`admin/events`, data),
  createEvents: (data) => API.post(`admin/events/with-image`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  getAllCauses: () => API.get(`admin/causes`),
  // createCauses: (data) => API.post(`admin/causes`, data),
  createCauses: (data) => API.post(`admin/causes/with-image`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  getAllVolunteer: () => API.get(`admin/volunteers`),
  getAllBlogs: () => API.get(`admin/blogs`),
  getAllDonations: () => API.get(`donations`),
  // getAllContacts: () => API.get(`admin/contacts`),

}

export default API;
