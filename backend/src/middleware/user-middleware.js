import User from '../models/user-model.js';
import logger from './utils/logger';
import mongoose from 'mongoose';

/**
 * Middleware to lookup MongoDB user by Auth0 ID
 * This sets req.user.id to the MongoDB ObjectId, which is needed for database queries
 */
export const lookupMongoUser = async (req, res, next) => {
  try {
    // Skip if no user or auth0Id
    if (!req.user || !req.user.auth0Id) {
      logger.debug('No user or auth0Id in request, skipping MongoDB user lookup');
      return next();
    }
    
    logger.debug(`🔍 Looking up MongoDB user with Auth0 ID: ${req.user.auth0Id}`);
    logger.debug('Request user object before lookup:', { value: JSON.stringify(req.user }));
    
    // Find the user in MongoDB by Auth0 ID
    const user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      logger.debug('⚠️ User not found in MongoDB with Auth0 ID:', { value: req.user.auth0Id });
      return next();
    }
    
    // Set the MongoDB ObjectId as req.user.id
    const previousId = req.user.id;
    req.user.id = user._id;
    req.user.mongoUser = user;
    
    console.log(`✅ Found MongoDB user: ${user._id} (matching Auth0 ID: ${req.user.auth0Id})`);
    logger.debug(`ID before lookup: ${previousId}, ID after lookup: ${req.user.id}`);
    logger.debug(`ID types - MongoDB _id: ${typeof user._id}, req.user.id: ${typeof req.user.id}`);
    
    next();
  } catch (error) {
    logger.error('❌ Error looking up MongoDB user:', error);
    next(error);
  }
};

export default { lookupMongoUser }; 