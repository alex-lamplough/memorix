import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import logger from '../../utils/logger';
import apiClient from '../apiClient';

// Query keys for caching
export const QUERY_KEYS = {
  QUIZZES: 'quizzes',
  QUIZ: (id) => ['quiz', id],
  FAVORITES: 'quiz-favorites',
};

// Hook to fetch all quizzes
export const useQuizzes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.QUIZZES],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/quizzes');
        
        // Process the response to ensure necessary fields
        const quizzes = response.data.map(quiz => ({
          ...quiz,
          questionCount: quiz.questionCount || quiz.totalQuestions || 0
        }));
        
        return quizzes;
      } catch (error) {
        logger.error('Error fetching quizzes:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 1000 * 60, // Stale time of 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

// Hook to fetch a specific quiz by ID
export const useQuiz = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.QUIZ(id),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/quizzes/${id}`);
        return response.data;
      } catch (error) {
        logger.error(`Error fetching quiz ${id}:`, error);
        throw error;
      }
    },
    // Don't fetch if no id is provided
    enabled: !!id,
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minute stale time
  });
};

// Hook to create a new quiz
export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quiz) => {
      try {
        const response = await apiClient.post('/quizzes', quiz);
        return response.data;
      } catch (error) {
        logger.error('Error creating quiz:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the quizzes list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZZES] });
    },
    retry: 1,
  });
};

// Hook to update an existing quiz
export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, quiz }) => {
      try {
        const response = await apiClient.put(`/quizzes/${id}`, quiz);
        return response.data;
      } catch (error) {
        logger.error(`Error updating quiz ${id}:`, error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ(variables.id) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZZES] });
    },
    retry: 1,
  });
};

// Hook to delete a quiz
export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      try {
        const response = await apiClient.delete(`/quizzes/${id}`);
        return response.data;
      } catch (error) {
        logger.error(`Error deleting quiz ${id}:`, error);
        throw error;
      }
    },
    onSuccess: (data, id) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZZES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITES] });
      // Remove the specific quiz from the cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.QUIZ(id) });
    },
    retry: 1,
  });
};

// Hook to toggle favorite status of a quiz
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isFavorite }) => {
      try {
        const response = await apiClient.patch(`/quizzes/${id}/favorite`, { isFavorite });
        return response.data;
      } catch (error) {
        logger.error(`Error toggling favorite status for quiz ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the quizzes list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZZES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITES] });
    },
    retry: 1,
  });
};

// Hook to fetch favorite quizzes
export const useFavoriteQuizzes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FAVORITES],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/quizzes/favorites');
        
        // Process the response to ensure necessary fields
        const quizzes = response.data.map(quiz => ({
          ...quiz,
          questionCount: quiz.questionCount || quiz.totalQuestions || 0
        }));
        
        return quizzes;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          logger.debug('Favorites endpoint not found, trying alternative path...');
          try {
            // Some backends might expect /api/quizzes/favorites format
            const altResponse = await apiClient.get('/api/quizzes/favorites');
            
            // Process the response
            const quizzes = altResponse.data.map(quiz => ({
              ...quiz,
              questionCount: quiz.questionCount || quiz.totalQuestions || 0
            }));
            
            return quizzes;
          } catch (altError) {
            logger.error('Error fetching from alternative path:', altError);
            return [];
          }
        }
        
        logger.error('Error fetching favorite quizzes:', error);
        // Return empty array for better UI experience
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minute stale time
    retry: 1,
  });
}; 