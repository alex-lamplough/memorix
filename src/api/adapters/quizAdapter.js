import apiClient from '../apiClient';
import logger from '../../utils/logger';
import axios from 'axios';

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
    logger.info(`Cancelling ${requestMap.size} pending quiz API requests`);
    
    requestMap.forEach((controller, endpoint) => {
      logger.debug(`Cancelling request to: ${endpoint}`);
      controller.abort('Navigation cancelled the request');
    });
    
    requestMap.clear();
  }
};

// Adapter functions that will be used by React Query hooks
export const quizAdapter = {
  cancelAllRequests,
  
  // Get all quizzes
  getAllQuizzes: async () => {
    const { signal, cleanup } = createCancellableRequest('quizzes');
    try {
      const response = await apiClient.get('/quizzes', { signal });
      cleanup();
      
      // Process the response to ensure necessary fields
      const quizzes = response.data.map(quiz => ({
        ...quiz,
        questionCount: quiz.questionCount || quiz.totalQuestions || 0
      }));
      
      return quizzes;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  // Get a specific quiz by ID
  getQuiz: async (id) => {
    const { signal, cleanup } = createCancellableRequest(`quizzes/${id}`);
    try {
      const response = await apiClient.get(`/quizzes/${id}`, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  // Create a new quiz
  createQuiz: async (quiz) => {
    const { signal, cleanup } = createCancellableRequest('quizzes-create');
    try {
      const response = await apiClient.post('/quizzes', quiz, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  // Update an existing quiz
  updateQuiz: async (id, quiz) => {
    const { signal, cleanup } = createCancellableRequest(`quizzes-update-${id}`);
    try {
      const response = await apiClient.put(`/quizzes/${id}`, quiz, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  // Delete a quiz
  deleteQuiz: async (id) => {
    const { signal, cleanup } = createCancellableRequest(`quizzes-delete-${id}`);
    try {
      const response = await apiClient.delete(`/quizzes/${id}`, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  // Toggle favorite status of a quiz
  toggleFavorite: async (id, isFavorite) => {
    const { signal, cleanup } = createCancellableRequest(`quizzes-favorite-${id}`);
    try {
      const response = await apiClient.patch(`/quizzes/${id}/favorite`, { isFavorite }, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  // Get favorite quizzes
  getFavorites: async () => {
    const { signal, cleanup } = createCancellableRequest('quizzes-favorites');
    try {
      let response;
      
      try {
        // First try the standard path
        response = await apiClient.get('/quizzes/favorites', { signal });
      } catch (initialError) {
        // If we get a 404, try with an alternative path format
        if (initialError.response && initialError.response.status === 404) {
          logger.info('First attempt failed with 404, trying alternative path...');
          // Some backends might expect /api/quizzes/favorites format
          response = await apiClient.get('/api/quizzes/favorites', { signal });
        } else {
          // If it wasn't a 404, rethrow the original error
          throw initialError;
        }
      }
      
      cleanup();
      
      // Process the response to include necessary fields
      const quizzes = response.data.map(quiz => ({
        ...quiz,
        questionCount: quiz.questionCount || quiz.totalQuestions || 0
      }));
      
      return quizzes;
    } catch (error) {
      cleanup();
      // When all else fails, return an empty array rather than throwing
      logger.info('Returning empty array for quiz favorites due to error');
      return [];
    }
  },
  
  // Generate quiz questions with AI
  generateQuestions: async (params) => {
    const { controller, signal, cleanup } = createCancellableRequest('quizzes-generate');
    try {
      logger.debug('Generating quiz questions with AI:', { 
        contentLength: params.content?.length || 0,
        count: params.count || 5,
        difficulty: params.difficulty || 'medium'
      });
      
      const response = await apiClient.post('/quizzes/generate', params, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        logger.debug('Request cancelled:', { value: error.message });
      } else {
        logger.error('Error generating quiz questions:', error);
      }
      throw error;
    }
  },
  
  // Submit a quiz answer
  submitAnswer: async (quizId, questionId, answer) => {
    try {
      const response = await apiClient.post(`/quizzes/${quizId}/questions/${questionId}/answer`, { answer });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Complete a quiz session
  completeQuiz: async (quizId, sessionData) => {
    try {
      const response = await apiClient.post(`/quizzes/${quizId}/complete`, sessionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 