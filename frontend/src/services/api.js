import axios from 'axios';

const API_BASE_URL = 'http://16.171.154.218/api/' || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cases API
export const casesAPI = {
  getAll: () => api.get('/cases/'),
  getById: (id) => api.get(`/cases/${id}/`),
  create: (data) => api.post('/cases/', data),
  update: (id, data) => api.put(`/cases/${id}/`, data),
  delete: (id) => api.delete(`/cases/${id}/`),
};

// Judges API
export const judgesAPI = {
  getAll: () => api.get('/judges/'),
  getById: (id) => api.get(`/judges/${id}/`),
  create: (data) => api.post('/judges/', data),
  update: (id, data) => api.put(`/judges/${id}/`, data),
  delete: (id) => api.delete(`/judges/${id}/`),
};

// Lawyers API
export const lawyersAPI = {
  getAll: () => api.get('/lawyers/'),
  getById: (id) => api.get(`/lawyers/${id}/`),
  create: (data) => api.post('/lawyers/', data),
  update: (id, data) => api.put(`/lawyers/${id}/`, data),
  delete: (id) => api.delete(`/lawyers/${id}/`),
};

// Schedules API
export const schedulesAPI = {
  getAll: () => api.get('/schedules/'),
  getById: (id) => api.get(`/schedules/${id}/`),
  create: (data) => api.post('/schedules/', data),
  update: (id, data) => api.put(`/schedules/${id}/`, data),
  delete: (id) => api.delete(`/schedules/${id}/`),
};

// Planning API
export const planningAPI = {
  regenerate: () => api.get('/regenerate/'),
};

export default api;

