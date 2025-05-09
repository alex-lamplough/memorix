import express from 'express';
import Activity from '../models/activity-model.js';
import { requireAuth } from '../middleware/auth-middleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/activities
 * @desc    Get user activities with filtering options
 * @access  Private
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { 
      type,      // Filter by item type (flashcard, quiz)
      action,    // Filter by action type (create, study, complete, update)
      startDate, // Start date for filtering
      endDate,   // End date for filtering
      limit = 100, // Maximum number of activities to return 
      sort = 'newest' // Sort order (newest, oldest)
    } = req.query;
    
    // Build query
    const query = { userId: req.user.id };
    
    // Filter by item type
    if (type) {
      query.itemType = type;
    }
    
    // Filter by action type
    if (action) {
      query.actionType = action;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Build sort
    const sortOptions = sort === 'newest' ? { timestamp: -1 } : { timestamp: 1 };
    
    // Execute query with limit
    let limitValue = parseInt(limit);
    if (isNaN(limitValue) || limitValue <= 0) {
      limitValue = 100;
    }
    
    const activities = await Activity.find(query)
      .sort(sortOptions)
      .limit(limitValue);
    
    res.json(activities);
  } catch (err) {
    logger.error('Error fetching activities:', { value: err });
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/activities
 * @desc    Log new activity
 * @access  Private
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, itemType, actionType, itemId, metadata } = req.body;
    
    // Validate required fields
    if (!title || !itemType || !actionType || !itemId) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, itemType, actionType, and itemId are required' 
      });
    }
    
    // Handle duplicate activity by using upsert
    // This prevents multiple identical activities if the client retries the request
    const activity = await Activity.findOneAndUpdate(
      {
        userId: req.user.id,
        itemId,
        actionType,
        // Use a 5-second window to prevent near-simultaneous duplicates
        timestamp: {
          $gte: new Date(Date.now() - 5000),
          $lte: new Date()
        }
      },
      {
        $setOnInsert: {
          userId: req.user.id,
          title,
          itemType,
          actionType,
          itemId,
          metadata: metadata || {},
          timestamp: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );
    
    res.status(201).json(activity);
  } catch (err) {
    logger.error('Error logging activity:', { value: err });
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/activities/:id
 * @desc    Delete an activity
 * @access  Private
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    // Check if activity belongs to user
    if (activity.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await activity.deleteOne();
    
    res.json({ message: 'Activity removed' });
  } catch (err) {
    logger.error('Error deleting activity:', { value: err });
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 