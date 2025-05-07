import cron from 'node-cron';
import User from '../models/user-model.js';

/**
 * Checks for and expires subscriptions that have reached their end date
 * @returns {Promise<{success: boolean, message: string, expiredCount: number}>} Result of the operation
 */
export async function expireSubscriptions() {
  try {
    console.log('Starting subscription expiry check...');
    const now = new Date();
    const users = await User.find({
      'subscription.cancelAtPeriodEnd': true,
      'subscription.currentPeriodEnd': { $lt: now }
    });

    console.log(`Found ${users.length} users with expired subscriptions`);

    for (const user of users) {
      user.subscription.plan = 'free';
      user.subscription.status = 'inactive';
      user.subscription.cancelAtPeriodEnd = false;
      user.subscription.currentPeriodEnd = null;
      await user.save();
      console.log(`Expired subscription for user ${user.email}`);
    }

    console.log('Subscription expiry check completed successfully');
    return {
      success: true,
      message: 'Subscription expiry check completed successfully',
      expiredCount: users.length
    };
  } catch (error) {
    console.error('Error in subscription expiry check:', error);
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
    console.log('Running scheduled subscription expiry check...');
    expireSubscriptions();
  });
} 