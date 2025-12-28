import express from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import authRoutes from "./authRoutes.js";
import userAuthRoutes from "./userAuthRoutes.js";
import adminRoutes from "./adminRoutes.js";
import publicRoutes from "./publicRoutes.js";

const router = express.Router();

// API version and info endpoint
router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "HUEACC API Server",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "/api/health",
        auth: "/api/v1/auth",
        userAuth: "/api/v1/auth/user",
        admin: "/api/v1/admin",
        public: "/api/v1/public",
      },
    });
  })
);

// Health check endpoint with detailed system info
router.get(
  "/health",
  asyncHandler(async (req, res) => {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: "MB",
        },
      },
      database: {
        status: "connected", // TODO: Add actual database health check
      },
      features: {
        authentication: "enabled",
        adminRoutes: "protected",
        publicRoutes: "open",
      },
    };

    res.status(200).json({
      success: true,
      data: healthData,
    });
  })
);

// API v1 routes
// IMPORTANT: More specific routes must be mounted before less specific ones
// Mount /v1/auth/user BEFORE /v1/auth to prevent admin auth middleware from catching user routes
router.use("/v1/auth/user", userAuthRoutes);
router.use("/v1/auth", authRoutes);
router.use("/v1/admin", adminRoutes);
router.use("/v1/public", publicRoutes);

// Legacy route support (redirect to v1)
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/public", publicRoutes);

export default router;
