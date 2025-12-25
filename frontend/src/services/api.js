// src/services/api.js - آپدیت شده
import axios from 'axios';

// پورت backend رو چک کن
const API_BASE = 'http://localhost:3000/api';

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true // برای CORS مهمه
});

// Request Interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('we_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('🚀 API Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers
  });
  
  return config;
});

// Response Interceptor
API.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.response?.data?.error,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('we_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default API;