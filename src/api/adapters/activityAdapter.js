import apiClient from '../apiClient';
import logger from '../../utils/logger';

// Create a map to track in-flight requests (for cancellation)
const requestMap = new Map();

// Helper to create a cancellable request
const createCancellableRequest = (endpoint) => {
  // Cancel any existing request for this endpoint
  if (requestMap.has(endpoint)) {
    requestMap.get(endpoint).abort();
  }
  
  // Create a new controller
  const controller = new AbortController();
  requestMap.set(endpoint, controller);
  
  return {
    signal: controller.signal,
    cleanup: () => requestMap.delete(endpoint)
  };
};

// Cancel all requests
export const cancelAllRequests = () => {
  if (requestMap.size > 0) {
    logger.info(`Cancelling ${requestMap.size} pending activity API requests`);
    
    requestMap.forEach((controller, endpoint) => {
      logger.debug(`Cancelling request to: ${endpoint}`);
      controller.abort('Navigation cancelled the request');
    });
    
    requestMap.clear();
  }
};

// Adapter functions that will be used by React Query hooks
export const activityAdapter = {
  cancelAllRequests,
  
  /**
   * Fetch user activities with optional filtering
   * 
   * @param {Object} params - Parameters for filtering activities
   * @param {string} params.type - Filter by activity type (flashcard, quiz, etc.)
   * @param {string} params.action - Filter by action type (create, study, complete, etc.)
   * @param {string} params.startDate - Start date for filtering
   * @param {string} params.endDate - End date for filtering
   * @param {number} params.limit - Maximum number of activities to return
   * @param {string} params.sort - Sort order (newest, oldest)
   * @returns {Promise<Array>} - Array of user activities
   */
  getUserActivities: async (params = {}) => {
    const { signal, cleanup } = createCancellableRequest('activities');
    try {
      const response = await apiClient.get('/activities', { 
        params,
        signal 
      });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      
      // If the backend doesn't support activities endpoint yet, return empty array
      if (error.response && error.response.status === 404) {
        logger.warn('Activities endpoint not found. Returning empty array.');
        return [];
      }
      
      throw error;
    }
  },
  
  /**
   * Generate activities from flashcards and quizzes data
   * This is used as a fallback when the backend API doesn't have a dedicated activities endpoint
   * 
   * @param {Array} flashcardSets - Array of flashcard sets
   * @param {Array} quizzes - Array of quizzes
   * @param {Object} options - Options for generating activities
   * @param {number} options.limit - Maximum number of activities to return
   * @param {string} options.filter - Filter by activity type
   * @returns {Array} - Generated activities
   */
  generateActivitiesFromData: (flashcardSets = [], quizzes = [], options = {}) => {
    try {
      // Transform flashcard sets into activity items
      const flashcardActivities = flashcardSets.flatMap(set => {
        const activities = [];
        
        // Create activity
        activities.push({
          id: `create-${set._id}`,
          title: set.title,
          itemType: 'flashcard',
          actionType: 'create',
          timestamp: set.createdAt,
          cardsCount: set.cardCount || (set.cards ? set.cards.length : 0)
        });
        
        // Study activity (if studied)
        if (set.lastStudied) {
          activities.push({
            id: `study-${set._id}-${new Date(set.lastStudied).getTime()}`,
            title: set.title,
            itemType: 'flashcard',
            actionType: 'study',
            timestamp: set.lastStudied,
            cardsStudied: Math.round(set.cardCount * (set.progress || 0) / 100)
          });
        }
        
        // Update activity (if updated after creation)
        if (set.updatedAt && new Date(set.updatedAt).getTime() > new Date(set.createdAt).getTime()) {
          activities.push({
            id: `update-${set._id}-${new Date(set.updatedAt).getTime()}`,
            title: set.title,
            itemType: 'flashcard',
            actionType: 'update',
            timestamp: set.updatedAt
          });
        }
        
        return activities;
      });
      
      // Transform quizzes into activity items
      const quizActivities = quizzes.flatMap(quiz => {
        const activities = [];
        
        // Create activity
        activities.push({
          id: `create-quiz-${quiz._id}`,
          title: quiz.title,
          itemType: 'quiz',
          actionType: 'create',
          timestamp: quiz.createdAt,
          questionsCount: quiz.questions?.length || 0
        });
        
        // Complete activity (if completed)
        if (quiz.lastCompleted) {
          activities.push({
            id: `complete-quiz-${quiz._id}-${new Date(quiz.lastCompleted).getTime()}`,
            title: quiz.title,
            itemType: 'quiz',
            actionType: 'complete',
            timestamp: quiz.lastCompleted,
            score: quiz.lastScore || 0
          });
        }
        
        // Update activity (if updated after creation)
        if (quiz.updatedAt && new Date(quiz.updatedAt).getTime() > new Date(quiz.createdAt).getTime()) {
          activities.push({
            id: `update-quiz-${quiz._id}-${new Date(quiz.updatedAt).getTime()}`,
            title: quiz.title,
            itemType: 'quiz',
            actionType: 'update',
            timestamp: quiz.updatedAt
          });
        }
        
        return activities;
      });
      
      // Combine all activities
      let allActivities = [...flashcardActivities, ...quizActivities];
      
      // Apply filtering if specified
      if (options.filter) {
        if (options.filter === 'flashcard') {
          allActivities = allActivities.filter(a => a.itemType === 'flashcard');
        } else if (options.filter === 'quiz') {
          allActivities = allActivities.filter(a => a.itemType === 'quiz');
        } else if (['create', 'study', 'complete', 'update'].includes(options.filter)) {
          allActivities = allActivities.filter(a => a.actionType === options.filter);
        }
      }
      
      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Apply limit if specified
      if (options.limit && options.limit !== 'All') {
        allActivities = allActivities.slice(0, parseInt(options.limit));
      }
      
      return allActivities;
    } catch (error) {
      logger.error('Error generating activity data:', error);
      return [];
    }
  },
  
  /**
   * Log a new activity
   * 
   * @param {Object} activity - Activity to log
   * @returns {Promise<Object>} - Logged activity
   */
  logActivity: async (activity) => {
    try {
      const response = await apiClient.post('/activities', activity);
      return response.data;
    } catch (error) {
      logger.error('Error logging activity:', error);
      
      // If the backend doesn't support activities endpoint yet, just return the activity
      if (error.response && (error.response.status === 404 || error.response.status === 501)) {
        return activity;
      }
      
      throw error;
    }
  }
};

export default activityAdapter; 