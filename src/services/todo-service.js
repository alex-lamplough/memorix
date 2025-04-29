import api from './api';

export const todoService = {
  // Get all todos for the current user
  getAllTodos: async (filters = {}) => {
    try {
      // Convert filters object to query params
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      console.log('Todo service - fetching with query:', query);
      const response = await api.get(`/todos${query}`);
      console.log('Todo service - response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  },
  
  // Get a specific todo by ID
  getTodoById: async (id) => {
    try {
      const response = await api.get(`/todos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching todo ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new todo
  createTodo: async (todoData) => {
    try {
      const response = await api.post('/todos', todoData);
      return response.data;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },
  
  // Update an existing todo
  updateTodo: async (id, todoData) => {
    try {
      const response = await api.put(`/todos/${id}`, todoData);
      return response.data;
    } catch (error) {
      console.error(`Error updating todo ${id}:`, error);
      throw error;
    }
  },
  
  // Toggle todo completion status
  toggleTodoCompletion: async (id) => {
    try {
      const response = await api.patch(`/todos/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling todo ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a todo
  deleteTodo: async (id) => {
    try {
      const response = await api.delete(`/todos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting todo ${id}:`, error);
      throw error;
    }
  },
  
  // Delete all completed todos
  deleteCompletedTodos: async () => {
    try {
      const response = await api.delete('/todos/completed');
      return response.data;
    } catch (error) {
      console.error('Error deleting completed todos:', error);
      throw error;
    }
  },
  
  // Get todo statistics
  getTodoStats: async () => {
    try {
      const response = await api.get('/todos/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching todo stats:', error);
      throw error;
    }
  }
};

export default todoService; 