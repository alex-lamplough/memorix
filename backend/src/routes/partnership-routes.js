import express from 'express';
import logger from './utils/logger';
import PartnershipRequest from '../models/partnership-request-model.js';
import { handleError } from '../utils/error-handlers.js';

const router = express.Router();

/**
 * Submit a new partnership request
 * @route POST /api/partnerships
 * @access Public
 */
router.post('/', async (req, res) => {
  try {
    logger.debug('📝 Received partnership request:', { value: req.body });
    
    // Create a new partnership request
    const partnershipRequest = new PartnershipRequest({
      ...req.body
    });
    
    // Save the partnership request
    await partnershipRequest.save();
    
    logger.debug(`✅ Partnership request saved: ${partnershipRequest._id}`);
    
    // Return success status with the created request ID
    res.status(201).json({
      success: true,
      message: 'Partnership request submitted successfully',
      requestId: partnershipRequest._id
    });
  } catch (error) {
    logger.error('❌ Error saving partnership request:', error);
    handleError(res, error);
  }
});

/**
 * Get all partnership requests (admin only)
 * @route GET /api/partnerships
 * @access Private/Admin (to be implemented with proper auth)
 */
router.get('/', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    
    const partnershipRequests = await PartnershipRequest.find()
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: partnershipRequests.length,
      data: partnershipRequests
    });
  } catch (error) {
    logger.error('❌ Error retrieving partnership requests:', error);
    handleError(res, error);
  }
});

export default router; 