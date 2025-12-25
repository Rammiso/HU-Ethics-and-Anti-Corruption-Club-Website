import { connectDatabase, disconnectDatabase } from '../config/database.js';
import Admin, { ADMIN_ROLES, ADMIN_STATUS } from '../models/Admin.js';
import logger from '../utils/logger.js';

/**
 * Create initial admin user
 * This script creates a default admin user for system setup
 */
const createInitialAdmin = async () => {
  try {
    logger.info('🔧 Creating initial admin user...');
    
    // Connect to database
    await connectDatabase();
    
    // Check if any admin already exists
    const existingAdminCount = await Admin.countDocuments();
    
    if (existingAdminCount > 0) {
      logger.info('ℹ️ Admin users already exist. Skipping creation.');
      return;
    }
    
    // Create super admin
    const superAdminData = {
      email: 'admin@hueacc.edu.et',
      password: 'Admin123!@#', // This will be hashed automatically
      name: 'System Administrator',
      role: ADMIN_ROLES.SUPER_ADMIN,
      status: ADMIN_STATUS.ACTIVE
    };
    
    const superAdmin = await Admin.createAdmin(superAdminData);
    logger.info(`✅ Super Admin created: ${superAdmin.email}`);
    
    // Create regular admin
    const adminData = {
      email: 'manager@hueacc.edu.et',
      password: 'Manager123!@#', // This will be hashed automatically
      name: 'Case Manager',
      role: ADMIN_ROLES.ADMIN,
      status: ADMIN_STATUS.ACTIVE
    };
    
    const admin = await Admin.createAdmin(adminData);
    logger.info(`✅ Admin created: ${admin.email}`);
    
    logger.info('🎉 Initial admin users created successfully!');
    logger.info('');
    logger.info('📋 Login Credentials:');
    logger.info('Super Admin:');
    logger.info(`  Email: ${superAdminData.email}`);
    logger.info(`  Password: ${superAdminData.password}`);
    logger.info('');
    logger.info('Regular Admin:');
    logger.info(`  Email: ${adminData.email}`);
    logger.info(`  Password: ${adminData.password}`);
    logger.info('');
    logger.info('⚠️ IMPORTANT: Change these passwords immediately after first login!');
    
  } catch (error) {
    logger.error('❌ Failed to create initial admin users:', error);
    
    if (error.code === 11000) {
      logger.error('Admin with this email already exists');
    }
    
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Create custom admin (for manual admin creation)
const createCustomAdmin = async (email, password, name, role = ADMIN_ROLES.ADMIN) => {
  try {
    logger.info(`🔧 Creating custom admin: ${email}...`);
    
    await connectDatabase();
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (existingAdmin) {
      logger.error(`❌ Admin with email ${email} already exists`);
      return;
    }
    
    const adminData = {
      email,
      password,
      name,
      role,
      status: ADMIN_STATUS.ACTIVE
    };
    
    const admin = await Admin.createAdmin(adminData);
    logger.info(`✅ Admin created successfully: ${admin.email} (${admin.role})`);
    
  } catch (error) {
    logger.error('❌ Failed to create custom admin:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Command line interface
const args = process.argv.slice(2);

if (args.length === 0) {
  // Create initial admin users
  createInitialAdmin();
} else if (args.length >= 3) {
  // Create custom admin: node createAdmin.js email password name [role]
  const [email, password, name, role] = args;
  createCustomAdmin(email, password, name, role);
} else {
  logger.error('❌ Invalid arguments');
  logger.info('Usage:');
  logger.info('  Create initial admins: node createAdmin.js');
  logger.info('  Create custom admin: node createAdmin.js email password name [role]');
  logger.info('');
  logger.info('Example:');
  logger.info('  node createAdmin.js john@hueacc.edu.et SecurePass123! "John Doe" ADMIN');
  process.exit(1);
}

export { createInitialAdmin, createCustomAdmin };