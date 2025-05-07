import express from 'express';
import { expireSubscriptions } from '../cron/subscription-cron.js';

const router = express.Router();

/**
 * @route POST /api/admin/expire-subscriptions
 * @desc Manually trigger subscription expiry check
 * @access Private (Admin only)
 */
router.post('/expire-subscriptions', async (req, res) => {
  try {
    console.log('Received request to expire subscriptions');
    console.log('Headers:', req.headers);
    
    // Check for admin secret in headers
    const adminSecret = req.headers['x-admin-secret'];
    if (!adminSecret) {
      console.log('No admin secret provided');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No admin secret provided'
      });
    }

    if (adminSecret !== process.env.ADMIN_SECRET) {
      console.log('Invalid admin secret provided');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid admin secret'
      });
    }

    console.log('Admin secret validated, proceeding with subscription expiry check');
    const result = await expireSubscriptions();
    
    if (result.success) {
      console.log('Subscription expiry check completed successfully');
      res.status(200).json({
        success: true,
        message: result.message,
        expiredCount: result.expiredCount
      });
    } else {
      console.log('Subscription expiry check failed:', result.message);
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in subscription expiry endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router; 