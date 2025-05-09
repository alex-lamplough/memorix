import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * Activity Schema
 * Tracks user activities for flashcards and quizzes
 */
const ActivitySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for faster queries by user
  },
  title: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    enum: ['flashcard', 'quiz'],
    required: true,
    index: true // Add index for filtering by type
  },
  actionType: {
    type: String,
    enum: ['create', 'study', 'complete', 'update', 'delete'],
    required: true,
    index: true // Add index for filtering by action
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true // Add index for querying by specific items
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Add index for sorting and date filtering
  },
  metadata: {
    // Additional data specific to activity type
    // For study: { cardsStudied: 5, correctPercentage: 80 }
    // For quiz completion: { score: 90, timeSpent: 300 }
    type: Object,
    default: {}
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create compound index for common query patterns
ActivitySchema.index({ userId: 1, timestamp: -1 });
ActivitySchema.index({ userId: 1, itemType: 1, timestamp: -1 });

// Make sure each unique activity is only logged once
ActivitySchema.index(
  { userId: 1, itemId: 1, actionType: 1, timestamp: 1 },
  { unique: true }
);

const Activity = mongoose.model('Activity', ActivitySchema);
export default Activity; 