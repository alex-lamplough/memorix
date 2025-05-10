import apiClient from '../apiClient';
import logger from '../../utils/logger';

// Create a map to track in-flight requests (for cancellation)
const requestMap = new Map();

// Helper to create a cancellable request
const createCancellableRequest = (endpoint) => {
  // Cancel any existing request for this endpoint
  if (requestMap.has(endpoint)) {
    try {
      requestMap.get(endpoint).abort();
      logger.debug(`Cancelled existing request to: ${endpoint}`);
    } catch (error) {
      logger.error(`Error cancelling request to ${endpoint}:`, error);
    }
  }
  
  // Small delay to prevent race conditions
  const delay = () => new Promise(resolve => setTimeout(resolve, 50));
  
  // Create a new controller
  const controller = new AbortController();
  requestMap.set(endpoint, controller);
  
  return {
    signal: controller.signal,
    cleanup: async () => {
      await delay();
      requestMap.delete(endpoint);
    }
  };
};

// Cancel all requests
export const cancelAllRequests = () => {
  if (requestMap.size > 0) {
    logger.info(`Cancelling ${requestMap.size} pending flashcard API requests`);
    
    requestMap.forEach((controller, endpoint) => {
      logger.debug(`Cancelling request to: ${endpoint}`);
      controller.abort('Navigation cancelled the request');
    });
    
    requestMap.clear();
  }
};

// Adapter functions that will be used by React Query hooks
export const flashcardAdapter = {
  cancelAllRequests,
  
  getAllFlashcardSets: async () => {
    const { signal, cleanup } = createCancellableRequest('flashcards');
    try {
      const response = await apiClient.get('/flashcards', { signal });
      cleanup();
      
      // Process the response to include cardCount
      const flashcardSets = response.data.map(set => ({
        ...set,
        // Add cardCount if not present (backend might not include it)
        cardCount: set.cardCount || (set.cards ? set.cards.length : 0),
        // Add study statistics
        correctPercentage: set.studyStats?.masteryLevel || 0,
        studySessions: set.studyStats?.totalStudySessions || 0,
        lastStudied: set.studyStats?.lastStudied || set.lastStudied || null,
        // Add progress based on learned cards
        progress: set.studyStats?.masteryLevel || 0
      }));
      
      return flashcardSets;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  getFlashcardSet: async (id) => {
    const { signal, cleanup } = createCancellableRequest(`flashcards/${id}`);
    try {
      const response = await apiClient.get(`/flashcards/${id}`, { signal });
      cleanup();
      
      // Add study statistics if not present
      const data = response.data;
      if (data && data.studyStats) {
        data.correctPercentage = data.studyStats.correctPercentage || 
                               (data.studyStats.masteryLevel ? Math.round(data.studyStats.masteryLevel) : 0);
        data.studySessions = data.studyStats.totalStudySessions || 0;
      }
      
      return data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  getFavorites: async () => {
    const { signal, cleanup } = createCancellableRequest('flashcards-favorites');
    try {
      let response;
      
      try {
        // First try the standard path
        response = await apiClient.get('/flashcards/favorites', { signal });
      } catch (initialError) {
        // If we get a 404, try with an alternative path format
        if (initialError.response && initialError.response.status === 404) {
          logger.info('First attempt failed with 404, trying alternative path...');
          // Some backends might expect /api/flashcards/favorites format
          response = await apiClient.get('/api/flashcards/favorites', { signal });
        } else {
          // If it wasn't a 404, rethrow the original error
          throw initialError;
        }
      }
      
      cleanup();
      
      // Process the response to include cardCount
      const flashcardSets = response.data.map(set => ({
        ...set,
        cardCount: set.cardCount || (set.cards ? set.cards.length : 0),
        // Add study statistics
        correctPercentage: set.studyStats?.correctPercentage || 
                         (set.studyStats?.masteryLevel ? Math.round(set.studyStats.masteryLevel) : 0),
        studySessions: set.studyStats?.totalStudySessions || 0
      }));
      
      return flashcardSets;
    } catch (error) {
      cleanup();
      // When all else fails, return an empty array rather than throwing
      logger.info('Returning empty array for flashcard favorites due to error');
      return [];
    }
  },
  
  createFlashcardSet: async (flashcardSet) => {
    const { signal, cleanup } = createCancellableRequest('flashcards-create');
    try {
      const response = await apiClient.post('/flashcards', flashcardSet, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  updateFlashcardSet: async (id, flashcardSet) => {
    const { signal, cleanup } = createCancellableRequest(`flashcards-update-${id}`);
    try {
      const response = await apiClient.put(`/flashcards/${id}`, flashcardSet, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  toggleFavorite: async (id, isFavorite) => {
    const { signal, cleanup } = createCancellableRequest(`flashcards-favorite-${id}`);
    try {
      const response = await apiClient.patch(`/flashcards/${id}/favorite`, { isFavorite }, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  deleteFlashcardSet: async (id) => {
    const { signal, cleanup } = createCancellableRequest(`flashcards-delete-${id}`);
    try {
      const response = await apiClient.delete(`/flashcards/${id}`, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  generateFlashcards: async (params) => {
    const { signal, cleanup } = createCancellableRequest('flashcards-generate');
    try {
      const response = await apiClient.post('/flashcards/generate', params, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  recordStudySession: async (id, sessionData) => {
    try {
      const response = await apiClient.post(`/flashcards/${id}/study`, sessionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getPublicFlashcardSets: async (params = {}) => {
    const { signal, cleanup } = createCancellableRequest('flashcards-public');
    try {
      const response = await apiClient.get('/flashcards/public', { params, signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  getSharedFlashcardSet: async (id) => {
    const { signal, cleanup } = createCancellableRequest(`flashcards-shared-${id}`);
    try {
      const response = await apiClient.get(`/flashcards/${id}/shared`, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  updateStudyProgress: async (id, progressData) => {
    try {
      // Format the progress data for the API
      const progress = {
        currentCardIndex: progressData.currentCardIndex,
        learnedCards: progressData.learnedCards || {},
        reviewLaterCards: progressData.reviewLaterCards || {},
        studyMode: progressData.studyMode
      };
      
      const response = await apiClient.post(`/flashcards/${id}/progress`, { progress });
      return response.data;
    } catch (error) {
      logger.error(`Error updating study progress for flashcard set ${id}:`, error);
      throw error;
    }
  },
  
  searchFlashcards: async (query) => {
    const { signal, cleanup } = createCancellableRequest(`flashcards-search-${query}`);
    try {
      const response = await apiClient.get(`/flashcards/search?q=${encodeURIComponent(query)}`, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  shareFlashcardSet: async (id, shareOptions) => {
    try {
      const response = await apiClient.post(`/flashcards/${id}/share`, shareOptions);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 