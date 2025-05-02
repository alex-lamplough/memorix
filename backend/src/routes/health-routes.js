import express from 'express';
import mongoose from 'mongoose';
import os from 'os';

const router = express.Router();

/**
 * Simple health check endpoint
 * Used by Railway for deployment health checks
 */
router.get('/', (req, res) => {
  // Return 200 status immediately for basic health check
  res.status(200).json({
    status: 'ok',
    service: 'memorix-api',
    timestamp: new Date().toISOString()
  });
});

/**
 * Detailed health check with system information
 * Used for monitoring and diagnostics
 */
router.get('/details', (req, res) => {
  // Get MongoDB connection status
  const mongoStatus = {
    connected: mongoose.connection.readyState === 1,
    state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    database: mongoose.connection.name || 'none'
  };

  // System information
  const systemInfo = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpus: os.cpus().length,
    arch: process.arch,
    platform: process.platform,
    nodeVersion: process.version,
    hostname: os.hostname()
  };

  res.status(mongoStatus.connected ? 200 : 503).json({
    status: mongoStatus.connected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: mongoStatus,
    system: systemInfo
  });
});

/**
 * Deep health check that tests MongoDB connectivity
 */
router.get('/deep', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: 'MongoDB not connected',
        details: {
          state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
        }
      });
    }

    // Try a simple ping to MongoDB
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        name: mongoose.connection.name
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Database health check failed',
      error: error.message
    });
  }
});

export default router; 