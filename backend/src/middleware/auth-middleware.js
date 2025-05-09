import { expressjwt } from 'express-jwt';
import logger from '../utils/logger.js';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';
import axios from 'axios';
import User from '../models/user-model.js';

dotenv.config();

// Custom error handler for expressjwt
const handleJwtError = (err, req, res, next) => {
  logger.error('❌ JWT validation error:', { value: err.name, message: err.message });
  if (err.name === 'UnauthorizedError') {
    logger.error('Token details:', err.inner ? err.inner.message : 'No details available');
    return res.status(401).json({ 
      error: 'Invalid token',
      message: err.message,
      code: err.code
    });
  }
  next(err);
};

// Validate Auth0 tokens
const jwtCheck = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// Wrapped JWT check with logging
export const checkJwt = (req, res, next) => {
  logger.debug('🔑 JWT validation starting');
  logger.debug('🔍 JWT audience:', { value: process.env.AUTH0_AUDIENCE });
  logger.debug('🔍 JWT issuer:', `https://${process.env.AUTH0_DOMAIN}/`);
  
  // Extract token for logging
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    logger.debug('🔑 Received token:', { value: token.substring(0, 15 )}) + '...' + token.substring(token.length - 5);
  } else {
    logger.debug('❌ No Bearer token found in Authorization header');
  }
  
  // Apply the JWT middleware
  jwtCheck(req, res, (err) => {
    if (err) {
      return handleJwtError(err, req, res, next);
    }
    logger.debug('✅ JWT validation successful');
    next();
  });
};

/**
 * Authentication middleware that can be configured to require or make optional
 * the authentication
 * @param {Object} options Authentication options
 * @param {boolean} options.required Whether authentication is required (default: true)
 * @returns {Function} Express middleware function
 */
export const authenticate = (options = {}) => {
  const { required = true } = options;
  
  return (req, res, next) => {
    // If authentication is not required, skip token check
    if (!required) {
      // Still try to check the token if it exists
      const authHeader = req.headers.authorization || '';
      if (!authHeader.startsWith('Bearer ')) {
        logger.debug('ℹ️ No token provided, but authentication is optional');
        return next();
      }
    }
    
    // If we get here, either authentication is required or a token was provided
    checkJwt(req, res, (err) => {
      if (err) {
        // If authentication is optional, proceed even with invalid token
        if (!required) {
          logger.debug('⚠️ Invalid token provided, but authentication is optional');
          return next();
        }
        // Otherwise, handle the error
        return handleJwtError(err, req, res, next);
      }
      
      // Token is valid, extract user info
      getUserFromToken(req, res, next);
    });
  };
};

// Fetch complete user profile from Auth0 Management API
async function fetchUserProfile(userId, accessToken) {
  try {
    const response = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    logger.error('Error fetching user profile from Auth0:', { value: error.message });
    return null;
  }
}

// Extract user information from token
export const getUserFromToken = (req, res, next) => {
  logger.debug('🔒 Auth middleware executing');
  
  if (!req.auth) {
    logger.error('❌ No auth object in request');
    return next();
  }

  // Log auth object for debugging
  logger.debug('📝 Auth object from token:', { value: JSON.stringify(req.auth, null, 2) });

  // Extract user info from the Auth0 token
  const { sub } = req.auth;
  
  if (!sub) {
    logger.error('❌ No sub claim in token');
    return next();
  }
  
  // IMPORTANT: Don't extract just the ID part - we need the full Auth0 ID
  // for looking up the user in our database
  
  // Add user info to the request object - set auth0Id properly
  req.user = {
    // Temporary ID - this will be replaced with MongoDB ObjectId by user-lookup middleware
    id: null,
    auth0Id: sub,
    // Include other user info as needed
  };

  logger.debug('✅ Auth0 ID extracted from token:', { value: sub });
  
  // NOTE: At this point, req.user.id is null. It should be set by a subsequent middleware
  // that looks up the MongoDB user by auth0Id and sets the correct MongoDB _id
  next();
};

/**
 * Middleware to enforce onboarding completion
 * This middleware should be applied to routes that require completed onboarding
 */
export const requireCompletedOnboarding = async (req, res, next) => {
  try {
    // Skip for certain paths that should be accessible during onboarding
    const bypassPaths = [
      '/users/me',
      '/users/me/onboarding'
    ];
    
    // Check if the current path should bypass onboarding check
    if (bypassPaths.some(path => req.path.includes(path))) {
      logger.debug(`🔄 Bypassing onboarding check for path: ${req.path}`);
      return next();
    }
    
    logger.debug(`🔍 Checking onboarding status for route: ${req.path}`);
    
    // Ensure user is authenticated and we have user info
    if (!req.user || !req.user.auth0Id) {
      logger.error('❌ Cannot check onboarding: No authenticated user');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Find the user - using the imported User model
    const user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      logger.error(`❌ User not found for auth0Id: ${req.user.auth0Id}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if onboarding is completed
    const onboardingCompleted = 
      user.profile?.profileCompleted === true || 
      user.profile?.onboardingStage === 'completed';
    
    logger.debug(`👤 User ${user._id} onboarding status: ${onboardingCompleted ? 'Completed' : 'Incomplete'}`);
    
    if (!onboardingCompleted) {
      logger.debug(`🚫 Blocking access to ${req.path} - onboarding incomplete`);
      return res.status(403).json({ 
        error: 'Onboarding required',
        message: 'You must complete onboarding before accessing this resource',
        requiresOnboarding: true,
        redirectTo: '/onboarding'
      });
    }
    
    logger.debug(`✅ Onboarding check passed for ${req.path}`);
    next();
  } catch (error) {
    logger.error('❌ Error in onboarding middleware:', error);
    next(error);
  }
};

/**
 * Middleware that requires authentication
 * This is a convenience wrapper around authenticate with required=true
 * @returns {Function} Express middleware function
 */
export const requireAuth = authenticate({ required: true }); 