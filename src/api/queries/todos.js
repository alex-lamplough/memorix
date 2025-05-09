import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoAdapter, cancelAllRequests } from '../adapters/todoAdapter';
import logger from '../../utils/logger';
import apiClient from '../apiClient';

// Query keys for caching
export const QUERY_KEYS = {
  TODOS: 'todos',
  TODO: (id) => ['todo', id]
};

// Export cancelAllRequests for use in navigation handlers
export { cancelAllRequests };

// Hook to fetch all todos
export const useTodos = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TODOS],
    queryFn: todoAdapter.getAllTodos,
    staleTime: 1000 * 60, // 1 minute
  });
};

// Hook to fetch a specific todo by ID
export const useTodo = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.TODO(id),
    queryFn: () => todoAdapter.getTodo(id),
    enabled: !!id,
  });
};

// Hook to create a new todo
export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoAdapter.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TODOS] });
    },
  });
};

// Hook to update an existing todo
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, todo }) => todoAdapter.updateTodo(id, todo),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODO(variables.id) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TODOS] });
    },
  });
};

// Hook to delete a todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoAdapter.deleteTodo,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TODOS] });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.TODO(id) });
    },
  });
};

// Hook to toggle a todo's complete status
export const useToggleTodoComplete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isCompleted }) => 
      todoAdapter.toggleTodoComplete(id, isCompleted),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODO(variables.id) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TODOS] });
    },
  });
}; 