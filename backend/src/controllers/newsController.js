import News, { NEWS_STATUS } from "../models/News.js";
import auditService from "../services/auditService.js";
import { AUDIT_ACTIONS, RESOURCE_TYPES } from "../models/AuditLog.js";
import { AppError } from "../middleware/errorHandler.js";
import logger from "../utils/logger.js";

/**
 * News Controller
 * Handles news management for admins and public access
 */

/**
 * PUBLIC ENDPOINTS (No authentication required)
 */

/**
 * Get published news articles (public)
 */
export const getPublishedNews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "publishDate",
      sortOrder = "desc",
      tags,
      search,
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50), // Max 50 items per page
      sortBy,
      sortOrder,
      tags: tags ? tags.split(",") : undefined,
      search,
    };

    const news = await News.getPublishedNews(options);
    const total = await News.countDocuments({
      status: NEWS_STATUS.PUBLISHED,
      ...(options.tags && { tags: { $in: options.tags } }),
      ...(options.search && {
        $or: [
          { title: { $regex: options.search, $options: "i" } },
          { content: { $regex: options.search, $options: "i" } },
          { excerpt: { $regex: options.search, $options: "i" } },
        ],
      }),
    });

    res.json({
      success: true,
      data: {
        news,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      },
    });
  } catch (error) {
    logger.error("Failed to get published news:", error);
    throw error;
  }
};

/**
 * Get news article by slug (public)
 */
export const getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const news = await News.getBySlug(slug);

    if (!news) {
      throw new AppError("News article not found", 404, "NEWS_NOT_FOUND");
    }

    // Increment view count
    await news.incrementViewCount();

    res.json({
      success: true,
      data: news.publicData,
    });
  } catch (error) {
    logger.error("Failed to get news by slug:", error);
    throw error;
  }
};

/**
 * ADMIN ENDPOINTS (Authentication required)
 */

/**
 * Get all news for admin (with filters and pagination)
 */
export const getNewsForAdmin = async (req, res) => {
  try {
    const {
      status,
      author,
      startDate,
      endDate,
      search,
      tags,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filters = {
      status,
      author,
      startDate,
      endDate,
      search,
      tags: tags ? tags.split(",") : undefined,
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
    };

    const news = await News.getNewsForAdmin(filters, options);
    const total = await News.countDocuments(buildAdminFilterQuery(filters));

    // Log admin access
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.VIEW_NEWS,
      resourceType: RESOURCE_TYPES.NEWS,
      details: { filters, pagination: { page, limit } },
      metadata: req.auditMetadata,
      success: true,
    });

    res.json({
      success: true,
      data: {
        news,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      },
    });
  } catch (error) {
    logger.error("Failed to get news for admin:", error);
    throw error;
  }
};

/**
 * Get news article by ID (admin)
 */
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id)
      .populate("author", "name email")
      .populate("lastUpdatedBy", "name email");

    if (!news) {
      throw new AppError("News article not found", 404, "NEWS_NOT_FOUND");
    }

    // Log admin access
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.VIEW_NEWS,
      resourceType: RESOURCE_TYPES.NEWS,
      resourceId: id,
      details: { title: news.title, status: news.status },
      metadata: req.auditMetadata,
      success: true,
    });

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    logger.error("Failed to get news by ID:", error);
    throw error;
  }
};

/**
 * Create new news article
 */
export const createNews = async (req, res) => {
  try {
    const { title, content, status, excerpt, tags, priority, featuredImage } =
      req.body;

    // Debug logging
    logger.info("Creating news article", {
      hasAdmin: !!req.admin,
      adminId: req.admin?._id,
      status,
      bodyKeys: Object.keys(req.body),
    });

    // Validate authentication
    if (!req.admin || !req.admin._id) {
      throw new AppError(
        "Authentication required. Admin not found in request.",
        401,
        "UNAUTHORIZED"
      );
    }

    // Validate required fields
    if (!title || !content) {
      throw new AppError(
        "Title and content are required",
        400,
        "MISSING_REQUIRED_FIELDS"
      );
    }

    // Prepare news data
    const newsData = {
      title: title.trim(),
      content: content.trim(),
      author: req.admin._id,
      status: status || NEWS_STATUS.DRAFT,
      excerpt: excerpt?.trim(),
      tags: tags || [],
      priority: priority || 0,
      featuredImage,
      lastUpdatedBy: req.admin._id,
    };

    // Set publishDate if status is PUBLISHED
    if (newsData.status === NEWS_STATUS.PUBLISHED) {
      newsData.publishDate = new Date();
    }

    // Create news article
    const news = new News(newsData);

    await news.save();

    // Populate author info
    await news.populate("author", "name email");

    // Log news creation
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.CREATE_NEWS,
      resourceType: RESOURCE_TYPES.NEWS,
      resourceId: news._id,
      details: {
        title: news.title,
        status: news.status,
        wordCount: news.content.length,
      },
      metadata: req.auditMetadata,
      success: true,
    });

    logger.info("News article created", {
      newsId: news._id,
      title: news.title,
      status: news.status,
      createdBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: "News article created successfully",
      data: news,
    });
  } catch (error) {
    logger.error("Failed to create news article:", error);
    throw error;
  }
};

/**
 * Update news article
 */
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status, excerpt, tags, priority, featuredImage } =
      req.body;

    const news = await News.findById(id);
    if (!news) {
      throw new AppError("News article not found", 404, "NEWS_NOT_FOUND");
    }

    // Store old values for audit
    const oldValues = {
      title: news.title,
      status: news.status,
      priority: news.priority,
    };

    // Update fields
    if (title !== undefined) news.title = title.trim();
    if (content !== undefined) news.content = content.trim();
    if (status !== undefined) news.status = status;
    if (excerpt !== undefined) news.excerpt = excerpt?.trim();
    if (tags !== undefined) news.tags = tags;
    if (priority !== undefined) news.priority = priority;
    if (featuredImage !== undefined) news.featuredImage = featuredImage;

    news.lastUpdatedBy = req.admin._id;

    await news.save();

    // Populate updated info
    await news.populate(["author", "lastUpdatedBy"], "name email");

    // Log news update
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.UPDATE_NEWS,
      resourceType: RESOURCE_TYPES.NEWS,
      resourceId: news._id,
      details: {
        title: news.title,
        oldValues,
        newValues: {
          title: news.title,
          status: news.status,
          priority: news.priority,
        },
      },
      metadata: req.auditMetadata,
      success: true,
    });

    logger.info("News article updated", {
      newsId: news._id,
      title: news.title,
      updatedBy: req.admin._id,
    });

    res.json({
      success: true,
      message: "News article updated successfully",
      data: news,
    });
  } catch (error) {
    logger.error("Failed to update news article:", error);
    throw error;
  }
};

/**
 * Delete news article
 */
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);
    if (!news) {
      throw new AppError("News article not found", 404, "NEWS_NOT_FOUND");
    }

    // Store news info for audit
    const newsInfo = {
      title: news.title,
      status: news.status,
      author: news.author,
      viewCount: news.viewCount,
    };

    await News.findByIdAndDelete(id);

    // Log news deletion
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.DELETE_NEWS,
      resourceType: RESOURCE_TYPES.NEWS,
      resourceId: id,
      details: newsInfo,
      metadata: req.auditMetadata,
      success: true,
    });

    logger.info("News article deleted", {
      newsId: id,
      title: newsInfo.title,
      deletedBy: req.admin._id,
    });

    res.json({
      success: true,
      message: "News article deleted successfully",
    });
  } catch (error) {
    logger.error("Failed to delete news article:", error);
    throw error;
  }
};

/**
 * Publish news article
 */
export const publishNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);
    if (!news) {
      throw new AppError("News article not found", 404, "NEWS_NOT_FOUND");
    }

    if (news.status === NEWS_STATUS.PUBLISHED) {
      throw new AppError(
        "News article is already published",
        400,
        "ALREADY_PUBLISHED"
      );
    }

    // Publish the news
    news.publish(req.admin._id);
    await news.save();

    // Log news publication
    await auditService.log({
      adminId: req.admin._id,
      action: "PUBLISH_NEWS",
      resourceType: RESOURCE_TYPES.NEWS,
      resourceId: news._id,
      details: {
        title: news.title,
        publishDate: news.publishDate,
      },
      metadata: req.auditMetadata,
      success: true,
    });

    logger.info("News article published", {
      newsId: news._id,
      title: news.title,
      publishedBy: req.admin._id,
    });

    res.json({
      success: true,
      message: "News article published successfully",
      data: news,
    });
  } catch (error) {
    logger.error("Failed to publish news article:", error);
    throw error;
  }
};

/**
 * Unpublish news article
 */
export const unpublishNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);
    if (!news) {
      throw new AppError("News article not found", 404, "NEWS_NOT_FOUND");
    }

    if (news.status === NEWS_STATUS.DRAFT) {
      throw new AppError(
        "News article is already unpublished",
        400,
        "ALREADY_UNPUBLISHED"
      );
    }

    // Unpublish the news
    news.unpublish(req.admin._id);
    await news.save();

    // Log news unpublication
    await auditService.log({
      adminId: req.admin._id,
      action: "UNPUBLISH_NEWS",
      resourceType: RESOURCE_TYPES.NEWS,
      resourceId: news._id,
      details: {
        title: news.title,
      },
      metadata: req.auditMetadata,
      success: true,
    });

    logger.info("News article unpublished", {
      newsId: news._id,
      title: news.title,
      unpublishedBy: req.admin._id,
    });

    res.json({
      success: true,
      message: "News article unpublished successfully",
      data: news,
    });
  } catch (error) {
    logger.error("Failed to unpublish news article:", error);
    throw error;
  }
};

/**
 * Get news statistics
 */
export const getNewsStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalNews,
      publishedNews,
      draftNews,
      statusStats,
      authorStats,
      viewStats,
    ] = await Promise.all([
      News.countDocuments(dateFilter),
      News.countDocuments({ ...dateFilter, status: NEWS_STATUS.PUBLISHED }),
      News.countDocuments({ ...dateFilter, status: NEWS_STATUS.DRAFT }),
      News.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      News.aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: "admins",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        {
          $group: {
            _id: "$author",
            name: { $first: "$authorInfo.name" },
            count: { $sum: 1 },
          },
        },
      ]),
      News.aggregate([
        { $match: { ...dateFilter, status: NEWS_STATUS.PUBLISHED } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$viewCount" },
            avgViews: { $avg: "$viewCount" },
          },
        },
      ]),
    ]);

    const statistics = {
      totalNews,
      publishedNews,
      draftNews,
      statusStats,
      authorStats,
      viewStats: viewStats[0] || { totalViews: 0, avgViews: 0 },
    };

    // Log statistics access
    await auditService.log({
      adminId: req.admin._id,
      action: "VIEW_NEWS_STATISTICS",
      resourceType: RESOURCE_TYPES.NEWS,
      details: { dateFilter },
      metadata: req.auditMetadata,
      success: true,
    });

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    logger.error("Failed to get news statistics:", error);
    throw error;
  }
};

/**
 * Helper function to build admin filter query
 */
function buildAdminFilterQuery(filters) {
  const { status, author, startDate, endDate, search, tags } = filters;

  let query = {};

  if (status) query.status = status;
  if (author) query.author = author;
  if (tags && tags.length > 0) query.tags = { $in: tags };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  return query;
}
