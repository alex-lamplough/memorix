import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import logger from '../../utils/logger';
import { quizAdapter, cancelAllRequests } from '../adapters/quizAdapter';

// Query keys for caching
export const QUERY_KEYS = {
  QUIZZES: 'quizzes',
  QUIZ: (id) => ['quiz', id],
  FAVORITES: 'quiz-favorites',
};

// Export cancelAllRequests for use in navigation handlers
export { cancelAllRequests };

// Hook to fetch all quizzes
export const useQuizzes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.QUIZZES],
    queryFn: quizAdapter.getAllQuizzes,
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
    queryFn: () => quizAdapter.getQuiz(id),
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
    mutationFn: quizAdapter.createQuiz,
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
    mutationFn: ({ id, quiz }) => 
      quizAdapter.updateQuiz(id, quiz),
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
    mutationFn: quizAdapter.deleteQuiz,
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
    mutationFn: ({ id, isFavorite }) => 
      quizAdapter.toggleFavorite(id, isFavorite),
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
    queryFn: quizAdapter.getFavorites,
    staleTime: 1000 * 60 * 2, // 2 minute stale time
    retry: 1,
  });
};

/**
 * Hook to generate quiz questions using AI
 */
export const useGenerateQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (params) => quizAdapter.generateQuestions(params),
    {
      onError: (error) => {
        logger.error('Failed to generate questions:', error);
      }
    }
  );
};

// Hook to submit an answer to a quiz question
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, questionId, answer }) => 
      quizAdapter.submitAnswer(quizId, questionId, answer),
    onSuccess: (data, variables) => {
      // Optionally invalidate the quiz to get updated state
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ(variables.quizId) });
    }
  });
};

// Hook to complete a quiz
export const useCompleteQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, sessionData }) => 
      quizAdapter.completeQuiz(quizId, sessionData),
    onSuccess: (data, variables) => {
      // Update the specific quiz in the cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ(variables.quizId) });
      // Also update the quizzes list since progress may be displayed there
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZZES] });
    }
  });
}; 