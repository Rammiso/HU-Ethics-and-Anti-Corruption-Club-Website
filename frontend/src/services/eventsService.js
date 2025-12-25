import api from './api';

export const eventsService = {
  // Get all events with filters
  getEvents: async (filters = {}) => {
    return await api.get('/admin/events', { params: filters });
  },

  // Get published events for public
  getPublishedEvents: async (filters = {}) => {
    return await api.get('/public/events/published', { params: filters });
  },

  // Get upcoming events
  getUpcomingEvents: async (limit = 10) => {
    return await api.get('/public/events/upcoming', { params: { limit } });
  },

  // Get single event
  getEventById: async (id) => {
    return await api.get(`/admin/events/${id}`);
  },

  // Get event by slug (public)
  getEventBySlug: async (slug) => {
    return await api.get(`/public/events/${slug}`);
  },

  // Create event
  createEvent: async (eventData) => {
    return await api.post('/admin/events', eventData);
  },

  // Update event
  updateEvent: async (id, eventData) => {
    return await api.put(`/admin/events/${id}`, eventData);
  },

  // Delete event
  deleteEvent: async (id) => {
    return await api.delete(`/admin/events/${id}`);
  },

  // Publish/unpublish event
  togglePublishStatus: async (id) => {
    return await api.patch(`/admin/events/${id}/toggle-publish`);
  },

  // Mark event as completed
  markAsCompleted: async (id) => {
    return await api.patch(`/admin/events/${id}/complete`);
  },

  // Cancel event
  cancelEvent: async (id, reason) => {
    return await api.patch(`/admin/events/${id}/cancel`, { reason });
  },

  // Bulk operations
  bulkDelete: async (ids) => {
    return await api.post('/admin/events/bulk-delete', { ids });
  },

  bulkUpdateStatus: async (ids, status) => {
    return await api.post('/admin/events/bulk-status', { ids, status });
  },

  // Check slug availability
  checkSlugAvailability: async (slug, excludeId = null) => {
    return await api.get('/admin/events/check-slug', { 
      params: { slug, excludeId } 
    });
  },

  // Get event statistics
  getEventStats: async () => {
    return await api.get('/admin/events/stats');
  },

  // Event registration (if enabled)
  registerForEvent: async (eventId, registrationData) => {
    return await api.post(`/public/events/${eventId}/register`, registrationData);
  },

  // Get event registrations (admin)
  getEventRegistrations: async (eventId) => {
    return await api.get(`/admin/events/${eventId}/registrations`);
  }
};
