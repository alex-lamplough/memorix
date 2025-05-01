import api from './api';
import axios from 'axios';

// Keep track of ongoing requests so they can be cancelled when navigating away
const cancelTokens = new Map();

// Helper to create a request with a cancel token
const createCancellableRequest = (endpoint) => {
  // Cancel any ongoing request to this endpoint
  if (cancelTokens.has(endpoint)) {
    cancelTokens.get(endpoint).abort();
  }
  
  // Create a new AbortController
  const controller = new AbortController();
  cancelTokens.set(endpoint, controller);
  
  return {
    controller,
    signal: controller.signal,
    cleanup: () => {
      cancelTokens.delete(endpoint);
    }
  };
};

// Cancel all ongoing requests (useful when navigating away)
export const cancelAllRequests = () => {
  console.log(`Cancelling ${cancelTokens.size} pending quiz API requests`);
  
  cancelTokens.forEach((controller, endpoint) => {
    console.log(`Cancelling request to: ${endpoint}`);
    controller.abort('Navigation cancelled the request');
  });
  
  cancelTokens.clear();
};

export const quizService = {
  // Add cancelAllRequests to the service
  cancelAllRequests,
  
  // Get all quizzes for the current user
  getAllQuizzes: async () => {
    const { controller, signal, cleanup } = createCancellableRequest('quizzes');
    try {
      const response = await api.get('/quizzes', { signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      } else {
        console.error('Error fetching quizzes:', error);
      }
      throw error;
    }
  },
  
  // Get a specific quiz by ID
  getQuiz: async (id) => {
    const { controller, signal, cleanup } = createCancellableRequest(`quizzes/${id}`);
    try {
      const response = await api.get(`/quizzes/${id}`, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      } else {
        console.error(`Error fetching quiz ${id}:`, error);
      }
      throw error;
    }
  },
  
  // Create a new quiz
  createQuiz: async (quiz) => {
    const { controller, signal, cleanup } = createCancellableRequest('quizzes-create');
    try {
      const response = await api.post('/quizzes', quiz, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      } else {
        console.error('Error creating quiz:', error);
      }
      throw error;
    }
  },
  
  // Update an existing quiz
  updateQuiz: async (id, quiz) => {
    const { controller, signal, cleanup } = createCancellableRequest(`quizzes-update-${id}`);
    try {
      const response = await api.put(`/quizzes/${id}`, quiz, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      } else {
        console.error(`Error updating quiz ${id}:`, error);
      }
      throw error;
    }
  },
  
  // Delete a quiz
  deleteQuiz: async (id) => {
    const { controller, signal, cleanup } = createCancellableRequest(`quizzes-delete-${id}`);
    try {
      console.log(`Attempting to delete quiz with ID: ${id}`);
      const response = await api.delete(`/quizzes/${id}`, { signal });
      cleanup();
      console.log(`Delete quiz response:`, response.data);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      } else {
        console.error(`Error deleting quiz ${id}:`, error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
      }
      throw error;
    }
  },
  
  // Get public quizzes
  getPublicQuizzes: async (params = {}) => {
    const { controller, signal, cleanup } = createCancellableRequest('quizzes-public');
    try {
      const response = await api.get('/quizzes/public', { params, signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      } else {
        console.error('Error fetching public quizzes:', error);
      }
      throw error;
    }
  }
};

export default quizService; 