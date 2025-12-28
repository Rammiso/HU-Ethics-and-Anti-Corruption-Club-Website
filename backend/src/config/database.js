import mongoose from "mongoose";
import logger from "../utils/logger.js";

// MongoDB connection configuration
const getConnectionString = () => {
  const {
    DB_HOST = "localhost",
    DB_PORT = "27017",
    DB_NAME = "hueacc_db",
    DB_USER,
    DB_PASSWORD,
    MONGODB_URI,
  } = process.env;

  // Use MONGODB_URI if provided (for cloud deployments)
  if (MONGODB_URI) {
    return MONGODB_URI;
  }

  // Build connection string from individual components
  const auth = DB_USER && DB_PASSWORD ? `${DB_USER}:${DB_PASSWORD}@` : "";
  return `mongodb://${auth}${DB_HOST}:${DB_PORT}/${DB_NAME}`;
};

// Connection options
const connectionOptions = {
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
  serverSelectionTimeoutMS:
    parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
  socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
};

// Connect to MongoDB
export const connectDatabase = async () => {
  try {
    const connectionString = getConnectionString();

    // Log connection attempt (without credentials)
    const safeConnectionString = connectionString.replace(
      /:([^:@]+)@/,
      ":****@"
    );
    logger.info(`Attempting to connect to MongoDB: ${safeConnectionString}`);

    await mongoose.connect(connectionString, connectionOptions);

    logger.info("✅ MongoDB connected successfully");

    // Log database name
    logger.info(
      `📊 Connected to database: ${mongoose.connection.db.databaseName}`
    );

    return mongoose.connection;
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
};

// Connection event handlers
mongoose.connection.on("connected", () => {
  logger.info("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (error) => {
  logger.error("Mongoose connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("Mongoose disconnected from MongoDB");
});

// Graceful shutdown
export const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  } catch (error) {
    logger.error("Error closing MongoDB connection:", error);
  }
};

// Handle application termination
process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default mongoose;
