import axios from 'axios';
import logger from '../utils/logger';

// Set default base URL for API requests
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// This function will be set by the AuthTokenProvider when the app initializes
let getAccessToken = async () => null;

// Export a function to set the token getter
export const setAuthTokenGetter = (tokenGetter) => {
  getAccessToken = tokenGetter;
};

// Track if we're handling a token refresh to prevent infinite loops
let isRefreshing = false;
let refreshPromise = null;
let isRedirectingToLogin = false;

// Also track pending responses for critical requests to avoid duplicate fetches
const pendingResponses = new Map();

// Add auth token to requests if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log the request for debugging
      logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    } catch (error) {
      logger.error('Error getting auth token for request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to log all responses and handle auth errors
api.interceptors.response.use(
  (response) => {
    logger.debug(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  async (error) => {
    if (error.response) {
      logger.error(`API Error: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        data: error.response.data
      });
      
      // Handle 401 Unauthorized errors (expired token)
      if (error.response.status === 401 && !isRedirectingToLogin) {
        logger.warn('Unauthorized request - token may be expired');
        
        // If we're not already handling a token refresh
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            // Try to get a fresh token
            logger.info('Attempting to refresh token...');
            const newToken = await getAccessToken();
            
            if (newToken) {
              logger.info('Token refreshed successfully, retrying request');
              
              // Retry the original request with the new token
              const config = error.config;
              config.headers.Authorization = `Bearer ${newToken}`;
              
              isRefreshing = false;
              return axios(config);
            } else {
              logger.error('Failed to refresh token, redirecting to login');
              handleAuthenticationFailure();
            }
          } catch (refreshError) {
            logger.error('Error refreshing token:', refreshError);
            handleAuthenticationFailure();
          } finally {
            isRefreshing = false;
          }
        }
      }
    } else {
      logger.error('API request failed:', { message: error.message });
    }
    return Promise.reject(error);
  }
);

// Handle authentication failure by redirecting to login
function handleAuthenticationFailure() {
  if (isRedirectingToLogin) return;
  
  isRedirectingToLogin = true;
  
  // Display message to user
  const message = document.createElement('div');
  message.style.position = 'fixed';
  message.style.top = '20px';
  message.style.left = '50%';
  message.style.transform = 'translateX(-50%)';
  message.style.backgroundColor = '#ff7262';
  message.style.color = 'white';
  message.style.padding = '12px 20px';
  message.style.borderRadius = '8px';
  message.style.zIndex = '9999';
  message.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  message.textContent = 'Your session has expired. Redirecting to login...';
  
  document.body.appendChild(message);
  
  // Redirect to login after a short delay to allow message to be seen
  setTimeout(() => {
    logger.info('Redirecting to login page due to auth error');
    window.location.href = '/';
    isRedirectingToLogin = false;
  }, 2000);
}

// Keep track of ongoing requests so they can be cancelled when navigating away
const cancelTokens = new Map();
// Keep track of critical requests separately
const criticalTokens = new Map();

// Helper to create a request with a cancel token
const createCancellableRequest = (endpoint) => {
  // Determine if this is a critical request (like study or edit pages)
  const isCriticalRequest = endpoint.includes('flashcards/') && 
                            !endpoint.includes('create') && 
                            !endpoint.includes('update') && 
                            !endpoint.includes('delete') &&
                            !endpoint.includes('favorites');
  
  const tokenMap = isCriticalRequest ? criticalTokens : cancelTokens;
  
  // If this is a critical request already in progress, don't cancel it
  // Instead, return the existing controller
  if (isCriticalRequest && tokenMap.has(endpoint)) {
    logger.debug(`Reusing existing critical request for: ${endpoint}`);
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
    logger.info(`Cancelling ${cancelTokens.size} pending flashcard API requests`);
    
    cancelTokens.forEach((controller, endpoint) => {
      logger.debug(`Cancelling request to: ${endpoint}`);
      controller.abort('Navigation cancelled the request');
    });
    
    // Clear all non-critical tokens
    cancelTokens.clear();
  }
  
  // Log information about preserved critical requests
  if (criticalTokens.size > 0) {
    logger.debug(`Preserved ${criticalTokens.size} critical flashcard requests`);
  }
};

// Flashcard Services
export const flashcardService = {
  // Add cancelAllRequests to the service
  cancelAllRequests,
  
  // Get all flashcard sets for the current user
  getAllFlashcardSets: async () => {
    const { controller, signal, cleanup } = createCancellableRequest('flashcards');
    try {
      const response = await api.get('/flashcards', { signal });
      cleanup();
      
      // Process the response to include cardCount
      const flashcardSets = response.data.map(set => ({
        ...set,
        // Add cardCount if not present (backend might not include it)
        cardCount: set.cardCount || (set.cards ? set.cards.length : 0)
      }));
      
      return flashcardSets;
    } catch (error) {
      if (axios.isCancel(error)) {
        logger.debug('Request cancelled:', { message: error.message });
      }
      throw error;
    }
  },
  
  // Get a specific flashcard set by ID
  getFlashcardSet: async (id) => {
    const endpoint = `flashcards/${id}`;
    
    // For critical requests, check if we already have a pending request
    if (pendingResponses.has(endpoint)) {
      logger.debug(`Reusing pending response for: ${endpoint}`);
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
        const response = await api.get(`/flashcards/${id}`, { signal });
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
          logger.debug('Request cancelled:', { message: error.message });
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
  
  // Create a new flashcard set
  createFlashcardSet: async (flashcardSet) => {
    const { controller, signal, cleanup } = createCancellableRequest('flashcards-create');
    try {
      const response = await api.post('/flashcards', flashcardSet, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        logger.debug('Request cancelled:', { message: error.message });
      }
      throw error;
    }
  },
  
  // Update an existing flashcard set
  updateFlashcardSet: async (id, flashcardSet) => {
    const { controller, signal, cleanup } = createCancellableRequest(`flashcards-update-${id}`);
    try {
      const response = await api.put(`/flashcards/${id}`, flashcardSet, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        logger.debug('Request cancelled:', { message: error.message });
      }
      throw error;
    }
  },
  
  // Toggle favorite status of a flashcard set
  toggleFavorite: async (id, isFavorite) => {
    const { controller, signal, cleanup } = createCancellableRequest(`flashcards-favorite-${id}`);
    try {
      const response = await api.patch(`/flashcards/${id}/favorite`, { isFavorite }, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        logger.debug('Request cancelled:', { message: error.message });
      }
      throw error;
    }
  },
  
  // Get all favorite flashcard sets
  getFavorites: async () => {
    logger.info('Requesting flashcard favorites...');
    const { controller, signal, cleanup } = createCancellableRequest('flashcards-favorites');
    try {
      logger.debug('Making request to: /flashcards/favorites');
      
      try {
        // First try the standard path
        const response = await api.get('/flashcards/favorites', { signal });
        logger.debug('Flashcard favorites response:', { data: response.data });
        cleanup();
        
        // Process the response to include cardCount
        const flashcardSets = response.data.map(set => ({
          ...set,
          cardCount: set.cardCount || (set.cards ? set.cards.length : 0)
        }));
        
        return flashcardSets;
      } catch (initialError) {
        // If we get a 404, try with an alternative path format
        if (initialError.response && initialError.response.status === 404) {
          logger.info('First attempt failed with 404, trying alternative path...');
          // Some backends might expect /api/flashcards/favorites format
          const altResponse = await api.get('/api/flashcards/favorites', { signal });
          logger.debug('Alternative path flashcard favorites response:', { data: altResponse.data });
          
          // Process the response to include cardCount
          const flashcardSets = altResponse.data.map(set => ({
            ...set,
            cardCount: set.cardCount || (set.cards ? set.cards.length : 0)
          }));
          
          return flashcardSets;
        }
        
        // If it wasn't a 404, rethrow the original error
        throw initialError;
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        logger.debug('Request cancelled:', { message: error.message });
      } else {
        logger.error('Error fetching flashcard favorites:', error);
        if (error.response) {
          logger.error('Error response details:', {
            data: error.response.data,
            status: error.response.status
          });
        }
      }
      
      // When all else fails, return an empty array rather than throwing
      // This prevents the UI from getting stuck in loading state
      logger.info('Returning empty array for flashcard favorites due to error');
      return [];
    } finally {
      cleanup();
    }
  },
  
  // Delete a flashcard set
  deleteFlashcardSet: async (id) => {
    const { controller, signal, cleanup } = createCancellableRequest(`flashcards-delete-${id}`);
    try {
      const response = await api.delete(`/flashcards/${id}`, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        logger.debug('Request cancelled:', { message: error.message });
      }
      throw error;
    }
  },
  
  // Generate flashcards using AI
  generateFlashcards: async (params) => {
    try {
      const response = await api.post('/flashcards/generate', params);
      return response.data;
    } catch (error) {
      logger.error('Error generating flashcards:', error);
      throw error;
    }
  },
  
  // Record study session for a flashcard set
  recordStudySession: async (id, sessionData) => {
    try {
      const response = await api.post(`/flashcards/${id}/study`, sessionData);
      return response.data;
    } catch (error) {
      logger.error(`Error recording study session for set ${id}:`, error);
      throw error;
    }
  },
  
  // Get public flashcard sets
  getPublicFlashcardSets: async (params = {}) => {
    try {
      const response = await api.get('/flashcards/public', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching public flashcard sets:', error);
      throw error;
    }
  },
  
  // Get shared flashcard set
  getSharedFlashcardSet: async (id) => {
    try {
      const response = await api.get(`/flashcards/${id}/shared`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching shared flashcard set ${id}:`, error);
      throw error;
    }
  },
  
  // Update the progress for a flashcard set
  updateProgress: async (id, progress) => {
    try {
      const response = await api.post(`/flashcards/${id}/progress`, { progress });
      return response.data;
    } catch (error) {
      logger.error(`Error updating progress for flashcard set ${id}:`, error);
      throw error;
    }
  },
  
  // Update study progress (current index, learned cards, review cards)
  updateStudyProgress: async (id, progressData) => {
    try {
      // Format the progress data for the API
      const progress = {
        currentCardIndex: progressData.currentCardIndex,
        learnedCards: progressData.learnedCards || {},
        reviewLaterCards: progressData.reviewLaterCards || {}
      };
      
      const response = await api.post(`/flashcards/${id}/progress`, { progress });
      return response.data;
    } catch (error) {
      logger.error(`Error updating study progress for flashcard set ${id}:`, error);
      throw error;
    }
  },
  
  // Search flashcard sets by query
  searchFlashcards: async (query) => {
    try {
      const response = await api.get(`/flashcards/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      logger.error(`Error searching flashcards: ${error.message}`);
      throw error;
    }
  },
  
  // Create and share a flashcard set
  shareFlashcardSet: async (id, shareOptions) => {
    try {
      const response = await api.post(`/flashcards/${id}/share`, shareOptions);
      return response.data;
    } catch (error) {
      logger.error(`Error sharing flashcard set ${id}:`, error);
      throw error;
    }
  },
  
  // Get all shared flashcard sets
  getSharedFlashcardSets: async () => {
    try {
      const response = await api.get('/flashcards/shared');
      return response.data;
    } catch (error) {
      logger.error('Error fetching shared flashcard sets:', error);
      throw error;
    }
  }
};

// Quiz Services
export const quizService = {
  // Get all quizzes for the current user
  getAllQuizzes: async () => {
    try {
      const response = await api.get('/quizzes');
      return response.data;
    } catch (error) {
      logger.error('Error fetching quizzes:', error);
      throw error;
    }
  },
  
  // Get a specific quiz by ID
  getQuiz: async (id) => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching quiz ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new quiz
  createQuiz: async (quiz) => {
    try {
      const response = await api.post('/quizzes', quiz);
      return response.data;
    } catch (error) {
      logger.error('Error creating quiz:', error);
      throw error;
    }
  },
  
  // Update an existing quiz
  updateQuiz: async (id, quiz) => {
    try {
      const response = await api.put(`/quizzes/${id}`, quiz);
      return response.data;
    } catch (error) {
      logger.error(`Error updating quiz ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a quiz
  deleteQuiz: async (id) => {
    try {
      const response = await api.delete(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Error deleting quiz ${id}:`, error);
      throw error;
    }
  },
  
  // Get public quizzes
  getPublicQuizzes: async (params = {}) => {
    try {
      const response = await api.get('/quizzes/public', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching public quizzes:', error);
      throw error;
    }
  }
};

export default api;
