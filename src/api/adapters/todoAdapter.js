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
    logger.info(`Cancelling ${requestMap.size} pending todo API requests`);
    
    requestMap.forEach((controller, endpoint) => {
      logger.debug(`Cancelling request to: ${endpoint}`);
      controller.abort('Navigation cancelled the request');
    });
    
    requestMap.clear();
  }
};

// Adapter functions that will be used by React Query hooks
export const todoAdapter = {
  cancelAllRequests,
  
  getAllTodos: async () => {
    const { signal, cleanup } = createCancellableRequest('todos');
    try {
      const response = await apiClient.get('/todos', { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  getTodo: async (id) => {
    const { signal, cleanup } = createCancellableRequest(`todos/${id}`);
    try {
      const response = await apiClient.get(`/todos/${id}`, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  createTodo: async (todo) => {
    const { signal, cleanup } = createCancellableRequest('todos-create');
    try {
      const response = await apiClient.post('/todos', todo, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  updateTodo: async (id, todo) => {
    const { signal, cleanup } = createCancellableRequest(`todos-update-${id}`);
    try {
      const response = await apiClient.put(`/todos/${id}`, todo, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  deleteTodo: async (id) => {
    const { signal, cleanup } = createCancellableRequest(`todos-delete-${id}`);
    try {
      const response = await apiClient.delete(`/todos/${id}`, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  
  toggleTodoComplete: async (id, isCompleted) => {
    const { signal, cleanup } = createCancellableRequest(`todos-toggle-${id}`);
    try {
      const response = await apiClient.patch(`/todos/${id}/complete`, { 
        isCompleted 
      }, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  }
}; 