// src/services/api.js
import axios from 'axios';

// 🔧 مطمئن شو پورت درسته (همون پورتی که backend روشنه)
const API_BASE = 'http://localhost:5222/api';

const API = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('we_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('we_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;