import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import logger from '../../utils/logger';
import apiClient from '../apiClient';

// Query keys for caching
export const QUERY_KEYS = {
  TODOS: 'todos',
  TODO: (id) => ['todo', id],
};

// Hook to fetch all todos
export const useTodos = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TODOS],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/todos');
        return response.data;
      } catch (error) {
        logger.error('Error fetching todos:', error);
        // Return empty array to avoid UI issues
        return [];
      }
    },
    retry: 1,
    staleTime: 1000 * 60, // 1 minute stale time
    refetchOnWindowFocus: false,
  });
};

// Hook to create a new todo
export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (todo) => {
      try {
        const response = await apiClient.post('/todos', todo);
        return response.data;
      } catch (error) {
        logger.error('Error creating todo:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the todos list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TODOS] });
    },
  });
};

// Hook to update an existing todo
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, todo }) => {
      try {
        const response = await apiClient.put(`/todos/${id}`, todo);
        return response.data;
      } catch (error) {
        logger.error(`Error updating todo ${id}:`, error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODO(variables.id) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TODOS] });
    },
  });
};

// Hook to toggle completion status of a todo
export const useToggleTodoCompletion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isCompleted }) => {
      try {
        const response = await apiClient.patch(`/todos/${id}/complete`, { isCompleted });
        return response.data;
      } catch (error) {
        logger.error(`Error toggling todo completion for ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch todos list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TODOS] });
    },
    // Update the todo optimistically
    onMutate: async ({ id, isCompleted }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.TODOS] });
      
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData([QUERY_KEYS.TODOS]);
      
      // Optimistically update to the new value
      queryClient.setQueryData([QUERY_KEYS.TODOS], old => {
        return old.map(todo => {
          if (todo._id === id) {
            return {
              ...todo,
              isCompleted
            };
          }
          return todo;
        });
      });
      
      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData([QUERY_KEYS.TODOS], context.previousTodos);
    }
  });
};

// Hook to delete a todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      try {
        const response = await apiClient.delete(`/todos/${id}`);
        return response.data;
      } catch (error) {
        logger.error(`Error deleting todo ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch todos list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TODOS] });
    },
    // Update the todos optimistically 
    onMutate: async (id) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.TODOS] });
      
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData([QUERY_KEYS.TODOS]);
      
      // Optimistically remove the todo from the list
      queryClient.setQueryData([QUERY_KEYS.TODOS], old => {
        return old.filter(todo => todo._id !== id);
      });
      
      // Return a context with the previous value
      return { previousTodos };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, id, context) => {
      queryClient.setQueryData([QUERY_KEYS.TODOS], context.previousTodos);
    }
  });
}; 