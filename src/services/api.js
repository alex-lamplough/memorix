import axios from 'axios';

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

// Add auth token to requests if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log the request for debugging
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    } catch (error) {
      console.error('Error getting auth token for request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to log all responses and handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`API Error: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        data: error.response.data
      });
      
      // Handle 401 Unauthorized errors (expired token)
      if (error.response.status === 401 && !isRedirectingToLogin) {
        console.warn('Unauthorized request - token may be expired');
        
        // If we're not already handling a token refresh
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            // Try to get a fresh token
            console.log('Attempting to refresh token...');
            const newToken = await getAccessToken();
            
            if (newToken) {
              console.log('Token refreshed successfully, retrying request');
              
              // Retry the original request with the new token
              const config = error.config;
              config.headers.Authorization = `Bearer ${newToken}`;
              
              isRefreshing = false;
              return axios(config);
            } else {
              console.error('Failed to refresh token, redirecting to login');
              handleAuthenticationFailure();
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            handleAuthenticationFailure();
          } finally {
            isRefreshing = false;
          }
        }
      }
    } else {
      console.error('API request failed:', error.message);
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
    console.log('Redirecting to login page due to auth error');
    window.location.href = '/';
    isRedirectingToLogin = false;
  }, 2000);
}

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
  console.log(`Cancelling ${cancelTokens.size} pending flashcard API requests`);
  
  cancelTokens.forEach((controller, endpoint) => {
    console.log(`Cancelling request to: ${endpoint}`);
    controller.abort('Navigation cancelled the request');
  });
  
  cancelTokens.clear();
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
        console.log('Request cancelled:', error.message);
      }
      throw error;
    }
  },
  
  // Get a specific flashcard set by ID
  getFlashcardSet: async (id) => {
    const { controller, signal, cleanup } = createCancellableRequest(`flashcards/${id}`);
    try {
      const response = await api.get(`/flashcards/${id}`, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      }
      throw error;
    }
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
        console.log('Request cancelled:', error.message);
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
        console.log('Request cancelled:', error.message);
      }
      throw error;
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
        console.log('Request cancelled:', error.message);
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
      console.error('Error generating flashcards:', error);
      throw error;
    }
  },
  
  // Record study session for a flashcard set
  recordStudySession: async (id, sessionData) => {
    try {
      const response = await api.post(`/flashcards/${id}/study`, sessionData);
      return response.data;
    } catch (error) {
      console.error(`Error recording study session for set ${id}:`, error);
      throw error;
    }
  },
  
  // Get public flashcard sets
  getPublicFlashcardSets: async (params = {}) => {
    try {
      const response = await api.get('/flashcards/public', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching public flashcard sets:', error);
      throw error;
    }
  },
  
  // Get shared flashcard set
  getSharedFlashcardSet: async (id) => {
    try {
      const response = await api.get(`/flashcards/${id}/shared`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching shared flashcard set ${id}:`, error);
      throw error;
    }
  },
  
  // Update the progress for a flashcard set
  updateProgress: async (id, progress) => {
    try {
      const response = await api.post(`/flashcards/${id}/progress`, { progress });
      return response.data;
    } catch (error) {
      console.error(`Error updating progress for flashcard set ${id}:`, error);
      throw error;
    }
  },
  
  // Mark a flashcard set as favorite/unfavorite
  toggleFavorite: async (id, isFavorite) => {
    try {
      const response = await api.post(`/flashcards/${id}/favorite`, { isFavorite });
      return response.data;
    } catch (error) {
      console.error(`Error toggling favorite status for flashcard set ${id}:`, error);
      throw error;
    }
  },
  
  // Get all favorite flashcard sets
  getFavorites: async () => {
    try {
      const response = await api.get('/flashcards/favorites');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorite flashcard sets:', error);
      throw error;
    }
  },
  
  // Search flashcard sets by query
  searchFlashcards: async (query) => {
    try {
      const response = await api.get(`/flashcards/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching flashcards: ${error.message}`);
      throw error;
    }
  },
  
  // Create and share a flashcard set
  shareFlashcardSet: async (id, shareOptions) => {
    try {
      const response = await api.post(`/flashcards/${id}/share`, shareOptions);
      return response.data;
    } catch (error) {
      console.error(`Error sharing flashcard set ${id}:`, error);
      throw error;
    }
  },
  
  // Get all shared flashcard sets
  getSharedFlashcardSets: async () => {
    try {
      const response = await api.get('/flashcards/shared');
      return response.data;
    } catch (error) {
      console.error('Error fetching shared flashcard sets:', error);
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
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },
  
  // Get a specific quiz by ID
  getQuiz: async (id) => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new quiz
  createQuiz: async (quiz) => {
    try {
      const response = await api.post('/quizzes', quiz);
      return response.data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },
  
  // Update an existing quiz
  updateQuiz: async (id, quiz) => {
    try {
      const response = await api.put(`/quizzes/${id}`, quiz);
      return response.data;
    } catch (error) {
      console.error(`Error updating quiz ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a quiz
  deleteQuiz: async (id) => {
    try {
      const response = await api.delete(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting quiz ${id}:`, error);
      throw error;
    }
  },
  
  // Get public quizzes
  getPublicQuizzes: async (params = {}) => {
    try {
      const response = await api.get('/quizzes/public', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching public quizzes:', error);
      throw error;
    }
  }
};

export default api; 