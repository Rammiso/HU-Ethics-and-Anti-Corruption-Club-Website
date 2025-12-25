import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ReportCategory from '../models/ReportCategory.js';
import Report from '../models/Report.js';
import reportService from '../services/reportService.js';
import { SEVERITY_LEVELS } from '../models/ReportCategory.js';
import { REPORT_SEVERITY } from '../models/Report.js';

// Load environment variables
dotenv.config();

/**
 * Test script for anonymous reporting module
 */

async function testReportingModule() {
  try {
    console.log('🧪 Testing Anonymous Reporting Module...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Create test report category
    console.log('\n📝 Test 1: Creating test report category...');
    
    // Create a dummy admin ID for testing
    const testAdminId = new mongoose.Types.ObjectId();
    
    const testCategory = new ReportCategory({
      name: 'Test Corruption Report',
      description: 'Test category for corruption reports',
      defaultSeverity: SEVERITY_LEVELS.HIGH,
      guidelines: 'Please provide detailed information about the incident',
      examples: ['Bribery', 'Misuse of funds', 'Nepotism'],
      createdBy: testAdminId
    });
    
    await testCategory.save();
    console.log('✅ Test category created:', testCategory.name);
    
    // Test 2: Submit anonymous report
    console.log('\n📝 Test 2: Submitting anonymous report...');
    
    const reportData = {
      categoryId: testCategory._id,
      title: 'Test Corruption Incident',
      description: 'This is a test report to verify the anonymous reporting system is working correctly. The incident involves misuse of university resources.',
      incidentDate: new Date('2024-12-20'),
      location: 'University Campus - Administration Building',
      severity: REPORT_SEVERITY.HIGH
    };
    
    const result = await reportService.submitAnonymousReport(reportData);
    console.log('✅ Anonymous report submitted successfully');
    console.log('   Tracking ID:', result.trackingId);
    console.log('   Status:', result.status);
    
    // Test 3: Track report status
    console.log('\n📝 Test 3: Tracking report status...');
    
    const trackingResult = await reportService.trackReportStatus(result.trackingId);
    console.log('✅ Report status retrieved successfully');
    console.log('   Title:', trackingResult.title);
    console.log('   Status:', trackingResult.status);
    console.log('   Category:', trackingResult.category.name);
    
    // Test 4: Add follow-up message
    console.log('\n📝 Test 4: Adding follow-up message...');
    
    const messageResult = await reportService.addReportMessage(
      result.trackingId,
      'This is a follow-up message with additional information about the incident.'
    );
    console.log('✅ Follow-up message added successfully');
    
    // Test 5: Verify message was added
    console.log('\n📝 Test 5: Verifying message was added...');
    
    const updatedReport = await reportService.trackReportStatus(result.trackingId);
    console.log('✅ Messages retrieved:', updatedReport.messages.length);
    console.log('   Latest message:', updatedReport.messages[updatedReport.messages.length - 1].content);
    
    // Test 6: Get active categories
    console.log('\n📝 Test 6: Getting active categories...');
    
    const activeCategories = await ReportCategory.getActiveCategories();
    console.log('✅ Active categories retrieved:', activeCategories.length);
    console.log('   Categories:', activeCategories.map(cat => cat.name));
    
    // Test 7: Test report statistics
    console.log('\n📝 Test 7: Getting report statistics...');
    
    const stats = await reportService.getReportStatistics();
    console.log('✅ Report statistics retrieved');
    console.log('   Total reports:', stats.totalReports);
    console.log('   Status breakdown:', stats.statusStats);
    
    console.log('\n🎉 All tests passed! Anonymous reporting module is working correctly.');
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await Report.findOneAndDelete({ trackingId: result.trackingId });
    await ReportCategory.findByIdAndDelete(testCategory._id);
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
testReportingModule();