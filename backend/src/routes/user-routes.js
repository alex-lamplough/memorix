import express from 'express';
import logger from './utils/logger';
import { checkJwt, getUserFromToken } from '../middleware/auth-middleware.js';
import User from '../models/user-model.js';
import { getUserProfile } from '../services/auth0-service.js';
import { emailService } from '../services/email-service.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(checkJwt);
router.use(getUserFromToken);

// Get current user profile
router.get('/me', async (req, res, next) => {
  try {
    logger.debug(`==================== USER LOGIN/CREATION START ====================`);
    logger.debug(`🔍 Looking up user with Auth0 ID: ${req.user.auth0Id}`);
    logger.debug(`🔑 Auth Middleware User Object:`, { value: JSON.stringify(req.user }));
    logger.debug(`🔑 Auth Token Content:`, { value: JSON.stringify(req.auth }));
    
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      logger.debug(`❗ User not found in database, creating new user record`);
      
      // Extract user info from Auth0 token
      const userInfo = req.auth;
      const auth0Id = userInfo.sub;
      
      // Log the token for debugging
      logger.debug('📝 Auth0 token received:', { value: JSON.stringify(userInfo, null, 2 }));
      logger.debug(`💡 NODE_ENV: ${process.env.NODE_ENV}`);
      
      // Try to get full profile from Auth0 Management API
      logger.debug('🔍 Fetching full profile from Auth0 Management API');
      const auth0Profile = await getUserProfile(auth0Id);
      logger.debug('📝 Auth0 Profile API Response:', auth0Profile ? 'Success' : 'Failed');
      if (auth0Profile) {
        logger.debug('📝 Auth0 Profile Data:', { value: JSON.stringify(auth0Profile, null, 2 }));
      }
      
      let email, name, picture;
      
      if (auth0Profile && auth0Profile.email) {
        // Get details from Auth0 Management API
        email = auth0Profile.email;
        name = auth0Profile.name || auth0Profile.nickname || 'Memorix User';
        picture = auth0Profile.picture || '';
        
        logger.debug('✅ Using email from Auth0 Management API:', { value: email });
      } else {
        // Fallback to token data or generate placeholder
        email = userInfo.email || `${auth0Id.replace(/[|]/g, '-')}@memorix-user.com`;
        name = userInfo.name || userInfo.nickname || 'Memorix User';
        picture = userInfo.picture || '';
        
        logger.debug('⚠️ Using fallback email:', { value: email });
        if (auth0Profile === null) {
          logger.debug('❌ Auth0 Management API call failed or returned null');
        }
      }
      
      logger.debug('🔧 Creating new user with:', { value: { 
        auth0Id, 
        email, 
        name 
      } });
      
      try {
        // Create new user
        user = await User.create({
          auth0Id,
          email,
          name,
          picture,
          profile: {
            displayName: name
          }
        });
        
        logger.debug(`✅ New user created in database: ${user._id}`);
        
        // Send welcome email if SENDGRID_API_KEY is configured
        if (process.env.SENDGRID_API_KEY) {
          try {
            logger.debug(`📧 Sending welcome email to new user: ${email}`);
            const emailResult = await emailService.sendWelcomeEmail(
              email, 
              name, 
              user.profile?.displayName
            );
            logger.debug(`📧 Welcome email result:`, { value: emailResult });
          } catch (emailError) {
            // Don't fail registration if email fails
            logger.error(`❌ Error sending welcome email:`, emailError);
          }
        } else {
          logger.debug('⚠️ SendGrid API key not configured. Skipping welcome email.');
        }
        
      } catch (createError) {
        logger.error('❌ Failed to create user in database:', createError);
        logger.error('Error details:', JSON.stringify(createError, null, 2));
        throw createError; // Re-throw to be handled by the error middleware
      }
      
      // Flag for profile update if using placeholder email
      if (email.includes('@memorix-user.com')) {
        user.needsProfileUpdate = true;
      }
    } else {
      logger.debug(`✅ Existing user found: ${user._id}`);
      
      // Try to update user profile with Auth0 data if needed
      if (user.email.includes('@memorix-user.com')) {
        logger.debug('🔍 User has placeholder email, checking Auth0 for real email');
        const auth0Profile = await getUserProfile(user.auth0Id);
        
        if (auth0Profile && auth0Profile.email) {
          logger.debug(`✅ Updating email from ${user.email} to ${auth0Profile.email}`);
          const oldEmail = user.email;
          user.email = auth0Profile.email;
          user.needsProfileUpdate = false;
          await user.save();
          
          // Send welcome email if we just got a real email address and SENDGRID_API_KEY is configured
          if (process.env.SENDGRID_API_KEY && !oldEmail.includes('@memorix-user.com') && auth0Profile.email) {
            try {
              logger.debug(`📧 Sending welcome email to user with updated email: ${auth0Profile.email}`);
              await emailService.sendWelcomeEmail(
                auth0Profile.email, 
                user.name || auth0Profile.name || 'Memorix User',
                user.profile?.displayName
              );
            } catch (emailError) {
              logger.error(`❌ Error sending welcome email after profile update:`, emailError);
            }
          }
        }
      }
      
      // Update last login time
      user.lastLogin = new Date();
      await user.save();
    }
    
    logger.debug(`Response sending user:`, { value: JSON.stringify(user }));
    logger.debug(`==================== USER LOGIN/CREATION END ====================`);
    res.json(user);
  } catch (error) {
    logger.error('❌ Error getting/creating user:', error);
    logger.error('Stack trace:', { value: error.stack });
    next(error);
  }
});

// Update user profile
router.put('/me', async (req, res, next) => {
  try {
    const { name, nickname, preferences, profile } = req.body;
    
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
    if (profile) {
      user.profile = {
        ...user.profile || {},
        ...profile
      };
    }
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Add PATCH endpoint for user profile updates
router.patch('/me', async (req, res, next) => {
  try {
    const { name, nickname, preferences, profile } = req.body;
    
    logger.debug('🔄 PATCH /users/me - Request body:', { value: JSON.stringify(req.body, null, 2 }));
    
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.debug('👤 Current user before update:', { JSON.stringify({
      name: user.name,
      preferences: user.preferences
    }, null, 2 }));
    
    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (nickname !== undefined) user.nickname = nickname;
    
    // Update preferences if provided
    if (preferences) {
      // Initialize preferences if it doesn't exist
      if (!user.preferences) user.preferences = {};
      
      logger.debug('🔧 Current preferences before update:', { value: JSON.stringify(user.preferences, null, 2 }));
      logger.debug('📝 New preferences to apply:', { value: JSON.stringify(preferences, null, 2 }));
      
      // For each preference field, handle boolean values specially
      Object.keys(preferences).forEach(key => {
        const oldValue = user.preferences[key];
        const newValue = preferences[key];
        
        // Ensure booleans are correctly handled 
        if (typeof newValue === 'boolean') {
          logger.debug(`🔑 Updating boolean preference '${key}' from ${oldValue} to ${newValue}`);
          user.preferences[key] = newValue;
        } else if (newValue !== undefined) {
          logger.debug(`🔑 Updating preference '${key}' from ${oldValue} to ${newValue}`);
          user.preferences[key] = newValue;
        }
      });
      
      logger.debug('✅ Updated preferences:', { value: JSON.stringify(user.preferences, null, 2 }));
    }
    
    // Update profile if provided
    if (profile) {
      user.profile = {
        ...user.profile || {},
        ...profile
      };
    }
    
    user.updatedAt = Date.now();
    await user.save();
    
    logger.debug('👤 Updated user after save:', { JSON.stringify({
      name: user.name,
      preferences: user.preferences
    }, null, 2 }));
    
    res.json(user);
  } catch (error) {
    logger.error('❌ Error updating user via PATCH:', error);
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

// Update onboarding stage
router.put('/me/onboarding', async (req, res, next) => {
  try {
    const { stage, profileData } = req.body;
    
    if (!['basic_info', 'interests', 'completed'].includes(stage)) {
      return res.status(400).json({ error: 'Invalid onboarding stage' });
    }
    
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Initialize profile if it doesn't exist
    if (!user.profile) {
      user.profile = {
        onboardingStage: 'not_started',
        profileCompleted: false
      };
    }
    
    // Update onboarding stage
    user.profile.onboardingStage = stage;
    
    // If this is the final stage, mark profile as completed
    if (stage === 'completed') {
      user.profile.profileCompleted = true;
    }
    
    // Update profile data if provided
    if (profileData) {
      user.profile = {
        ...user.profile,
        ...profileData
      };
      
      // If profileData contains preferences, update them separately
      if (profileData.preferences) {
        user.preferences = {
          ...user.preferences,
          ...profileData.preferences
        };
        
        // Remove preferences from profile to avoid duplication
        delete user.profile.preferences;
      }
    }
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      success: true,
      user,
      message: stage === 'completed' 
        ? 'Onboarding completed successfully' 
        : `Onboarding stage updated to ${stage}`
    });
  } catch (error) {
    logger.error('Error updating onboarding stage:', error);
    next(error);
  }
});

// Check onboarding status
router.get('/me/onboarding', async (req, res, next) => {
  try {
    const user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Default status if profile doesn't exist yet
    let status = {
      stage: 'not_started',
      completed: false,
      requiresOnboarding: true
    };
    
    if (user.profile) {
      // Only consider onboarding complete if explicitly marked complete or stage is 'completed'
      const isCompleted = user.profile.profileCompleted === true || user.profile.onboardingStage === 'completed';
      
      status = {
        stage: user.profile.onboardingStage || 'not_started',
        completed: isCompleted,
        requiresOnboarding: !isCompleted
      };
      
      // Log the onboarding status for debugging
      logger.debug(`Onboarding status for user ${user._id}: ${JSON.stringify(status)}`);
    }
    
    res.json(status);
  } catch (error) {
    logger.error('Error checking onboarding status:', error);
    next(error);
  }
});

export default router; 