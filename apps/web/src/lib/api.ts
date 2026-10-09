import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: Add access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: Handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post('/api/auth/refresh', {
            refreshToken,
          });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          }
          return api(originalRequest);
        }
      } catch {
        // Refresh failed - logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

// API endpoints
export const authApi = {
  register: (data: { phone: string; password: string; fullName: string; birthDate?: string; otpCode: string }) =>
    api.post('/auth/register', data),

  login: (data: { phone: string; password: string; twoFaCode?: string }) =>
    api.post('/auth/login', data),

  sendOtp: (phone: string) =>
    api.post('/auth/send-otp', { phone }),

  verifyOtp: (phone: string, code: string) =>
    api.post('/auth/verify-otp', { phone, code }),

  getProfile: () =>
    api.get('/auth/profile'),

  logout: (refreshToken?: string) =>
    api.post('/auth/logout', { refreshToken }),
};

// Obligations API
export const obligationsApi = {
  list: (filters?: { status?: string; category?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    return api.get(`/obligations?${params.toString()}`);
  },
  today: () => api.get('/obligations/today'),
  upcoming: (days = 30) => api.get(`/obligations/upcoming?days=${days}`),
  stats: () => api.get('/obligations/stats'),
  get: (id: string) => api.get(`/obligations/${id}`),
  create: (data: any) => api.post('/obligations', data),
  update: (id: string, data: any) => api.patch(`/obligations/${id}`, data),
  complete: (id: string) => api.post(`/obligations/${id}/complete`),
  remove: (id: string) => api.delete(`/obligations/${id}`),
};

// Assets API
export const assetsApi = {
  list: (filters?: { type?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    return api.get(`/assets?${params.toString()}`);
  },
  stats: () => api.get('/assets/stats'),
  get: (id: string) => api.get(`/assets/${id}`),
  create: (data: any) => api.post('/assets', data),
  update: (id: string, data: any) => api.patch(`/assets/${id}`, data),
  remove: (id: string) => api.delete(`/assets/${id}`),
};

// Family API
export const familyApi = {
  create: (data: { name: string; plan?: string }) => api.post('/family', data),
  getMy: () => api.get('/family/me'),
  getOne: (id: string) => api.get(`/family/${id}`),
  invite: (data: { phone: string; role?: string; relation?: string }) =>
    api.post('/family/invite', data),
  accept: (code: string) => api.post(`/family/accept/${code}`),
  updateMember: (id: string, data: any) => api.patch(`/family/members/${id}`, data),
  removeMember: (id: string) => api.delete(`/family/members/${id}`),
  delete: () => api.delete('/family'),
};

// Finance API
export const financeApi = {
  // Transactions
  createTransaction: (data: any) => api.post('/finance/transactions', data),
  getTransactions: (filters?: { type?: string; from?: string; to?: string }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    return api.get(`/finance/transactions?${params.toString()}`);
  },
  updateTransaction: (id: string, data: any) => api.patch(`/finance/transactions/${id}`, data),
  deleteTransaction: (id: string) => api.delete(`/finance/transactions/${id}`),

  // Stats
  getStats: (period?: 'month' | 'year') => api.get(`/finance/stats?period=${period || 'month'}`),
  getChart: (months = 6) => api.get(`/finance/chart?months=${months}`),

  // Budgets
  createBudget: (data: any) => api.post('/finance/budgets', data),
  getBudgets: () => api.get('/finance/budgets'),
  deleteBudget: (id: string) => api.delete(`/finance/budgets/${id}`),
};

// Notifications API
export const notificationsApi = {
  list: (filters?: { unreadOnly?: boolean; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.unreadOnly) params.append('unreadOnly', 'true');
    if (filters?.limit) params.append('limit', filters.limit.toString());
    return api.get(`/notifications?${params.toString()}`);
  },
  unreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  remove: (id: string) => api.delete(`/notifications/${id}`),
};

// Documents API
export const documentsApi = {
  list: (type?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    return api.get(`/documents?${params.toString()}`);
  },
  stats: () => api.get('/documents/stats'),
  get: (id: string) => api.get(`/documents/${id}`),
  download: (id: string) => api.get(`/documents/${id}/download`),
  remove: (id: string) => api.delete(`/documents/${id}`),

  upload: (file: File, type: string, name?: string, expiresAt?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (name) formData.append('name', name);
    if (expiresAt) formData.append('expiresAt', expiresAt);

    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
};

// Stream document as blob
export const streamDocument = async (id: string): Promise<Blob> => {
  const response = await api.get(`/documents/${id}/stream`, {
    responseType: 'blob',
  });
  return response.data;
};

// Settings API
export const settingsApi = {
  updateProfile: (data: { fullName?: string; birthDate?: string }) =>
    api.patch('/settings/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/settings/password', data),

  setup2FA: () => api.post('/settings/2fa/setup'),
  verify2FA: (code: string) => api.post('/settings/2fa/verify', { code }),
  disable2FA: (code: string) => api.post('/settings/2fa/disable', { code }),
  getBackupCodes: () => api.get('/settings/2fa/backup-codes'),
  regenerateBackupCodes: () => api.post('/settings/2fa/backup-codes/regenerate'),

  getSessions: () => api.get('/settings/sessions'),

  deleteAccount: (password: string) =>
    api.delete('/settings/account', { data: { password } }),
};

// Reports API
export const reportsApi = {
  overview: () => api.get('/reports/overview'),
  disciplineHistory: (months = 6) =>
    api.get(`/reports/discipline-history?months=${months}`),
  obligationsByCategory: () => api.get('/reports/obligations-by-category'),
  yearlySummary: () => api.get('/reports/yearly-summary'),
};

// Family Tree
export const familyTreeApi = {
  getTree: () => api.get('/family/tree'),
};

// Dashboard Summary
export const dashboardApi = {
  summary: () => api.get('/reports/dashboard-summary'),
};

// Search API
export const searchApi = {
  query: (q: string, limit = 20) =>
    api.get(`/search?q=${encodeURIComponent(q)}&limit=${limit}`),
};

// Terms API
export const termsApi = {
  get: () => api.get('/terms'),
  accept: (version: string) => api.post('/terms/accept', { version }),
  check: () => api.get('/terms/check'),
};

// Add storage endpoint
const _storageApi = {
  getStats: () => api.get('/documents/storage'),
};

// ═══════════════════════════════════════════
// Plans API
// ═══════════════════════════════════════════

export const plansApi = {
  list: () => api.get('/plans'),
  byCode: (code: string) => api.get(`/plans/code/${code}`),
};

// ═══════════════════════════════════════════
// Subscription API
// ═══════════════════════════════════════════

export const subscriptionApi = {
  me: () => api.get('/subscriptions/me'),
  history: () => api.get('/subscriptions/history'),
  cancel: () => api.post('/subscriptions/cancel'),
};

// ═══════════════════════════════════════════
// Plan limits / usage
// ═══════════════════════════════════════════

export const planApi = {
  usage: () => api.get('/plan/usage'),
};

// ═══════════════════════════════════════════
// Payment API (card-to-card)
// ═══════════════════════════════════════════

export const paymentApi = {
  create: (data: FormData) =>
    api.post('/payments', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  mine: () => api.get('/payments/me'),
  adminAll: (status?: string) =>
    api.get(`/payments/admin/all${status ? `?status=${status}` : ''}`),
  adminApprove: (id: string, adminNote?: string) =>
    api.post(`/payments/admin/${id}/approve`, { adminNote }),
  adminReject: (id: string, adminNote?: string) =>
    api.post(`/payments/admin/${id}/reject`, { adminNote }),
};

// ═══════════════════════════════════════════
// Ticket API
// ═══════════════════════════════════════════

export const ticketApi = {
  create: (data: {
    subject: string;
    category?: string;
    priority?: string;
    body: string;
  }) => api.post('/tickets', data),
  mine: () => api.get('/tickets/me'),
  get: (id: string) => api.get(`/tickets/${id}`),
  reply: (id: string, body: string) =>
    api.post(`/tickets/${id}/messages`, { body }),
  adminAll: (status?: string) =>
    api.get(`/tickets/admin/all${status ? `?status=${status}` : ''}`),
  adminReply: (id: string, body: string) =>
    api.post(`/tickets/admin/${id}/messages`, { body }),
  adminSetStatus: (id: string, status: string, note?: string) =>
    api.patch(`/tickets/admin/${id}/status`, { status, note }),
};

// ═══════════════════════════════════════════
// Market API
// ═══════════════════════════════════════════

export const marketApi = {
  prices: () => api.get('/market/prices'),
  history: (symbol: string, days = 30) =>
    api.get(`/market/history/${symbol}?days=${days}`),
};
