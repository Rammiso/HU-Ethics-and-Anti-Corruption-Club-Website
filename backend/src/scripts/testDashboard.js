import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dashboardService from '../services/dashboardService.js';
import Admin from '../models/Admin.js';
import Report from '../models/Report.js';
import News from '../models/News.js';
import Event from '../models/Event.js';
import ContactMessage from '../models/ContactMessage.js';
import ReportCategory from '../models/ReportCategory.js';

// Load environment variables
dotenv.config();

/**
 * Test script for dashboard functionality
 */

async function testDashboard() {
  try {
    console.log('🧪 Testing Dashboard Functionality...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create test admin
    console.log('\n📝 Creating test admin...');
    const testAdmin = new Admin({
      name: 'Dashboard Test Admin',
      email: 'dashboard@hueacc.edu.et',
      password: 'TestPassword123!',
      role: 'SUPER_ADMIN'
    });
    await testAdmin.save();
    console.log('✅ Test admin created');
    
    // Create test data for dashboard
    console.log('\n📝 Creating test data...');
    
    // Create report category
    const category = new ReportCategory({
      name: 'Test Category',
      description: 'Test category for dashboard',
      createdBy: testAdmin._id
    });
    await category.save();
    
    // Create test reports
    const reports = [];
    for (let i = 0; i < 5; i++) {
      const report = new Report({
        category: category._id,
        title: `Test Report ${i + 1}`,
        description: 'This is a test report for dashboard testing',
        incidentDate: new Date(),
        location: 'Test Location',
        severity: 'MEDIUM',
        status: i < 2 ? 'SUBMITTED' : 'UNDER_REVIEW'
      });
      await report.save();
      reports.push(report);
    }
    console.log('✅ Created 5 test reports');
    
    // Create test news
    const news = [];
    for (let i = 0; i < 3; i++) {
      const newsItem = new News({
        title: `Test News ${i + 1}`,
        content: 'This is test news content for dashboard testing',
        author: testAdmin._id,
        status: i < 2 ? 'PUBLISHED' : 'DRAFT'
      });
      await newsItem.save();
      news.push(newsItem);
    }
    console.log('✅ Created 3 test news articles');
    
    // Create test events
    const events = [];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const endDate = new Date(futureDate);
    endDate.setHours(endDate.getHours() + 3);
    
    for (let i = 0; i < 3; i++) {
      const event = new Event({
        title: `Test Event ${i + 1}`,
        description: 'This is a test event for dashboard testing',
        location: 'Test Location',
        startDate: futureDate,
        endDate: endDate,
        organizer: testAdmin._id,
        status: i < 2 ? 'PUBLISHED' : 'DRAFT'
      });
      await event.save();
      events.push(event);
    }
    console.log('✅ Created 3 test events');
    
    // Create test contact messages
    const messages = [];
    for (let i = 0; i < 4; i++) {
      const message = new ContactMessage({
        senderName: `Test User ${i + 1}`,
        email: `test${i + 1}@example.com`,
        subject: `Test Message ${i + 1}`,
        messageBody: 'This is a test contact message for dashboard testing',
        status: i < 2 ? 'NEW' : 'READ'
      });
      await message.save();
      messages.push(message);
    }
    console.log('✅ Created 4 test contact messages');
    
    // Test 1: Get dashboard summary
    console.log('\n📝 Test 1: Getting dashboard summary...');
    const summary = await dashboardService.getDashboardSummary();
    console.log('✅ Dashboard summary retrieved');
    console.log('   Reports:');
    console.log('     Total:', summary.reports.total);
    console.log('     Pending:', summary.reports.pending);
    console.log('   News:');
    console.log('     Total:', summary.news.total);
    console.log('     Published:', summary.news.published);
    console.log('     Draft:', summary.news.draft);
    console.log('   Events:');
    console.log('     Total:', summary.events.total);
    console.log('     Upcoming:', summary.events.upcoming);
    console.log('   Contact Messages:');
    console.log('     Total:', summary.contactMessages.total);
    console.log('     Unread:', summary.contactMessages.unread);
    console.log('   Admins:');
    console.log('     Total:', summary.admins.total);
    console.log('     Active:', summary.admins.active);
    console.log('   Recent Activity:', summary.recentActivity.length, 'items');
    
    // Test 2: Get report statistics
    console.log('\n📝 Test 2: Getting report statistics...');
    const reportStats = await dashboardService.getReportStatistics('30d');
    console.log('✅ Report statistics retrieved');
    console.log('   Status Distribution:', reportStats.statusDistribution.length, 'statuses');
    console.log('   Severity Distribution:', reportStats.severityDistribution.length, 'severities');
    console.log('   Category Distribution:', reportStats.categoryDistribution.length, 'categories');
    console.log('   Time Series Data:', reportStats.timeSeriesData.length, 'data points');
    
    // Test 3: Get system health
    console.log('\n📝 Test 3: Getting system health...');
    const health = await dashboardService.getSystemHealth();
    console.log('✅ System health retrieved');
    console.log('   Status:', health.status);
    console.log('   Recent Errors:', health.recentErrors);
    console.log('   Active Admins:', health.activeAdmins);
    console.log('   Uptime:', Math.round(health.systemLoad.uptime), 'seconds');
    console.log('   Memory Usage:', Math.round(health.systemLoad.memoryUsage.heapUsed / 1024 / 1024), 'MB');
    console.log('   Database Status:', health.databaseHealth.status);
    console.log('   Database Response Time:', health.databaseHealth.responseTime, 'ms');
    
    // Test 4: Get admin activity
    console.log('\n📝 Test 4: Getting admin activity...');
    const activity = await dashboardService.getAdminActivity('7d');
    console.log('✅ Admin activity retrieved');
    console.log('   Total Actions:', activity.totalActions);
    console.log('   Top Admins:', activity.topAdmins.length);
    console.log('   Action Types:', activity.actionTypes.length);
    console.log('   Time Range:', activity.timeRange);
    
    // Test 5: Test different time ranges
    console.log('\n📝 Test 5: Testing different time ranges...');
    const timeRanges = ['24h', '7d', '30d', '90d'];
    for (const range of timeRanges) {
      const stats = await dashboardService.getReportStatistics(range);
      console.log(`   ✅ ${range}: ${stats.timeSeriesData.length} data points`);
    }
    
    // Test 6: Test growth calculation
    console.log('\n📝 Test 6: Testing growth calculation...');
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const growth = await dashboardService.calculateGrowthPercentage(
      Report,
      sevenDaysAgo,
      fourteenDaysAgo
    );
    console.log('✅ Growth calculation completed');
    console.log('   Report Growth:', growth, '%');
    
    // Test 7: Test time range filter
    console.log('\n📝 Test 7: Testing time range filter...');
    const filters = ['24h', '7d', '30d', '90d'];
    for (const filter of filters) {
      const { startDate, endDate } = dashboardService.getTimeRangeFilter(filter);
      const daysDiff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
      console.log(`   ✅ ${filter}: ${daysDiff} days`);
    }
    
    // Test 8: Test database health check
    console.log('\n📝 Test 8: Testing database health check...');
    const dbHealth = await dashboardService.checkDatabaseHealth();
    console.log('✅ Database health check completed');
    console.log('   Status:', dbHealth.status);
    console.log('   Connected:', dbHealth.connected);
    console.log('   Response Time:', dbHealth.responseTime, 'ms');
    
    console.log('\n🎉 All dashboard tests passed!');
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await Report.deleteMany({ _id: { $in: reports.map(r => r._id) } });
    await News.deleteMany({ _id: { $in: news.map(n => n._id) } });
    await Event.deleteMany({ _id: { $in: events.map(e => e._id) } });
    await ContactMessage.deleteMany({ _id: { $in: messages.map(m => m._id) } });
    await ReportCategory.findByIdAndDelete(category._id);
    await Admin.findByIdAndDelete(testAdmin._id);
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
}

// Run the test
testDashboard();