import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/admin';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AdminAPI = {
  // Stats
  getStats: () => api.get('/stats').then(res => res.data),

  // Customers
  getCustomers: () => api.get('/customers').then(res => res.data),
  createCustomer: (data) => api.post('/customers', data).then(res => res.data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data).then(res => res.data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`).then(res => res.data),

  // Staff
  getStaff: () => api.get('/staff').then(res => res.data),
  createStaff: (data) => api.post('/staff', data).then(res => res.data),
  deleteStaff: (id) => api.delete(`/staff/${id}`).then(res => res.data),

  // Questions
  getQuestions: (customerId) => api.get('/questions', { params: customerId ? { customerId } : {} }).then(res => res.data),
  createQuestion: (data) => api.post('/questions', data).then(res => res.data),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data).then(res => res.data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`).then(res => res.data),

  // Jobs
  getJobs: () => api.get('/jobs').then(res => res.data),
  createJob: (data) => api.post('/jobs', data).then(res => res.data),
  deleteJob: (id) => api.delete(`/jobs/${id}`).then(res => res.data),
};

export default api;

