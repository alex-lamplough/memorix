/**
 * Backfill Activities Script
 * 
 * This script populates the activities collection based on existing flashcards and quizzes
 * Run it with: node scripts/backfillActivities.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const Activity = require('../models/Activity');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Global stats
let flashcardSetsProcessed = 0;
let quizzesProcessed = 0;
let activitiesCreated = 0;
let errors = 0;

/**
 * Create activity record
 */
const createActivity = async (data) => {
  try {
    const { userId, title, itemType, actionType, itemId, timestamp, metadata } = data;
    
    // Check if activity already exists
    const existing = await Activity.findOne({
      userId,
      itemId,
      actionType,
      timestamp: {
        $gte: new Date(new Date(timestamp).getTime() - 1000), // 1 second window
        $lte: new Date(new Date(timestamp).getTime() + 1000)
      }
    });
    
    if (existing) {
      console.log(`Activity already exists: ${actionType} ${itemType} "${title}"`);
      return null;
    }
    
    // Create new activity
    const activity = new Activity({
      userId,
      title,
      itemType,
      actionType,
      itemId,
      timestamp: new Date(timestamp),
      metadata
    });
    
    await activity.save();
    activitiesCreated++;
    return activity;
  } catch (err) {
    console.error('Error creating activity:', err);
    errors++;
    return null;
  }
};

/**
 * Process flashcard sets to create activities
 */
const processFlashcardSets = async () => {
  try {
    // Get all flashcard sets
    const flashcardSets = await Flashcard.find({});
    console.log(`Found ${flashcardSets.length} flashcard sets`);
    
    for (const set of flashcardSets) {
      // Create 'create' activity
      await createActivity({
        userId: set.userId,
        title: set.title,
        itemType: 'flashcard',
        actionType: 'create',
        itemId: set._id,
        timestamp: set.createdAt,
        metadata: {
          cardCount: set.cards ? set.cards.length : 0,
          category: set.category || ''
        }
      });
      
      // If updated after creation, create 'update' activity
      if (set.updatedAt && new Date(set.updatedAt).getTime() > new Date(set.createdAt).getTime()) {
        await createActivity({
          userId: set.userId,
          title: set.title,
          itemType: 'flashcard',
          actionType: 'update',
          itemId: set._id,
          timestamp: set.updatedAt,
          metadata: {
            cardCount: set.cards ? set.cards.length : 0
          }
        });
      }
      
      // If studied, create 'study' activity
      if (set.lastStudied || (set.studyProgress && set.studyProgress.lastUpdated)) {
        const studyDate = set.lastStudied || set.studyProgress.lastUpdated;
        
        await createActivity({
          userId: set.userId,
          title: set.title,
          itemType: 'flashcard',
          actionType: 'study',
          itemId: set._id,
          timestamp: studyDate,
          metadata: {
            cardsStudied: set.studyStats?.cardsStudied || 0,
            correctPercentage: set.studyStats?.correctPercentage || 0
          }
        });
      }
      
      flashcardSetsProcessed++;
      if (flashcardSetsProcessed % 10 === 0) {
        console.log(`Processed ${flashcardSetsProcessed} flashcard sets...`);
      }
    }
    
    console.log(`Completed processing ${flashcardSetsProcessed} flashcard sets`);
  } catch (err) {
    console.error('Error processing flashcard sets:', err);
    errors++;
  }
};

/**
 * Process quizzes to create activities
 */
const processQuizzes = async () => {
  try {
    // Get all quizzes
    const quizzes = await Quiz.find({});
    console.log(`Found ${quizzes.length} quizzes`);
    
    for (const quiz of quizzes) {
      // Create 'create' activity
      await createActivity({
        userId: quiz.userId,
        title: quiz.title,
        itemType: 'quiz',
        actionType: 'create',
        itemId: quiz._id,
        timestamp: quiz.createdAt,
        metadata: {
          questionsCount: quiz.questions?.length || 0
        }
      });
      
      // If updated after creation, create 'update' activity
      if (quiz.updatedAt && new Date(quiz.updatedAt).getTime() > new Date(quiz.createdAt).getTime()) {
        await createActivity({
          userId: quiz.userId,
          title: quiz.title,
          itemType: 'quiz',
          actionType: 'update',
          itemId: quiz._id,
          timestamp: quiz.updatedAt,
          metadata: {
            questionsCount: quiz.questions?.length || 0
          }
        });
      }
      
      // If completed, create 'complete' activity
      if (quiz.lastCompleted) {
        await createActivity({
          userId: quiz.userId,
          title: quiz.title,
          itemType: 'quiz',
          actionType: 'complete',
          itemId: quiz._id,
          timestamp: quiz.lastCompleted,
          metadata: {
            score: quiz.lastScore || 0
          }
        });
      }
      
      quizzesProcessed++;
      if (quizzesProcessed % 10 === 0) {
        console.log(`Processed ${quizzesProcessed} quizzes...`);
      }
    }
    
    console.log(`Completed processing ${quizzesProcessed} quizzes`);
  } catch (err) {
    console.error('Error processing quizzes:', err);
    errors++;
  }
};

/**
 * Main function
 */
const main = async () => {
  try {
    console.log('Starting activity backfill process...');
    
    // Get count of existing activities
    const existingCount = await Activity.countDocuments();
    console.log(`Found ${existingCount} existing activities`);
    
    // Process data
    await processFlashcardSets();
    await processQuizzes();
    
    // Print summary
    console.log('\n--- Backfill Summary ---');
    console.log(`Flashcard sets processed: ${flashcardSetsProcessed}`);
    console.log(`Quizzes processed: ${quizzesProcessed}`);
    console.log(`Activities created: ${activitiesCreated}`);
    console.log(`Errors encountered: ${errors}`);
    
    // Exit
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during backfill:', err);
    process.exit(1);
  }
};

// Start process
main(); 