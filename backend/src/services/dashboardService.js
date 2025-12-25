import Report, { REPORT_STATUS } from '../models/Report.js';
import News, { NEWS_STATUS } from '../models/News.js';
import Event, { EVENT_STATUS } from '../models/Event.js';
import ContactMessage, { MESSAGE_STATUS } from '../models/ContactMessage.js';
import Admin from '../models/Admin.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

/**
 * Dashboard Service
 * Provides aggregated data and metrics for admin dashboard
 */
class DashboardService {
  
  /**
   * Get dashboard summary metrics
   */
  async getDashboardSummary() {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Run all queries in parallel for better performance
      const [
        // Report metrics
        totalReports,
        pendingReports,
        reportsThisMonth,
        reportsThisWeek,
        
        // News metrics
        totalNews,
        publishedNews,
        draftNews,
        newsThisMonth,
        
        // Event metrics
        totalEvents,
        upcomingEvents,
        publishedEvents,
        eventsThisMonth,
        
        // Contact message metrics
        totalContactMessages,
        unreadContactMessages,
        newContactMessages,
        contactMessagesThisWeek,
        
        // Admin metrics
        totalAdmins,
        activeAdmins,
        
        // Recent activity
        recentAuditLogs
      ] = await Promise.all([
        // Report queries
        Report.countDocuments(),
        Report.countDocuments({ 
          status: { $in: [REPORT_STATUS.SUBMITTED, REPORT_STATUS.UNDER_REVIEW] }
        }),
        Report.countDocuments({ 
          createdAt: { $gte: thirtyDaysAgo }
        }),
        Report.countDocuments({ 
          createdAt: { $gte: sevenDaysAgo }
        }),
        
        // News queries
        News.countDocuments(),
        News.countDocuments({ status: NEWS_STATUS.PUBLISHED }),
        News.countDocuments({ status: NEWS_STATUS.DRAFT }),
        News.countDocuments({ 
          createdAt: { $gte: thirtyDaysAgo }
        }),
        
        // Event queries
        Event.countDocuments(),
        Event.countDocuments({ 
          status: EVENT_STATUS.PUBLISHED,
          startDate: { $gte: now }
        }),
        Event.countDocuments({ status: EVENT_STATUS.PUBLISHED }),
        Event.countDocuments({ 
          createdAt: { $gte: thirtyDaysAgo }
        }),
        
        // Contact message queries
        ContactMessage.countDocuments({ isSpam: { $ne: true } }),
        ContactMessage.countDocuments({ 
          status: MESSAGE_STATUS.NEW,
          isSpam: { $ne: true }
        }),
        ContactMessage.countDocuments({ 
          status: MESSAGE_STATUS.NEW,
          isSpam: { $ne: true }
        }),
        ContactMessage.countDocuments({ 
          createdAt: { $gte: sevenDaysAgo },
          isSpam: { $ne: true }
        }),
        
        // Admin queries
        Admin.countDocuments(),
        Admin.countDocuments({ status: 'ACTIVE' }),
        
        // Recent activity
        AuditLog.find()
          .populate('adminId', 'name email')
          .sort({ createdAt: -1 })
          .limit(10)
          .select('action resourceType createdAt adminId success')
      ]);
      
      // Calculate growth percentages (simplified)
      const reportGrowth = await this.calculateGrowthPercentage(
        Report, 
        sevenDaysAgo, 
        new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000)
      );
      
      const contactGrowth = await this.calculateGrowthPercentage(
        ContactMessage, 
        sevenDaysAgo, 
        new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
        { isSpam: { $ne: true } }
      );
      
      return {
        reports: {
          total: totalReports,
          pending: pendingReports,
          thisMonth: reportsThisMonth,
          thisWeek: reportsThisWeek,
          growthPercentage: reportGrowth
        },
        news: {
          total: totalNews,
          published: publishedNews,
          draft: draftNews,
          thisMonth: newsThisMonth
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
          published: publishedEvents,
          thisMonth: eventsThisMonth
        },
        contactMessages: {
          total: totalContactMessages,
          unread: unreadContactMessages,
          new: newContactMessages,
          thisWeek: contactMessagesThisWeek,
          growthPercentage: contactGrowth
        },
        admins: {
          total: totalAdmins,
          active: activeAdmins
        },
        recentActivity: recentAuditLogs.map(log => ({
          id: log._id,
          action: log.action,
          resourceType: log.resourceType,
          adminName: log.adminId?.name || 'Unknown',
          timestamp: log.createdAt,
          success: log.success
        }))
      };
      
    } catch (error) {
      logger.error('Failed to get dashboard summary:', error);
      throw error;
    }
  }
  
  /**
   * Get detailed report statistics
   */
  async getReportStatistics(timeRange = '30d') {
    try {
      const { startDate } = this.getTimeRangeFilter(timeRange);
      
      const [
        statusDistribution,
        severityDistribution,
        categoryDistribution,
        timeSeriesData
      ] = await Promise.all([
        // Status distribution
        Report.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Severity distribution
        Report.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: '$severity', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Category distribution
        Report.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $lookup: { 
            from: 'reportcategories', 
            localField: 'category', 
            foreignField: '_id', 
            as: 'categoryInfo' 
          }},
          { $group: { 
            _id: '$category', 
            name: { $first: '$categoryInfo.name' },
            count: { $sum: 1 } 
          }},
          { $sort: { count: -1 } }
        ]),
        
        // Time series data (daily counts for the last 30 days)
        Report.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ])
      ]);
      
      return {
        statusDistribution,
        severityDistribution,
        categoryDistribution,
        timeSeriesData
      };
      
    } catch (error) {
      logger.error('Failed to get report statistics:', error);
      throw error;
    }
  }
  
  /**
   * Get system health metrics
   */
  async getSystemHealth() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const [
        recentErrors,
        activeAdmins,
        systemLoad,
        databaseHealth
      ] = await Promise.all([
        // Recent errors from audit logs
        AuditLog.countDocuments({
          success: false,
          createdAt: { $gte: oneHourAgo }
        }),
        
        // Active admins (logged in within last 24 hours)
        AuditLog.distinct('adminId', {
          action: 'LOGIN',
          success: true,
          createdAt: { $gte: oneDayAgo }
        }).then(adminIds => adminIds.length),
        
        // System load indicators
        Promise.resolve({
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version
        }),
        
        // Database health check
        this.checkDatabaseHealth()
      ]);
      
      return {
        status: recentErrors > 10 ? 'warning' : 'healthy',
        recentErrors,
        activeAdmins,
        systemLoad,
        databaseHealth,
        timestamp: now
      };
      
    } catch (error) {
      logger.error('Failed to get system health:', error);
      throw error;
    }
  }
  
  /**
   * Get admin activity summary
   */
  async getAdminActivity(timeRange = '7d') {
    try {
      const { startDate } = this.getTimeRangeFilter(timeRange);
      
      const [
        adminActions,
        topAdmins,
        actionTypes
      ] = await Promise.all([
        // Admin actions count
        AuditLog.countDocuments({
          createdAt: { $gte: startDate }
        }),
        
        // Most active admins
        AuditLog.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: '$adminId', actionCount: { $sum: 1 } } },
          { $lookup: { 
            from: 'admins', 
            localField: '_id', 
            foreignField: '_id', 
            as: 'adminInfo' 
          }},
          { $project: {
            adminName: { $arrayElemAt: ['$adminInfo.name', 0] },
            adminEmail: { $arrayElemAt: ['$adminInfo.email', 0] },
            actionCount: 1
          }},
          { $sort: { actionCount: -1 } },
          { $limit: 10 }
        ]),
        
        // Action type distribution
        AuditLog.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 15 }
        ])
      ]);
      
      return {
        totalActions: adminActions,
        topAdmins,
        actionTypes,
        timeRange
      };
      
    } catch (error) {
      logger.error('Failed to get admin activity:', error);
      throw error;
    }
  }
  
  /**
   * Calculate growth percentage between two time periods
   */
  async calculateGrowthPercentage(Model, currentPeriodStart, previousPeriodStart, additionalFilter = {}) {
    try {
      const [currentCount, previousCount] = await Promise.all([
        Model.countDocuments({
          createdAt: { $gte: currentPeriodStart },
          ...additionalFilter
        }),
        Model.countDocuments({
          createdAt: { 
            $gte: previousPeriodStart,
            $lt: currentPeriodStart
          },
          ...additionalFilter
        })
      ]);
      
      if (previousCount === 0) {
        return currentCount > 0 ? 100 : 0;
      }
      
      return Math.round(((currentCount - previousCount) / previousCount) * 100);
      
    } catch (error) {
      logger.error('Failed to calculate growth percentage:', error);
      return 0;
    }
  }
  
  /**
   * Get time range filter based on string input
   */
  getTimeRangeFilter(timeRange) {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return { startDate, endDate: now };
  }
  
  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();
      
      // Simple database ping
      await Report.findOne().limit(1);
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 1000 ? 'healthy' : 'slow',
        responseTime,
        connected: true
      };
      
    } catch (error) {
      return {
        status: 'error',
        responseTime: null,
        connected: false,
        error: error.message
      };
    }
  }
}

export default new DashboardService();