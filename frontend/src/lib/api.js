import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('joboost_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('joboost_token');
      localStorage.removeItem('joboost_user');
      // Don't redirect if already on auth pages
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  handleSession: (sessionId) => api.get('/auth/session', {
    headers: { 'X-Session-ID': sessionId }
  }),
};

// Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  save: (data) => api.post('/profile', data),
};

// Applications API
export const applicationsAPI = {
  getAll: () => api.get('/applications'),
  get: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status?status=${status}`),
};

// AI Generation API
export const aiAPI = {
  generate: (applicationId, type) => api.post('/ai/generate', {
    application_id: applicationId,
    generation_type: type,
  }),
};

// Payments API
export const paymentsAPI = {
  createCheckout: (plan, originUrl) => api.post('/payments/checkout', { plan, origin_url: originUrl }),
  getStatus: (sessionId) => api.get(`/payments/status/${sessionId}`),
};

// Stats API
export const statsAPI = {
  get: () => api.get('/stats'),
};

export default api;
