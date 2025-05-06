/**
 * Migration script to add the contentUpdates preference to existing users
 * Copies the value from emailNotifications for consistency
 * 
 * Run with: node backend/src/scripts/add-content-updates-preference.js
 */

import mongoose from 'mongoose';
import User from '../models/user-model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/memorix';

async function addContentUpdatesPreference() {
  try {
    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find all users who don't have contentUpdates preference
    const users = await User.find({
      'preferences.contentUpdates': { $exists: false }
    });

    console.log(`Found ${users.length} users without contentUpdates preference`);

    // Update users with the new preference
    for (const user of users) {
      // Default to true, or use emailNotifications value if it exists
      const contentUpdatesValue = user.preferences?.emailNotifications !== undefined
        ? user.preferences.emailNotifications
        : true;

      console.log(`Updating user ${user._id} (${user.email}) - setting contentUpdates to ${contentUpdatesValue}`);

      user.preferences = {
        ...user.preferences || {},
        contentUpdates: contentUpdatesValue
      };

      await user.save();
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
addContentUpdatesPreference()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  }); 