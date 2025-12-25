import { connectDatabase, disconnectDatabase } from '../config/database.js';
import authService from '../services/authService.js';
import Admin from '../models/Admin.js';
import logger from '../utils/logger.js';

/**
 * Test authentication system
 * This script tests the complete authentication flow
 */
const testAuthentication = async () => {
  try {
    logger.info('🧪 Testing authentication system...');
    
    // Connect to database
    await connectDatabase();
    
    // Test 1: Find existing admin
    const testEmail = 'admin@hueacc.edu.et';
    const testPassword = 'Admin123!@#';
    
    logger.info(`🔍 Looking for admin: ${testEmail}`);
    const admin = await Admin.findActiveByEmail(testEmail);
    
    if (!admin) {
      logger.error('❌ Test admin not found. Run "npm run create:admin" first.');
      return;
    }
    
    logger.info(`✅ Found admin: ${admin.name} (${admin.role})`);
    
    // Test 2: Password comparison
    logger.info('🔐 Testing password comparison...');
    const isPasswordValid = await admin.comparePassword(testPassword);
    
    if (!isPasswordValid) {
      logger.error('❌ Password comparison failed');
      return;
    }
    
    logger.info('✅ Password comparison successful');
    
    // Test 3: Login flow
    logger.info('🚪 Testing login flow...');
    const loginResult = await authService.login(
      testEmail, 
      testPassword, 
      '127.0.0.1', 
      'Test-Agent'
    );
    
    logger.info('✅ Login successful');
    logger.info(`Token: ${loginResult.token.substring(0, 20)}...`);
    logger.info(`Expires in: ${loginResult.expiresIn}`);
    
    // Test 4: Token verification
    logger.info('🔍 Testing token verification...');
    const decoded = authService.verifyToken(loginResult.token);
    
    logger.info('✅ Token verification successful');
    logger.info(`Decoded admin: ${decoded.name} (${decoded.role})`);
    
    // Test 5: Profile retrieval
    logger.info('👤 Testing profile retrieval...');
    const profile = await authService.getProfile(decoded.id);
    
    logger.info('✅ Profile retrieval successful');
    logger.info(`Profile: ${profile.name} - ${profile.email}`);
    
    // Test 6: Invalid token
    logger.info('🚫 Testing invalid token handling...');
    try {
      authService.verifyToken('invalid.token.here');
      logger.error('❌ Invalid token should have failed');
    } catch (error) {
      logger.info('✅ Invalid token properly rejected');
    }
    
    // Test 7: Wrong password
    logger.info('🔐 Testing wrong password handling...');
    try {
      await authService.login(testEmail, 'wrongpassword', '127.0.0.1', 'Test-Agent');
      logger.error('❌ Wrong password should have failed');
    } catch (error) {
      logger.info('✅ Wrong password properly rejected');
    }
    
    logger.info('🎉 All authentication tests passed!');
    
  } catch (error) {
    logger.error('❌ Authentication test failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuthentication();
}

export default testAuthentication;