import api from './api';

export const reportsService = {
  submitReport: async (reportData) => {
    return await api.post('/reports', reportData);
  },

  trackReport: async (trackingId) => {
    return await api.get(`/reports/track/${trackingId}`);
  },

  uploadEvidence: async (trackingId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('evidence', file));
    return await api.post(`/reports/${trackingId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getAllReports: async (filters) => {
    return await api.get('/admin/reports', { params: filters });
  },

  updateReportStatus: async (reportId, status, notes) => {
    return await api.put(`/admin/reports/${reportId}`, { status, notes });
  },
};
