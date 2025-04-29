import { authenticate, checkJwt, getUserFromToken } from './auth-middleware.js';

// Re-export the authentication middleware
export const auth = authenticate({ required: true });

// Also export other authentication functions for flexibility
export { authenticate, checkJwt, getUserFromToken };

export default auth; 