import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/user-model.js';

async function expireSubscriptions() {
  try {
    console.log('Starting subscription expiry check...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

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
  } catch (error) {
    console.error('Error in subscription expiry check:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

expireSubscriptions(); 