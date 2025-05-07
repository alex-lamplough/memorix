import api from './api';
import axios from 'axios';

// Keep track of ongoing requests so they can be cancelled when navigating away
const cancelTokens = new Map();
// Keep track of critical requests separately
const criticalTokens = new Map();
// Also track pending responses for critical requests to avoid duplicate fetches
const pendingResponses = new Map();

// Helper to create a request with a cancel token
const createCancellableRequest = (endpoint) => {
  // Determine if this is a critical request (like study or edit pages)
  const isCriticalRequest = endpoint.includes('quizzes/') && 
                            !endpoint.includes('create') && 
                            !endpoint.includes('update') && 
                            !endpoint.includes('delete') &&
                            !endpoint.includes('favorites');
  
  const tokenMap = isCriticalRequest ? criticalTokens : cancelTokens;
  
  // If this is a critical request already in progress, don't cancel it
  // Instead, return the existing controller
  if (isCriticalRequest && tokenMap.has(endpoint)) {
    console.log(`Reusing existing critical request for: ${endpoint}`);
    const controller = tokenMap.get(endpoint);
    return {
      controller,
      signal: controller.signal,
      cleanup: () => {
        // Only clean up if this is actually done
      },
      isCritical: true
    };
  }
  
  // Otherwise, cancel any ongoing request to this endpoint in the appropriate map
  if (tokenMap.has(endpoint)) {
    tokenMap.get(endpoint).abort();
  }
  
  // Create a new AbortController
  const controller = new AbortController();
  tokenMap.set(endpoint, controller);
  
  return {
    controller,
    signal: controller.signal,
    cleanup: () => {
      tokenMap.delete(endpoint);
    },
    isCritical: isCriticalRequest
  };
};

// Cancel all ongoing requests (useful when navigating away)
export const cancelAllRequests = () => {
  // Only cancel non-critical requests
  if (cancelTokens.size > 0) {
    console.log(`Cancelling ${cancelTokens.size} pending quiz API requests`);
    
    cancelTokens.forEach((controller, endpoint) => {
      console.log(`Cancelling request to: ${endpoint}`);
      controller.abort('Navigation cancelled the request');
    });
    
    // Clear all non-critical tokens
    cancelTokens.clear();
  }
  
  // Log information about preserved critical requests
  if (criticalTokens.size > 0) {
    console.log(`Preserved ${criticalTokens.size} critical quiz requests`);
  }
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
    const endpoint = `quizzes/${id}`;
    
    // For critical requests, check if we already have a pending request
    if (pendingResponses.has(endpoint)) {
      console.log(`Reusing pending response for: ${endpoint}`);
      try {
        return await pendingResponses.get(endpoint);
      } catch (error) {
        // If the cached promise rejected, remove it and continue with a fresh request
        pendingResponses.delete(endpoint);
      }
    }
    
    const { controller, signal, cleanup, isCritical } = createCancellableRequest(endpoint);
    
    // Create a promise for this request
    const requestPromise = (async () => {
      try {
        const response = await api.get(`/quizzes/${id}`, { signal });
        if (isCritical) {
          // Only remove this from pendingResponses after a delay to prevent
          // rapid consecutive requests
          setTimeout(() => {
            pendingResponses.delete(endpoint);
          }, 500);
        }
        cleanup();
        return response.data;
      } catch (error) {
        // Make sure to remove failed requests from the cache
        pendingResponses.delete(endpoint);
        if (axios.isCancel(error)) {
          console.log('Request cancelled:', error.message);
        } else {
          console.error(`Error fetching quiz ${id}:`, error);
        }
        throw error;
      }
    })();
    
    // Store this promise for critical requests
    if (isCritical) {
      pendingResponses.set(endpoint, requestPromise);
    }
    
    return requestPromise;
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
  
  // Toggle favorite status of a quiz
  toggleFavorite: async (id, isFavorite) => {
    const { controller, signal, cleanup } = createCancellableRequest(`quizzes-favorite-${id}`);
    try {
      const response = await api.patch(`/quizzes/${id}/favorite`, { isFavorite }, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      } else {
        console.error(`Error toggling favorite status for quiz ${id}:`, error);
      }
      throw error;
    }
  },
  
  // Get all favorite quizzes
  getFavorites: async () => {
    console.log('Requesting quiz favorites...');
    const { controller, signal, cleanup } = createCancellableRequest('quizzes-favorites');
    try {
      console.log('Making request to: /quizzes/favorites');
      
      try {
        // First try the standard path
        const response = await api.get('/quizzes/favorites', { signal });
        console.log('Quiz favorites response:', response.data);
        cleanup();
        return response.data;
      } catch (initialError) {
        // If we get a 404, try with an alternative path format
        if (initialError.response && initialError.response.status === 404) {
          console.log('First attempt failed with 404, trying alternative path...');
          // Use the original path without duplicating /api/
          const altResponse = await api.get('/quizzes/favorites', { 
            signal,
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
          });
          console.log('Alternative path quiz favorites response:', altResponse.data);
          return altResponse.data;
        }
        
        // If it wasn't a 404, rethrow the original error
        throw initialError;
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      } else {
        console.error('Error fetching favorite quizzes:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
      }
      
      // When all else fails, return an empty array rather than throwing
      // This prevents the UI from getting stuck in loading state
      console.log('Returning empty array for quiz favorites due to error');
      return [];
    } finally {
      cleanup();
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