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

// Add auth token to requests if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token for request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flashcard Services
export const flashcardService = {
  // Get all flashcard sets for the current user
  getAllFlashcardSets: async () => {
    try {
      const response = await api.get('/flashcards');
      
      // Process the response to include cardCount
      const flashcardSets = response.data.map(set => ({
        ...set,
        // Add cardCount if not present (backend might not include it)
        cardCount: set.cardCount || (set.cards ? set.cards.length : 0)
      }));
      
      return flashcardSets;
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      throw error;
    }
  },
  
  // Get a specific flashcard set by ID
  getFlashcardSet: async (id) => {
    try {
      const response = await api.get(`/flashcards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching flashcard set ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new flashcard set
  createFlashcardSet: async (flashcardSet) => {
    try {
      const response = await api.post('/flashcards', flashcardSet);
      return response.data;
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      throw error;
    }
  },
  
  // Update an existing flashcard set
  updateFlashcardSet: async (id, flashcardSet) => {
    try {
      const response = await api.put(`/flashcards/${id}`, flashcardSet);
      return response.data;
    } catch (error) {
      console.error(`Error updating flashcard set ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a flashcard set
  deleteFlashcardSet: async (id) => {
    try {
      const response = await api.delete(`/flashcards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting flashcard set ${id}:`, error);
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
  }
};

export default api; 