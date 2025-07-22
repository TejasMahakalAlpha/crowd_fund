// services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/', // 🔁 Replace with your backend URL
});

// ✅ Automatically attach token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

export default API;
