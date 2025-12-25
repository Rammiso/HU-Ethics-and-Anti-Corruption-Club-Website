import api from './api';

export const reportsService = {
  // Public report submission
  submitReport: async (reportData) => {
    return await api.post('/reports', reportData);
  },

  // Track report by tracking ID
  trackReport: async (trackingId) => {
    return await api.get(`/reports/track/${trackingId}`);
  },

  // Upload evidence for existing report
  uploadEvidence: async (trackingId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('evidence', file));
    return await api.post(`/reports/${trackingId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Admin: Get all reports with filters
  getAllReports: async (filters = {}) => {
    return await api.get('/admin/reports', { params: filters });
  },

  // Admin: Get single report details
  getReportById: async (reportId) => {
    return await api.get(`/admin/reports/${reportId}`);
  },

  // Admin: Update report status and notes
  updateReportStatus: async (reportId, updateData) => {
    return await api.put(`/admin/reports/${reportId}`, updateData);
  },

  // Admin: Assign report to admin
  assignReport: async (reportId, adminId) => {
    return await api.patch(`/admin/reports/${reportId}/assign`, { adminId });
  },

  // Admin: Add internal note
  addInternalNote: async (reportId, note) => {
    return await api.post(`/admin/reports/${reportId}/notes`, { note });
  },

  // Admin: Send message to reporter
  sendMessageToReporter: async (reportId, message) => {
    return await api.post(`/admin/reports/${reportId}/message`, { message });
  },

  // Admin: Get report statistics
  getReportStats: async () => {
    return await api.get('/admin/reports/stats');
  },

  // Admin: Export reports
  exportReports: async (filters = {}, format = 'csv') => {
    return await api.get('/admin/reports/export', { 
      params: { ...filters, format },
      responseType: 'blob'
    });
  },

  // Admin: Bulk operations
  bulkUpdateStatus: async (reportIds, status) => {
    return await api.post('/admin/reports/bulk-status', { reportIds, status });
  },

  bulkAssign: async (reportIds, adminId) => {
    return await api.post('/admin/reports/bulk-assign', { reportIds, adminId });
  },

  // Get report categories
  getCategories: async () => {
    return await api.get('/reports/categories');
  },

  // Admin: Manage categories
  createCategory: async (categoryData) => {
    return await api.post('/admin/reports/categories', categoryData);
  },

  updateCategory: async (categoryId, categoryData) => {
    return await api.put(`/admin/reports/categories/${categoryId}`, categoryData);
  },

  deleteCategory: async (categoryId) => {
    return await api.delete(`/admin/reports/categories/${categoryId}`);
  },

  toggleCategoryStatus: async (categoryId) => {
    return await api.patch(`/admin/reports/categories/${categoryId}/toggle`);
  },

  reorderCategories: async (categoryOrders) => {
    return await api.post('/admin/reports/categories/reorder', { categoryOrders });
  }
};
