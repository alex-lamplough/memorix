import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Custom error handler for expressjwt
const handleJwtError = (err, req, res, next) => {
  console.error('❌ JWT validation error:', err.name, err.message);
  if (err.name === 'UnauthorizedError') {
    console.error('Token details:', err.inner ? err.inner.message : 'No details available');
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
  console.log('🔑 JWT validation starting');
  console.log('🔍 JWT audience:', process.env.AUTH0_AUDIENCE);
  console.log('🔍 JWT issuer:', `https://${process.env.AUTH0_DOMAIN}/`);
  
  // Extract token for logging
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('🔑 Received token:', token.substring(0, 15) + '...' + token.substring(token.length - 5));
  } else {
    console.log('❌ No Bearer token found in Authorization header');
  }
  
  // Apply the JWT middleware
  jwtCheck(req, res, (err) => {
    if (err) {
      return handleJwtError(err, req, res, next);
    }
    console.log('✅ JWT validation successful');
    next();
  });
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
    console.error('Error fetching user profile from Auth0:', error.message);
    return null;
  }
}

// Extract user information from token
export const getUserFromToken = (req, res, next) => {
  console.log('🔒 Auth middleware executing');
  
  if (!req.auth) {
    console.error('❌ No auth object in request');
    return next();
  }

  // Log auth object for debugging
  console.log('📝 Auth object from token:', JSON.stringify(req.auth, null, 2));

  // Extract user info from the Auth0 token
  const { sub } = req.auth;
  
  if (!sub) {
    console.error('❌ No sub claim in token');
    return next();
  }
  
  // Auth0 user IDs are in the format 'auth0|123456789'
  // We want to extract just the ID part
  const userId = sub.includes('|') ? sub.split('|')[1] : sub;
  
  // Add user info to the request object
  req.user = {
    id: userId,
    auth0Id: sub,
    // Include other user info as needed
  };

  console.log('✅ User info extracted from token:', JSON.stringify(req.user));
  next();
}; 