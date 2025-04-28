import express from 'express';
import { checkJwt, getUserFromToken } from '../middleware/auth-middleware.js';
import User from '../models/user-model.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(checkJwt);
router.use(getUserFromToken);

// Get current user profile
router.get('/me', async (req, res, next) => {
  try {
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      // Extract user info from Auth0 token
      const userInfo = req.auth;
      
      // Log the full user info for debugging
      console.log('Auth0 user info received:', JSON.stringify(userInfo, null, 2));
      
      // Try to get email from various possible locations in the token
      const email = userInfo.email || 
                   (userInfo.emails && userInfo.emails[0]) || 
                   userInfo.preferred_username ||
                   `${userInfo.nickname || 'user'}@example.com`;
      
      console.log('Creating new user from Auth0 profile:', { 
        auth0Id: req.user.auth0Id,
        email: email
      });
      
      // Create new user
      user = await User.create({
        auth0Id: req.user.auth0Id,
        email: email,
        name: userInfo.name || userInfo.nickname || 'Anonymous User',
        nickname: userInfo.nickname || userInfo.given_name || '',
        picture: userInfo.picture || ''
      });
      
      console.log(`✅ New user created in database: ${user._id}`);
    } else {
      console.log(`✅ Existing user found: ${user._id}`);
      
      // Update user info if it has changed in Auth0
      const userInfo = req.auth;
      let hasChanges = false;
      
      // Check if any user fields have changed
      if (userInfo.name && user.name !== userInfo.name) {
        user.name = userInfo.name;
        hasChanges = true;
      }
      
      if (userInfo.nickname && user.nickname !== userInfo.nickname) {
        user.nickname = userInfo.nickname;
        hasChanges = true;
      }
      
      if (userInfo.picture && user.picture !== userInfo.picture) {
        user.picture = userInfo.picture;
        hasChanges = true;
      }
      
      if (userInfo.email && user.email !== userInfo.email) {
        user.email = userInfo.email;
        hasChanges = true;
      }
      
      // Only save if there are changes
      if (hasChanges) {
        console.log('Updating user profile with latest Auth0 data');
        await user.save();
      }
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error('Error getting/creating user:', error);
    next(error);
  }
});

// Update user profile
router.put('/me', async (req, res, next) => {
  try {
    const { name, nickname, preferences } = req.body;
    
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (nickname) user.nickname = nickname;
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get user statistics
router.get('/me/stats', async (req, res, next) => {
  try {
    const user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Populate flashcard sets
    await user.populate('flashcardSets');
    
    // Calculate statistics
    const stats = {
      totalSets: user.flashcardSets.length,
      totalCards: user.flashcardSets.reduce((acc, set) => acc + set.cards.length, 0),
      totalStudySessions: user.flashcardSets.reduce((acc, set) => acc + set.studyStats.totalStudySessions, 0),
      totalTimeSpent: user.flashcardSets.reduce((acc, set) => acc + set.studyStats.totalTimeSpent, 0),
      averageMastery: user.flashcardSets.length > 0 
        ? Math.round(user.flashcardSets.reduce((acc, set) => acc + set.studyStats.masteryLevel, 0) / user.flashcardSets.length) 
        : 0,
      lastStudied: user.flashcardSets
        .filter(set => set.studyStats.lastStudied)
        .sort((a, b) => b.studyStats.lastStudied - a.studyStats.lastStudied)[0]?.studyStats.lastStudied || null
    };
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router; 