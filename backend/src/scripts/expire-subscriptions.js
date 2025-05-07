import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/user-model.js';

// Load environment variables from the correct path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try loading from backend .env locations
const envPaths = [
  join(__dirname, '../../../backend/.env'),
  join(__dirname, '../../../backend/.env.local'),
  join(__dirname, '../../../.env'),
  join(__dirname, '../../../.env.local')
];

let envLoaded = false;
for (const path of envPaths) {
  try {
    dotenv.config({ path });
    if (process.env.MONGODB_URI) {
      console.log('Loaded environment variables from:', path);
      envLoaded = true;
      break;
    }
  } catch (error) {
    console.log('Could not load from:', path);
  }
}

if (!envLoaded) {
  console.error('Could not load environment variables from any location');
  console.error('Please ensure MONGODB_URI is set in your backend environment variables');
  process.exit(1);
}

// Use local MongoDB URI when running locally
const mongoUri = process.env.MONGODB_URI.includes('railway.internal') 
  ? process.env.MONGODB_URI 
  : process.env.MONGODB_URI_LOCAL || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MongoDB URI is not set in environment variables');
  console.error('Please set MONGODB_URI or MONGODB_URI_LOCAL in your backend environment variables');
  process.exit(1);
}

async function expireSubscriptions() {
  try {
    console.log('Starting subscription expiry check...');
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', mongoUri.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://****:****@'));
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const now = new Date();
    console.log('Current time:', now.toISOString());

    const users = await User.find({
      'subscription.cancelAtPeriodEnd': true,
      'subscription.currentPeriodEnd': { $lt: now }
    });

    console.log(`Found ${users.length} users with expired subscriptions`);

    for (const user of users) {
      console.log(`Processing user ${user.email}:`, {
        currentPlan: user.subscription.plan,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd
      });

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