import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();

// Validate Auth0 tokens
export const checkJwt = expressjwt({
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

// Extract user information from token
export const getUserFromToken = (req, res, next) => {
  if (!req.auth) {
    return next();
  }

  // Extract user info from the Auth0 token
  const { sub } = req.auth;
  
  // Auth0 user IDs are in the format 'auth0|123456789'
  // We want to extract just the ID part
  const userId = sub.includes('|') ? sub.split('|')[1] : sub;
  
  // Add user info to the request object
  req.user = {
    id: userId,
    auth0Id: sub,
    // Include other user info as needed
  };

  next();
}; 