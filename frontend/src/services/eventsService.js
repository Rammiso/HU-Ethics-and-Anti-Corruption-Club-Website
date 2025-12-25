import api from './api';

export const eventsService = {
  getEvents: async (filters) => {
    return await api.get('/events', { params: filters });
  },

  getEventById: async (id) => {
    return await api.get(`/events/${id}`);
  },

  createEvent: async (eventData) => {
    return await api.post('/admin/events', eventData);
  },

  updateEvent: async (id, eventData) => {
    return await api.put(`/admin/events/${id}`, eventData);
  },

  deleteEvent: async (id) => {
    return await api.delete(`/admin/events/${id}`);
  },
};
