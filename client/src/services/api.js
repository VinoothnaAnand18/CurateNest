import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('curatenest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('curatenest_token');
        localStorage.removeItem('curatenest_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
  seed: () => api.post('/books/seed'),
};

export const progressAPI = {
  updateProgress: (bookId, data) => api.put(`/books/${bookId}/progress`, data),
  getHistory: () => api.get('/reading-history'),
};

export const goalsAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
};

export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const aiAPI = {
  getSummary: (data) => api.post('/ai/summary', data),
  getRecommendations: (data) => api.post('/ai/recommendations', data),
  chat: (data) => api.post('/ai/chat', data),
};

export const ragAPI = {
  getDocuments: () => api.get('/rag/documents'),
  upload: (formData) => api.post('/rag/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteDocument: (id) => api.delete(`/rag/documents/${id}`),
  chat: (data) => api.post('/rag/chat', data),
};

export default api;
