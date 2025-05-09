/**
 * Backfill Activities Script
 * 
 * This script populates the activities collection based on existing flashcards and quizzes
 * Run it with: node src/scripts/backfill-activities.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

// Import models
import FlashcardSet from '../models/flashcard-set-model.js';
import Quiz from '../models/quiz-model.js';
import Activity from '../models/activity-model.js';

// Load environment variables
dotenv.config();

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
      logger.debug(`Activity already exists: ${actionType} ${itemType} "${title}"`);
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
    logger.error('Error creating activity:', { value: err });
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
    const flashcardSets = await FlashcardSet.find({});
    logger.debug(`Found ${flashcardSets.length} flashcard sets`);
    
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
      if (set.updatedAt && new Date(set.updatedAt).getTime() > new Date(set.createdAt).getTime() + 60000) {
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
      if (set.studyStats && (set.studyStats.lastStudied || set.studyStats.totalStudySessions > 0)) {
        const studyDate = set.studyStats.lastStudied || set.updatedAt;
        
        await createActivity({
          userId: set.userId,
          title: set.title,
          itemType: 'flashcard',
          actionType: 'study',
          itemId: set._id,
          timestamp: studyDate,
          metadata: {
            cardsStudied: set.studyStats.totalStudySessions || 0,
            timeSpent: set.studyStats.totalTimeSpent || 0
          }
        });
      }
      
      flashcardSetsProcessed++;
      if (flashcardSetsProcessed % 10 === 0) {
        logger.debug(`Processed ${flashcardSetsProcessed} flashcard sets...`);
      }
    }
    
    logger.debug(`Completed processing ${flashcardSetsProcessed} flashcard sets`);
  } catch (err) {
    logger.error('Error processing flashcard sets:', { value: err });
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
    logger.debug(`Found ${quizzes.length} quizzes`);
    
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
      if (quiz.updatedAt && new Date(quiz.updatedAt).getTime() > new Date(quiz.createdAt).getTime() + 60000) {
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
        logger.debug(`Processed ${quizzesProcessed} quizzes...`);
      }
    }
    
    logger.debug(`Completed processing ${quizzesProcessed} quizzes`);
  } catch (err) {
    logger.error('Error processing quizzes:', { value: err });
    errors++;
  }
};

/**
 * Main function
 */
const main = async () => {
  try {
    logger.debug('Starting activity backfill process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || config.database.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Get count of existing activities
    const existingCount = await Activity.countDocuments();
    logger.debug(`Found ${existingCount} existing activities`);
    
    // Process data
    await processFlashcardSets();
    await processQuizzes();
    
    // Print summary
    logger.debug('\n--- Backfill Summary ---');
    logger.debug(`Flashcard sets processed: ${flashcardSetsProcessed}`);
    logger.debug(`Quizzes processed: ${quizzesProcessed}`);
    logger.debug(`Activities created: ${activitiesCreated}`);
    logger.debug(`Errors encountered: ${errors}`);
    
    // Exit
    process.exit(0);
  } catch (err) {
    logger.error('Fatal error during backfill:', { value: err });
    process.exit(1);
  }
};

// Start process
main(); 