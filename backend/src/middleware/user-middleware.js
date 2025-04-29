import User from '../models/user-model.js';
import mongoose from 'mongoose';

/**
 * Middleware to lookup MongoDB user by Auth0 ID
 * This sets req.user.id to the MongoDB ObjectId, which is needed for database queries
 */
export const lookupMongoUser = async (req, res, next) => {
  try {
    // Skip if no user or auth0Id
    if (!req.user || !req.user.auth0Id) {
      console.log('No user or auth0Id in request, skipping MongoDB user lookup');
      return next();
    }
    
    console.log(`🔍 Looking up MongoDB user with Auth0 ID: ${req.user.auth0Id}`);
    
    // Find the user in MongoDB by Auth0 ID
    const user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      console.log('⚠️ User not found in MongoDB with Auth0 ID:', req.user.auth0Id);
      return next();
    }
    
    // Set the MongoDB ObjectId as req.user.id
    req.user.id = user._id;
    req.user.mongoUser = user;
    
    console.log(`✅ Found MongoDB user: ${user._id} (matching Auth0 ID: ${req.user.auth0Id})`);
    
    next();
  } catch (error) {
    console.error('❌ Error looking up MongoDB user:', error);
    next(error);
  }
};

export default { lookupMongoUser }; 