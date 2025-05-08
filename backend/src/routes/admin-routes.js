import express from 'express';
import logger from './utils/logger';
import { expireSubscriptions } from '../cron/subscription-cron.js';

const router = express.Router();

/**
 * @route POST /api/admin/expire-subscriptions
 * @desc Manually trigger subscription expiry check
 * @access Private (Admin only)
 */
router.post('/expire-subscriptions', async (req, res) => {
  try {
    logger.debug('Received request to expire subscriptions');
    logger.debug('Headers:', { value: req.headers });
    
    // Check for admin secret in headers
    const adminSecret = req.headers['x-admin-secret'];
    if (!adminSecret) {
      logger.debug('No admin secret provided');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No admin secret provided'
      });
    }

    if (adminSecret !== process.env.ADMIN_SECRET) {
      logger.debug('Invalid admin secret provided');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid admin secret'
      });
    }

    logger.debug('Admin secret validated, proceeding with subscription expiry check');
    const result = await expireSubscriptions();
    
    if (result.success) {
      logger.debug('Subscription expiry check completed successfully');
      res.status(200).json({
        success: true,
        message: result.message,
        expiredCount: result.expiredCount
      });
    } else {
      logger.debug('Subscription expiry check failed:', { value: result.message });
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    logger.error('Error in subscription expiry endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router; 