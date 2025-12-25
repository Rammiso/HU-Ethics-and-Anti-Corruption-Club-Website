import pg from 'pg';
import dbConfig from '../config/database.js';
import logger from '../utils/logger.js';

const { Pool } = pg;

let pool;

export const connectDatabase = async () => {
  try {
    pool = new Pool(dbConfig);
    
    // Test connection
    const client = await pool.connect();
    logger.info('Database connected successfully');
    client.release();
    
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase first.');
  }
  return pool;
};

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error:', { text, error: error.message });
    throw error;
  }
};

export const getClient = async () => {
  return await pool.connect();
};
