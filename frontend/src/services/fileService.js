import { apiClient } from './api';

export const fileService = {
  // Upload single file
  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiClient.upload('/files/upload', formData, onUploadProgress);
  },

  // Upload multiple files
  uploadFiles: async (files, onUploadProgress) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    return await apiClient.upload('/files/upload-multiple', formData, onUploadProgress);
  },

  // Upload evidence for reports
  uploadEvidence: async (reportId, files, onUploadProgress) => {
    const formData = new FormData();
    files.forEach(file => formData.append('evidence', file));
    
    return await apiClient.upload(`/reports/${reportId}/evidence`, formData, onUploadProgress);
  },

  // Upload featured image for news/events
  uploadFeaturedImage: async (file, type, onUploadProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type); // 'news' or 'event'
    
    return await apiClient.upload('/files/featured-image', formData, onUploadProgress);
  },

  // Delete file
  deleteFile: async (fileId) => {
    return await apiClient.delete(`/files/${fileId}`);
  },

  // Get file info
  getFileInfo: async (fileId) => {
    return await apiClient.get(`/files/${fileId}`);
  },

  // Download file
  downloadFile: async (fileId, filename) => {
    return await apiClient.download(`/files/${fileId}/download`, filename);
  },

  // Get upload URL for direct upload (if using cloud storage)
  getUploadUrl: async (filename, contentType) => {
    return await apiClient.post('/files/upload-url', { filename, contentType });
  }
};