import cron from 'node-cron';
import logger from '../utils/logger.js';
import User from '../models/user-model.js';

/**
 * Checks for and expires subscriptions that have reached their end date
 * @returns {Promise<{success: boolean, message: string, expiredCount: number}>} Result of the operation
 */
export async function expireSubscriptions() {
  try {
    logger.debug('Starting subscription expiry check...');
    const now = new Date();
    const users = await User.find({
      'subscription.cancelAtPeriodEnd': true,
      'subscription.currentPeriodEnd': { $lt: now }
    });

    logger.debug(`Found ${users.length} users with expired subscriptions`);

    for (const user of users) {
      user.subscription.plan = 'free';
      user.subscription.status = 'inactive';
      user.subscription.cancelAtPeriodEnd = false;
      user.subscription.currentPeriodEnd = null;
      await user.save();
      logger.debug(`Expired subscription for user ${user.email}`);
    }

    logger.debug('Subscription expiry check completed successfully');
    return {
      success: true,
      message: 'Subscription expiry check completed successfully',
      expiredCount: users.length
    };
  } catch (error) {
    logger.error('Error in subscription expiry check:', error);
    return {
      success: false,
      message: error.message,
      expiredCount: 0
    };
  }
}

/**
 * Initialize all subscription-related cron jobs
 */
export function initSubscriptionCronJobs() {
  // Run subscription expiry check every day at midnight
  cron.schedule('0 0 * * *', () => {
    logger.debug('Running scheduled subscription expiry check...');
    expireSubscriptions();
  });
} 