import Event, { EVENT_STATUS, EVENT_TYPE } from '../models/Event.js';
import auditService from '../services/auditService.js';
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Event Controller
 * Handles event management for admins and public access
 */

/**
 * PUBLIC ENDPOINTS (No authentication required)
 */

/**
 * Get upcoming published events (public)
 */
export const getUpcomingEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'startDate',
      sortOrder = 'asc',
      eventType,
      tags,
      search
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50), // Max 50 items per page
      sortBy,
      sortOrder,
      eventType,
      tags: tags ? tags.split(',') : undefined,
      search
    };
    
    const events = await Event.getUpcomingEvents(options);
    const total = await Event.countDocuments({
      status: EVENT_STATUS.PUBLISHED,
      startDate: { $gte: new Date() },
      ...(options.eventType && { eventType: options.eventType }),
      ...(options.tags && { tags: { $in: options.tags } }),
      ...(options.search && {
        $or: [
          { title: { $regex: options.search, $options: 'i' } },
          { description: { $regex: options.search, $options: 'i' } },
          { location: { $regex: options.search, $options: 'i' } }
        ]
      })
    });
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to get upcoming events:', error);
    throw error;
  }
};

/**
 * Get past published events (public)
 */
export const getPastEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'startDate',
      sortOrder = 'desc',
      eventType,
      tags,
      search
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50), // Max 50 items per page
      sortBy,
      sortOrder,
      eventType,
      tags: tags ? tags.split(',') : undefined,
      search
    };
    
    const events = await Event.getPastEvents(options);
    const total = await Event.countDocuments({
      status: EVENT_STATUS.PUBLISHED,
      endDate: { $lt: new Date() },
      ...(options.eventType && { eventType: options.eventType }),
      ...(options.tags && { tags: { $in: options.tags } }),
      ...(options.search && {
        $or: [
          { title: { $regex: options.search, $options: 'i' } },
          { description: { $regex: options.search, $options: 'i' } },
          { location: { $regex: options.search, $options: 'i' } }
        ]
      })
    });
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to get past events:', error);
    throw error;
  }
};

/**
 * Get event by slug (public)
 */
export const getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const event = await Event.getBySlug(slug);
    
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    
    // Increment view count
    await event.incrementViewCount();
    
    res.json({
      success: true,
      data: event.publicData
    });
    
  } catch (error) {
    logger.error('Failed to get event by slug:', error);
    throw error;
  }
};

/**
 * ADMIN ENDPOINTS (Authentication required)
 */

/**
 * Get all events for admin (with filters and pagination)
 */
export const getEventsForAdmin = async (req, res) => {
  try {
    const {
      status,
      organizer,
      eventType,
      startDate,
      endDate,
      search,
      tags,
      page = 1,
      limit = 20,
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;
    
    const filters = {
      status,
      organizer,
      eventType,
      startDate,
      endDate,
      search,
      tags: tags ? tags.split(',') : undefined
    };
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };
    
    const events = await Event.getEventsForAdmin(filters, options);
    const total = await Event.countDocuments(buildAdminFilterQuery(filters));
    
    // Log admin access
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.VIEW_EVENT,
      resourceType: RESOURCE_TYPES.EVENT,
      details: { filters, pagination: { page, limit } },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to get events for admin:', error);
    throw error;
  }
};

/**
 * Get event by ID (admin)
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id)
      .populate('organizer', 'name email')
      .populate('lastUpdatedBy', 'name email');
    
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    
    // Log admin access
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.VIEW_EVENT,
      resourceType: RESOURCE_TYPES.EVENT,
      resourceId: id,
      details: { title: event.title, status: event.status },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: event
    });
    
  } catch (error) {
    logger.error('Failed to get event by ID:', error);
    throw error;
  }
};

/**
 * Create new event
 */
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      capacity,
      status,
      eventType,
      tags,
      registrationRequired,
      registrationDeadline,
      registrationLink,
      contactEmail,
      contactPhone,
      requirements,
      agenda,
      priority,
      featuredImage
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !location || !startDate || !endDate) {
      throw new AppError('Title, description, location, start date, and end date are required', 400, 'MISSING_REQUIRED_FIELDS');
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      throw new AppError('End date must be after start date', 400, 'INVALID_DATE_RANGE');
    }
    
    // Create event
    const event = new Event({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      startDate: start,
      endDate: end,
      capacity,
      status: status || EVENT_STATUS.DRAFT,
      eventType: eventType || EVENT_TYPE.OTHER,
      organizer: req.admin._id,
      tags: tags || [],
      registrationRequired: registrationRequired || false,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      registrationLink,
      contactEmail,
      contactPhone,
      requirements,
      agenda: agenda || [],
      priority: priority || 0,
      featuredImage,
      lastUpdatedBy: req.admin._id
    });
    
    await event.save();
    
    // Populate organizer info
    await event.populate('organizer', 'name email');
    
    // Log event creation
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.CREATE_EVENT,
      resourceType: RESOURCE_TYPES.EVENT,
      resourceId: event._id,
      details: {
        title: event.title,
        status: event.status,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Event created', {
      eventId: event._id,
      title: event.title,
      status: event.status,
      createdBy: req.admin._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
    
  } catch (error) {
    logger.error('Failed to create event:', error);
    throw error;
  }
};

/**
 * Update event
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      capacity,
      status,
      eventType,
      tags,
      registrationRequired,
      registrationDeadline,
      registrationLink,
      contactEmail,
      contactPhone,
      requirements,
      agenda,
      priority,
      featuredImage
    } = req.body;
    
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    
    // Store old values for audit
    const oldValues = {
      title: event.title,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate
    };
    
    // Update fields
    if (title !== undefined) event.title = title.trim();
    if (description !== undefined) event.description = description.trim();
    if (location !== undefined) event.location = location.trim();
    if (startDate !== undefined) event.startDate = new Date(startDate);
    if (endDate !== undefined) event.endDate = new Date(endDate);
    if (capacity !== undefined) event.capacity = capacity;
    if (status !== undefined) event.status = status;
    if (eventType !== undefined) event.eventType = eventType;
    if (tags !== undefined) event.tags = tags;
    if (registrationRequired !== undefined) event.registrationRequired = registrationRequired;
    if (registrationDeadline !== undefined) event.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
    if (registrationLink !== undefined) event.registrationLink = registrationLink;
    if (contactEmail !== undefined) event.contactEmail = contactEmail;
    if (contactPhone !== undefined) event.contactPhone = contactPhone;
    if (requirements !== undefined) event.requirements = requirements;
    if (agenda !== undefined) event.agenda = agenda;
    if (priority !== undefined) event.priority = priority;
    if (featuredImage !== undefined) event.featuredImage = featuredImage;
    
    // Validate dates if updated
    if (event.startDate >= event.endDate) {
      throw new AppError('End date must be after start date', 400, 'INVALID_DATE_RANGE');
    }
    
    event.lastUpdatedBy = req.admin._id;
    
    await event.save();
    
    // Populate updated info
    await event.populate(['organizer', 'lastUpdatedBy'], 'name email');
    
    // Log event update
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.UPDATE_EVENT,
      resourceType: RESOURCE_TYPES.EVENT,
      resourceId: event._id,
      details: {
        title: event.title,
        oldValues,
        newValues: {
          title: event.title,
          status: event.status,
          startDate: event.startDate,
          endDate: event.endDate
        }
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Event updated', {
      eventId: event._id,
      title: event.title,
      updatedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
    
  } catch (error) {
    logger.error('Failed to update event:', error);
    throw error;
  }
};

/**
 * Delete event
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    
    // Store event info for audit
    const eventInfo = {
      title: event.title,
      status: event.status,
      organizer: event.organizer,
      startDate: event.startDate,
      endDate: event.endDate,
      viewCount: event.viewCount
    };
    
    await Event.findByIdAndDelete(id);
    
    // Log event deletion
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.DELETE_EVENT,
      resourceType: RESOURCE_TYPES.EVENT,
      resourceId: id,
      details: eventInfo,
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Event deleted', {
      eventId: id,
      title: eventInfo.title,
      deletedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
    
  } catch (error) {
    logger.error('Failed to delete event:', error);
    throw error;
  }
};

/**
 * Publish event
 */
export const publishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    
    if (event.status === EVENT_STATUS.PUBLISHED) {
      throw new AppError('Event is already published', 400, 'ALREADY_PUBLISHED');
    }
    
    // Publish the event
    event.publish(req.admin._id);
    await event.save();
    
    // Log event publication
    await auditService.log({
      adminId: req.admin._id,
      action: 'PUBLISH_EVENT',
      resourceType: RESOURCE_TYPES.EVENT,
      resourceId: event._id,
      details: {
        title: event.title,
        startDate: event.startDate
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Event published', {
      eventId: event._id,
      title: event.title,
      publishedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Event published successfully',
      data: event
    });
    
  } catch (error) {
    logger.error('Failed to publish event:', error);
    throw error;
  }
};

/**
 * Unpublish event
 */
export const unpublishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    
    if (event.status === EVENT_STATUS.DRAFT) {
      throw new AppError('Event is already unpublished', 400, 'ALREADY_UNPUBLISHED');
    }
    
    // Unpublish the event
    event.unpublish(req.admin._id);
    await event.save();
    
    // Log event unpublication
    await auditService.log({
      adminId: req.admin._id,
      action: 'UNPUBLISH_EVENT',
      resourceType: RESOURCE_TYPES.EVENT,
      resourceId: event._id,
      details: {
        title: event.title
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Event unpublished', {
      eventId: event._id,
      title: event.title,
      unpublishedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Event unpublished successfully',
      data: event
    });
    
  } catch (error) {
    logger.error('Failed to unpublish event:', error);
    throw error;
  }
};

/**
 * Get event statistics
 */
export const getEventStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const now = new Date();
    
    const [
      totalEvents,
      publishedEvents,
      draftEvents,
      upcomingEvents,
      ongoingEvents,
      pastEvents,
      statusStats,
      typeStats,
      organizerStats,
      viewStats
    ] = await Promise.all([
      Event.countDocuments(dateFilter),
      Event.countDocuments({ ...dateFilter, status: EVENT_STATUS.PUBLISHED }),
      Event.countDocuments({ ...dateFilter, status: EVENT_STATUS.DRAFT }),
      Event.countDocuments({ ...dateFilter, status: EVENT_STATUS.PUBLISHED, startDate: { $gt: now } }),
      Event.countDocuments({ ...dateFilter, status: EVENT_STATUS.PUBLISHED, startDate: { $lte: now }, endDate: { $gte: now } }),
      Event.countDocuments({ ...dateFilter, status: EVENT_STATUS.PUBLISHED, endDate: { $lt: now } }),
      Event.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Event.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$eventType', count: { $sum: 1 } } }
      ]),
      Event.aggregate([
        { $match: dateFilter },
        { $lookup: { from: 'admins', localField: 'organizer', foreignField: '_id', as: 'organizerInfo' } },
        { $group: { _id: '$organizer', name: { $first: '$organizerInfo.name' }, count: { $sum: 1 } } }
      ]),
      Event.aggregate([
        { $match: { ...dateFilter, status: EVENT_STATUS.PUBLISHED } },
        { $group: { _id: null, totalViews: { $sum: '$viewCount' }, avgViews: { $avg: '$viewCount' } } }
      ])
    ]);
    
    const statistics = {
      totalEvents,
      publishedEvents,
      draftEvents,
      upcomingEvents,
      ongoingEvents,
      pastEvents,
      statusStats,
      typeStats,
      organizerStats,
      viewStats: viewStats[0] || { totalViews: 0, avgViews: 0 }
    };
    
    // Log statistics access
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_EVENT_STATISTICS',
      resourceType: RESOURCE_TYPES.EVENT,
      details: { dateFilter },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    logger.error('Failed to get event statistics:', error);
    throw error;
  }
};

/**
 * Helper function to build admin filter query
 */
function buildAdminFilterQuery(filters) {
  const {
    status,
    organizer,
    eventType,
    startDate,
    endDate,
    search,
    tags
  } = filters;
  
  let query = {};
  
  if (status) query.status = status;
  if (organizer) query.organizer = organizer;
  if (eventType) query.eventType = eventType;
  if (tags && tags.length > 0) query.tags = { $in: tags };
  
  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }
  
  return query;
}