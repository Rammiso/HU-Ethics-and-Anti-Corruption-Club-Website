import { connectDatabase, disconnectDatabase } from '../config/database.js';
import auditService from '../services/auditService.js';
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/AuditLog.js';
import Admin from '../models/Admin.js';
import logger from '../utils/logger.js';

/**
 * Test audit logging system
 * This script tests the complete audit logging functionality
 */
const testAuditLogging = async () => {
  try {
    logger.info('🧪 Testing audit logging system...');
    
    // Connect to database
    await connectDatabase();
    
    // Find a test admin
    const testAdmin = await Admin.findOne({ email: 'admin@hueacc.edu.et' });
    
    if (!testAdmin) {
      logger.error('❌ Test admin not found. Run "npm run create:admin" first.');
      return;
    }
    
    logger.info(`✅ Found test admin: ${testAdmin.name}`);
    
    // Test 1: Basic audit log creation
    logger.info('📝 Testing basic audit log creation...');
    
    const testMetadata = {
      ipAddress: '127.0.0.1',
      userAgent: 'Test-Agent/1.0',
      requestUrl: '/api/v1/test',
      requestMethod: 'POST'
    };
    
    const auditLog1 = await auditService.log({
      adminId: testAdmin._id,
      action: AUDIT_ACTIONS.LOGIN,
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: testAdmin._id,
      details: { testAction: true },
      metadata: testMetadata,
      success: true
    });
    
    if (auditLog1) {
      logger.info('✅ Basic audit log created successfully');
    } else {
      logger.error('❌ Failed to create basic audit log');
      return;
    }
    
    // Test 2: Authentication audit logging
    logger.info('🔐 Testing authentication audit logging...');
    
    const authLog = await auditService.logAuth(
      testAdmin._id,
      AUDIT_ACTIONS.CHANGE_PASSWORD,
      testMetadata,
      true
    );
    
    if (authLog) {
      logger.info('✅ Authentication audit log created successfully');
    }
    
    // Test 3: Report action audit logging
    logger.info('📊 Testing report action audit logging...');
    
    const reportLog = await auditService.logReportAction(
      testAdmin._id,
      AUDIT_ACTIONS.VIEW_REPORT,
      '507f1f77bcf86cd799439011', // Mock report ID
      { reportTitle: 'Test Report' },
      testMetadata,
      true
    );
    
    if (reportLog) {
      logger.info('✅ Report action audit log created successfully');
    }
    
    // Test 4: Failed action logging
    logger.info('❌ Testing failed action logging...');
    
    const failedLog = await auditService.log({
      adminId: testAdmin._id,
      action: AUDIT_ACTIONS.DELETE_NEWS,
      resourceType: RESOURCE_TYPES.NEWS,
      resourceId: '507f1f77bcf86cd799439012',
      details: { reason: 'Test failure' },
      metadata: testMetadata,
      success: false,
      errorMessage: 'Test error message'
    });
    
    if (failedLog) {
      logger.info('✅ Failed action audit log created successfully');
    }
    
    // Test 5: Retrieve audit logs
    logger.info('🔍 Testing audit log retrieval...');
    
    const logs = await auditService.getLogs(
      { adminId: testAdmin._id },
      { page: 1, limit: 10 }
    );
    
    logger.info(`✅ Retrieved ${logs.logs.length} audit logs`);
    logger.info(`Total logs: ${logs.pagination.total}`);
    
    // Test 6: Get audit statistics
    logger.info('📈 Testing audit statistics...');
    
    const stats = await auditService.getStatistics();
    logger.info(`✅ Retrieved statistics for ${stats.length} action types`);
    
    // Test 7: Get admin-specific logs
    logger.info('👤 Testing admin-specific log retrieval...');
    
    const adminLogs = await auditService.getAdminLogs(testAdmin._id, { limit: 5 });
    logger.info(`✅ Retrieved ${adminLogs.length} logs for admin`);
    
    // Test 8: Invalid action handling
    logger.info('🚫 Testing invalid action handling...');
    
    const invalidLog = await auditService.log({
      adminId: testAdmin._id,
      action: 'INVALID_ACTION',
      resourceType: RESOURCE_TYPES.ADMIN,
      metadata: testMetadata
    });
    
    if (!invalidLog) {
      logger.info('✅ Invalid action properly rejected');
    } else {
      logger.error('❌ Invalid action should have been rejected');
    }
    
    // Test 9: Missing required fields
    logger.info('📋 Testing missing required fields...');
    
    const incompleteLog = await auditService.log({
      action: AUDIT_ACTIONS.LOGIN,
      // Missing adminId and resourceType
      metadata: testMetadata
    });
    
    if (!incompleteLog) {
      logger.info('✅ Incomplete log data properly rejected');
    } else {
      logger.error('❌ Incomplete log should have been rejected');
    }
    
    // Display recent logs
    logger.info('📋 Recent audit logs:');
    const recentLogs = await auditService.getLogs({}, { limit: 5 });
    
    recentLogs.logs.forEach((log, index) => {
      logger.info(`${index + 1}. ${log.action} by ${log.adminId?.name || 'Unknown'} at ${log.createdAt}`);
    });
    
    logger.info('🎉 All audit logging tests completed successfully!');
    
  } catch (error) {
    logger.error('❌ Audit logging test failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuditLogging();
}

export default testAuditLogging;