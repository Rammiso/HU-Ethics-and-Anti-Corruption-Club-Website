import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Users,
  Edit, 
  Trash2, 
  MoreHorizontal,
  Globe,
  EyeOff,
  Clock
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { PageLoading } from '../../components/common/Loading';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatRelativeTime, truncateText, cn } from '../../utils/helpers';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const { showNotification } = useNotification();

  const itemsPerPage = 10;

  const eventTypes = [
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'SEMINAR', label: 'Seminar' },
    { value: 'CONFERENCE', label: 'Conference' },
    { value: 'MEETING', label: 'Meeting' },
    { value: 'TRAINING', label: 'Training' },
    { value: 'OTHER', label: 'Other' }
  ];

  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: 'startDate',
        sortOrder: 'asc'
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        params.append('eventType', typeFilter);
      }

      const response = await apiClient.get(`/admin/events?${params}`);
      const { events: eventsData, pagination } = response.data;

      setEvents(eventsData || []);
      setTotalPages(pagination?.pages || 1);
      setTotalCount(pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load events'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handleSelectEvent = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map(item => item._id));
    }
  };

  const handlePublishToggle = async (eventId, currentStatus) => {
    try {
      const action = currentStatus === 'PUBLISHED' ? 'unpublish' : 'publish';
      await apiClient.put(`/admin/events/${eventId}/${action}`);
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: `Event ${action}ed successfully`
      });
      
      fetchEvents();
    } catch (error) {
      console.error(`Failed to ${action} event:`, error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to ${action} event`
      });
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/events/${eventId}`);
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Event deleted successfully'
      });
      
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete event'
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Draft' },
      PUBLISHED: { color: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Published' }
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    
    return (
      <span className={cn('px-2 py-1 text-xs rounded-full border', config.color)}>
        {config.label}
      </span>
    );
  };

  const getEventTypeBadge = (type) => {
    const typeConfig = {
      WORKSHOP: { color: 'bg-blue-500/10 text-blue-500', label: 'Workshop' },
      SEMINAR: { color: 'bg-purple-500/10 text-purple-500', label: 'Seminar' },
      CONFERENCE: { color: 'bg-indigo-500/10 text-indigo-500', label: 'Conference' },
      MEETING: { color: 'bg-gray-500/10 text-gray-500', label: 'Meeting' },
      TRAINING: { color: 'bg-orange-500/10 text-orange-500', label: 'Training' },
      OTHER: { color: 'bg-teal-500/10 text-teal-500', label: 'Other' }
    };

    const config = typeConfig[type] || typeConfig.OTHER;
    
    return (
      <span className={cn('px-2 py-1 text-xs rounded-full', config.color)}>
        {config.label}
      </span>
    );
  };

  const isEventUpcoming = (startDate) => {
    return new Date(startDate) > new Date();
  };

  const isEventOngoing = (startDate, endDate) => {
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  };

  if (loading && currentPage === 1) {
    return <PageLoading text="Loading events..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Events Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage events, workshops, and activities
          </p>
        </div>
        
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Filters and Search */}
      <div className="glass-card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg glass border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg glass border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg glass border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            >
              <option value="all">All Types</option>
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-muted-foreground">
            Showing {events.length} of {totalCount} events
          </p>
          
          {selectedEvents.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedEvents.length} selected
              </span>
              <button className="btn-secondary text-sm">
                Bulk Actions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="glass-card">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first event to get started'
              }
            </p>
            <button className="btn-primary">
              Create Event
            </button>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm font-medium text-muted-foreground">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedEvents.length === events.length && events.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-white/20 bg-transparent focus:ring-neon-green focus:ring-offset-0"
                />
              </div>
              <div className="col-span-3">Event</div>
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Capacity</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/10">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="lg:grid lg:grid-cols-12 gap-4 p-4 hover:bg-accent/50 transition-colors"
                >
                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event._id)}
                          onChange={() => handleSelectEvent(event._id)}
                          className="mt-1 rounded border-white/20 bg-transparent focus:ring-neon-green focus:ring-offset-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {truncateText(event.description || '', 100)}
                          </p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-accent rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.startDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(event.startDate).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {truncateText(event.location, 50)}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getEventTypeBadge(event.eventType)}
                          {getStatusBadge(event.status)}
                        </div>
                        
                        {event.capacity && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-3 h-3" />
                            {event.capacity}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:contents">
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event._id)}
                        onChange={() => handleSelectEvent(event._id)}
                        className="rounded border-white/20 bg-transparent focus:ring-neon-green focus:ring-offset-0"
                      />
                    </div>
                    
                    <div className="col-span-3 flex items-center">
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {truncateText(event.description, 60)}
                          </p>
                        )}
                        {isEventUpcoming(event.startDate) && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-neon-green/10 text-neon-green rounded">
                            Upcoming
                          </span>
                        )}
                        {isEventOngoing(event.startDate, event.endDate) && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-neon-blue/10 text-neon-blue rounded">
                            Ongoing
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center text-sm">
                      <div>
                        <div>{formatDate(event.startDate)}</div>
                        <div className="text-muted-foreground">
                          {new Date(event.startDate).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                      {event.location ? truncateText(event.location, 30) : 'TBD'}
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      {getEventTypeBadge(event.eventType)}
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <div className="col-span-1 flex items-center text-sm text-muted-foreground">
                      {event.capacity || 'Unlimited'}
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePublishToggle(event._id, event.status)}
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title={event.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        >
                          {event.status === 'PUBLISHED' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="p-1 hover:bg-error-500/10 hover:text-error-500 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'w-8 h-8 rounded text-sm transition-colors',
                      currentPage === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;