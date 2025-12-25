import api from './api';

export const adminService = {
  getDashboard: async () => {
    return await api.get('/admin/dashboard');
  },

  getUsers: async (filters) => {
    return await api.get('/admin/users', { params: filters });
  },

  createUser: async (userData) => {
    return await api.post('/admin/users', userData);
  },

  updateUser: async (id, userData) => {
    return await api.put(`/admin/users/${id}`, userData);
  },

  getAuditLogs: async (filters) => {
    return await api.get('/admin/audit-logs', { params: filters });
  },
};
