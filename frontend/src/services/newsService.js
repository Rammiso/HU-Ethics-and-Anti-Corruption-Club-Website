import api from './api';

export const newsService = {
  // Get all news with filters
  getNews: async (filters = {}) => {
    return await api.get('/admin/news', { params: filters });
  },

  // Get published news for public
  getPublishedNews: async (filters = {}) => {
    return await api.get('/public/news/published', { params: filters });
  },

  // Get single news article
  getNewsById: async (id) => {
    return await api.get(`/admin/news/${id}`);
  },

  // Get news by slug (public)
  getNewsBySlug: async (slug) => {
    return await api.get(`/public/news/${slug}`);
  },

  // Create news article
  createNews: async (newsData) => {
    return await api.post('/admin/news', newsData);
  },

  // Update news article
  updateNews: async (id, newsData) => {
    return await api.put(`/admin/news/${id}`, newsData);
  },

  // Delete news article
  deleteNews: async (id) => {
    return await api.delete(`/admin/news/${id}`);
  },

  // Publish/unpublish news
  togglePublishStatus: async (id) => {
    return await api.patch(`/admin/news/${id}/toggle-publish`);
  },

  // Bulk operations
  bulkDelete: async (ids) => {
    return await api.post('/admin/news/bulk-delete', { ids });
  },

  bulkUpdateStatus: async (ids, status) => {
    return await api.post('/admin/news/bulk-status', { ids, status });
  },

  // Check slug availability
  checkSlugAvailability: async (slug, excludeId = null) => {
    return await api.get('/admin/news/check-slug', { 
      params: { slug, excludeId } 
    });
  },

  // Get news statistics
  getNewsStats: async () => {
    return await api.get('/admin/news/stats');
  }
};
