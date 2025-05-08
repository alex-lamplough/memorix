import api from './api';
import logger from '../utils/logger';

// Track active todos API requests
let activeRequests = [];

// Cancel all pending requests
const cancelAllRequests = () => {
  const count = activeRequests.length;
  logger.debug(`Cancelling ${count} pending todo API requests`);
  
  activeRequests.forEach(controller => {
    controller.abort();
    logger.debug('Cancelling request to: todos');
  });
  
  // Clear the array
  activeRequests = [];
};

export const todoService = {
  // Add cancelAllRequests to the service
  cancelAllRequests,
  
  // Get all todos for the current user
  getAllTodos: async (filters = {}) => {
    try {
      // Create an AbortController to handle request cancellation
      const controller = new AbortController();
      activeRequests.push(controller);
      
      // Convert filters object to query params
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      logger.debug('Todo service - fetching with query:', { value: query });
      
      const response = await api.get(`/todos${query}`, {
        signal: controller.signal
      });
      
      // Remove this controller from active requests
      activeRequests = activeRequests.filter(req => req !== controller);
      
      logger.debug('Todo service - response data:', { value: response.data });
      return response.data;
    } catch (error) {
      // Don't log cancellation errors as they're expected
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        logger.error('Error fetching todos:', error);
      }
      throw error;
    }
  },
  
  // Get a specific todo by ID
  getTodoById: async (id) => {
    try {
      const response = await api.get(`/todos/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching todo ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new todo
  createTodo: async (todoData) => {
    try {
      const response = await api.post('/todos', todoData);
      return response.data;
    } catch (error) {
      logger.error('Error creating todo:', error);
      throw error;
    }
  },
  
  // Update an existing todo
  updateTodo: async (id, todoData) => {
    try {
      const response = await api.put(`/todos/${id}`, todoData);
      return response.data;
    } catch (error) {
      logger.error(`Error updating todo ${id}:`, error);
      throw error;
    }
  },
  
  // Toggle todo completion status
  toggleTodoCompletion: async (id) => {
    try {
      const response = await api.patch(`/todos/${id}/toggle`);
      return response.data;
    } catch (error) {
      logger.error(`Error toggling todo ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a todo
  deleteTodo: async (id) => {
    try {
      const response = await api.delete(`/todos/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Error deleting todo ${id}:`, error);
      throw error;
    }
  },
  
  // Delete all completed todos
  deleteCompletedTodos: async () => {
    try {
      const response = await api.delete('/todos/completed');
      return response.data;
    } catch (error) {
      logger.error('Error deleting completed todos:', error);
      throw error;
    }
  },
  
  // Get todo statistics
  getTodoStats: async () => {
    try {
      const response = await api.get('/todos/stats');
      return response.data;
    } catch (error) {
      logger.error('Error fetching todo stats:', error);
      throw error;
    }
  }
};

export default todoService; 