import api from './api';

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
      console.log(`Attempting to delete quiz with ID: ${id}`);
      const response = await api.delete(`/quizzes/${id}`);
      console.log(`Delete quiz response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting quiz ${id}:`, error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
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

export default quizService; 