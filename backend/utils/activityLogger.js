const Activity = require('../models/Activity');

/**
 * Log user activity
 * 
 * @param {Object} params - Activity parameters
 * @param {string} params.userId - User ID
 * @param {string} params.title - Activity title
 * @param {string} params.itemType - Item type (flashcard, quiz)
 * @param {string} params.actionType - Action type (create, study, complete, update)
 * @param {string} params.itemId - Item ID
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise} - Promise resolving to the created activity
 */
const logActivity = async (params) => {
  try {
    const { userId, title, itemType, actionType, itemId, metadata = {} } = params;
    
    // Validate required fields
    if (!userId || !title || !itemType || !actionType || !itemId) {
      console.error('Activity logging failed: Missing required fields');
      return null;
    }
    
    // Use findOneAndUpdate with upsert to prevent duplicates
    const activity = await Activity.findOneAndUpdate(
      {
        userId,
        itemId,
        actionType,
        // Use a 5-second window to prevent near-simultaneous duplicates
        timestamp: {
          $gte: new Date(Date.now() - 5000),
          $lte: new Date()
        }
      },
      {
        $setOnInsert: {
          userId,
          title,
          itemType,
          actionType,
          itemId,
          metadata,
          timestamp: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );
    
    return activity;
  } catch (err) {
    // Log error but don't throw - activity logging should not break main operations
    console.error('Error logging activity:', err);
    return null;
  }
};

/**
 * Log flashcard creation activity
 * 
 * @param {Object} user - User object
 * @param {Object} flashcardSet - Flashcard set
 * @returns {Promise} - Promise resolving to the created activity
 */
const logFlashcardCreation = async (user, flashcardSet) => {
  return logActivity({
    userId: user.id,
    title: flashcardSet.title,
    itemType: 'flashcard',
    actionType: 'create',
    itemId: flashcardSet._id,
    metadata: {
      cardCount: flashcardSet.cards ? flashcardSet.cards.length : 0,
      category: flashcardSet.category || ''
    }
  });
};

/**
 * Log flashcard study activity
 * 
 * @param {Object} user - User object
 * @param {Object} flashcardSet - Flashcard set
 * @param {Object} studyStats - Study statistics
 * @returns {Promise} - Promise resolving to the created activity
 */
const logFlashcardStudy = async (user, flashcardSet, studyStats) => {
  return logActivity({
    userId: user.id,
    title: flashcardSet.title,
    itemType: 'flashcard',
    actionType: 'study',
    itemId: flashcardSet._id,
    metadata: {
      cardsStudied: studyStats.cardsStudied || 0,
      correctPercentage: studyStats.correctPercentage || 0,
      timeSpent: studyStats.timeSpent || 0
    }
  });
};

/**
 * Log quiz completion activity
 * 
 * @param {Object} user - User object
 * @param {Object} quiz - Quiz object
 * @param {Object} results - Quiz results
 * @returns {Promise} - Promise resolving to the created activity
 */
const logQuizCompletion = async (user, quiz, results) => {
  return logActivity({
    userId: user.id,
    title: quiz.title,
    itemType: 'quiz',
    actionType: 'complete',
    itemId: quiz._id,
    metadata: {
      score: results.score || 0,
      questionsAnswered: results.questionsAnswered || 0,
      timeSpent: results.timeSpent || 0
    }
  });
};

module.exports = {
  logActivity,
  logFlashcardCreation,
  logFlashcardStudy,
  logQuizCompletion
}; 