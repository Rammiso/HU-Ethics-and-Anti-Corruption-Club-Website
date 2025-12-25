import { connectDatabase, disconnectDatabase } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Test MongoDB connection
 * This script can be run independently to verify database connectivity
 */
const testConnection = async () => {
  try {
    logger.info('🧪 Testing MongoDB connection...');
    
    // Attempt to connect
    const connection = await connectDatabase();
    
    // Test basic operations
    const collections = await connection.db.listCollections().toArray();
    logger.info(`📊 Found ${collections.length} collections in database`);
    
    // Test write operation (create a test document)
    const testCollection = connection.db.collection('connection_test');
    const testDoc = {
      message: 'Connection test successful',
      timestamp: new Date(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV
    };
    
    const result = await testCollection.insertOne(testDoc);
    logger.info(`✅ Test document inserted with ID: ${result.insertedId}`);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    logger.info('🧹 Test document cleaned up');
    
    logger.info('🎉 MongoDB connection test completed successfully!');
    
  } catch (error) {
    logger.error('❌ MongoDB connection test failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection();
}

export default testConnection;