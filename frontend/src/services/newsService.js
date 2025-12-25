import api from './api';

export const newsService = {
  getNews: async (filters) => {
    return await api.get('/news', { params: filters });
  },

  getNewsById: async (id) => {
    return await api.get(`/news/${id}`);
  },

  createNews: async (newsData) => {
    return await api.post('/admin/news', newsData);
  },

  updateNews: async (id, newsData) => {
    return await api.put(`/admin/news/${id}`, newsData);
  },

  deleteNews: async (id) => {
    return await api.delete(`/admin/news/${id}`);
  },
};
