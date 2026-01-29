import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  setup2FA: () => api.post('/auth/setup-2fa'),
  enable2FA: (token) => api.post('/auth/enable-2fa', { token }),
  disable2FA: (token, password) => api.post('/auth/disable-2fa', { token, password }),
  verify2FA: (email, token) => api.post('/auth/verify-2fa', { email, token })
};

// Goals API
export const goalsAPI = {
  createGoal: (data) => api.post('/goals', data),
  getGoals: (status) => api.get('/goals', { params: { status } }),
  getGoal: (id) => api.get(`/goals/${id}`),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
  getRecommendations: (id) => api.get(`/goals/${id}/recommendations`)
};

// Chat API
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getChatHistory: (params) => api.get('/chat/history', { params }),
  getActiveSession: () => api.get('/chat/session'),
  createSession: () => api.post('/chat/session'),
  endSession: (sessionId) => api.put(`/chat/session/${sessionId}/end`),
  getRecommendations: (limit) => api.get('/chat/recommendations', { params: { limit } }),
  recordAction: (data) => api.post('/chat/action', data)
};

// Market API
export const marketAPI = {
  getQuote: (symbol) => api.get(`/market/quote/${symbol}`),
  search: (query, limit) => api.get('/market/search', { params: { q: query, limit } }),
  getTrending: (limit) => api.get('/market/trending', { params: { limit } }),
  getGainers: (limit) => api.get('/market/gainers', { params: { limit } }),
  getArticles: (symbol, limit) => api.get(`/market/articles/${symbol}`, { params: { limit } }),
  getOverview: () => api.get('/market/overview')
};

// Portfolio API
export const portfolioAPI = {
  createPortfolio: (data) => api.post('/portfolios', data),
  getPortfolios: () => api.get('/portfolios'),
  getPortfolio: (id) => api.get(`/portfolios/${id}`),
  updatePortfolio: (id, data) => api.put(`/portfolios/${id}`, data),
  deletePortfolio: (id) => api.delete(`/portfolios/${id}`),
  addTransaction: (portfolioId, data) => api.post(`/portfolios/${portfolioId}/transactions`, data),
  getTransactions: (portfolioId, params) => api.get(`/portfolios/${portfolioId}/transactions`, { params }),
  refreshPrices: (portfolioId) => api.post(`/portfolios/${portfolioId}/refresh-prices`),
  getPerformance: (portfolioId) => api.get(`/portfolios/${portfolioId}/performance`)
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  getRecentActivity: (params) => api.get('/admin/activity', { params }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  updateUserStatus: (userId, isActive) => api.patch(`/admin/users/${userId}/status`, { isActive }),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  getSystemHealth: () => api.get('/admin/health'),
  generateActivityReport: (params) => api.get('/admin/reports/activity', { params, responseType: 'blob' }),
  generateUsageReport: (params) => api.get('/admin/reports/usage', { params, responseType: 'blob' }),
  generatePerformanceReport: (params) => api.get('/admin/reports/performance', { params, responseType: 'blob' })
};

export default api;
