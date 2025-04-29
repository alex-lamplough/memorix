import express from 'express';
import { checkJwt, getUserFromToken } from '../middleware/auth-middleware.js';
import User from '../models/user-model.js';
import { getUserProfile } from '../services/auth0-service.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(checkJwt);
router.use(getUserFromToken);

// Get current user profile
router.get('/me', async (req, res, next) => {
  try {
    console.log(`==================== USER LOGIN/CREATION START ====================`);
    console.log(`🔍 Looking up user with Auth0 ID: ${req.user.auth0Id}`);
    console.log(`🔑 Auth Middleware User Object:`, JSON.stringify(req.user));
    console.log(`🔑 Auth Token Content:`, JSON.stringify(req.auth));
    
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      console.log(`❗ User not found in database, creating new user record`);
      
      // Extract user info from Auth0 token
      const userInfo = req.auth;
      const auth0Id = userInfo.sub;
      
      // Log the token for debugging
      console.log('📝 Auth0 token received:', JSON.stringify(userInfo, null, 2));
      console.log(`💡 NODE_ENV: ${process.env.NODE_ENV}`);
      
      // Try to get full profile from Auth0 Management API
      console.log('🔍 Fetching full profile from Auth0 Management API');
      const auth0Profile = await getUserProfile(auth0Id);
      console.log('📝 Auth0 Profile API Response:', auth0Profile ? 'Success' : 'Failed');
      if (auth0Profile) {
        console.log('📝 Auth0 Profile Data:', JSON.stringify(auth0Profile, null, 2));
      }
      
      let email, name, picture;
      
      if (auth0Profile && auth0Profile.email) {
        // Get details from Auth0 Management API
        email = auth0Profile.email;
        name = auth0Profile.name || auth0Profile.nickname || 'Memorix User';
        picture = auth0Profile.picture || '';
        
        console.log('✅ Using email from Auth0 Management API:', email);
      } else {
        // Fallback to token data or generate placeholder
        email = userInfo.email || `${auth0Id.replace(/[|]/g, '-')}@memorix-user.com`;
        name = userInfo.name || userInfo.nickname || 'Memorix User';
        picture = userInfo.picture || '';
        
        console.log('⚠️ Using fallback email:', email);
        if (auth0Profile === null) {
          console.log('❌ Auth0 Management API call failed or returned null');
        }
      }
      
      console.log('🔧 Creating new user with:', { 
        auth0Id, 
        email, 
        name 
      });
      
      try {
        // Create new user
        user = await User.create({
          auth0Id,
          email,
          name,
          picture
        });
        
        console.log(`✅ New user created in database: ${user._id}`);
      } catch (createError) {
        console.error('❌ Failed to create user in database:', createError);
        console.error('Error details:', JSON.stringify(createError, null, 2));
        throw createError; // Re-throw to be handled by the error middleware
      }
      
      // Flag for profile update if using placeholder email
      if (email.includes('@memorix-user.com')) {
        user.needsProfileUpdate = true;
      }
    } else {
      console.log(`✅ Existing user found: ${user._id}`);
      
      // Try to update user profile with Auth0 data if needed
      if (user.email.includes('@memorix-user.com')) {
        console.log('🔍 User has placeholder email, checking Auth0 for real email');
        const auth0Profile = await getUserProfile(user.auth0Id);
        
        if (auth0Profile && auth0Profile.email) {
          console.log(`✅ Updating email from ${user.email} to ${auth0Profile.email}`);
          user.email = auth0Profile.email;
          user.needsProfileUpdate = false;
          await user.save();
        }
      }
      
      // Update last login time
      user.lastLogin = new Date();
      await user.save();
    }
    
    console.log(`Response sending user:`, JSON.stringify(user));
    console.log(`==================== USER LOGIN/CREATION END ====================`);
    res.json(user);
  } catch (error) {
    console.error('❌ Error getting/creating user:', error);
    console.error('Stack trace:', error.stack);
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