// Script to reset a user's Stripe customer ID
// This allows creating a new test mode customer when switching between live and test modes

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Import user model
import User from './src/models/user-model.js';

// Get MongoDB URI from env or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/memorix';

async function resetStripeCustomer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user by Auth0 ID
    const user = await User.findOne({ auth0Id: 'auth0|681a430765e75cdea0a6aee7' });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Found user:', {
      id: user._id.toString(),
      email: user.email,
      stripeCustomerId: user.stripeCustomerId || 'Not set'
    });
    
    // Save original Stripe customer ID for reference
    const originalCustomerId = user.stripeCustomerId;
    
    // Remove Stripe customer ID
    user.stripeCustomerId = undefined;
    await user.save();
    
    console.log(`User updated successfully!`);
    console.log(`Old Stripe customer ID '${originalCustomerId}' has been removed.`);
    console.log('A new test-mode Stripe customer will be created on next checkout.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
resetStripeCustomer(); 