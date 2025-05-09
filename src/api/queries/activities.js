import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import logger from '../../utils/logger';
import { activityAdapter, cancelAllRequests } from '../adapters/activityAdapter';

// Query keys for caching
export const QUERY_KEYS = {
  ACTIVITIES: 'activities',
};

// Export cancelAllRequests for use in navigation handlers
export { cancelAllRequests };

/**
 * Hook to fetch user activities
 * 
 * @param {Object} params - Parameters for filtering activities
 * @param {string} params.type - Filter by activity type (flashcard, quiz, etc.)
 * @param {string} params.action - Filter by action type (create, study, complete, etc.)
 * @param {string} params.startDate - Start date for filtering
 * @param {string} params.endDate - End date for filtering
 * @param {number} params.limit - Maximum number of activities to return
 * @param {string} params.sort - Sort order (newest, oldest)
 * @returns {Object} - React Query result object
 */
export const useActivities = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ACTIVITIES, params],
    queryFn: () => activityAdapter.getUserActivities(params),
    staleTime: 1000 * 60 * 5, // 5 minute stale time
  });
};

/**
 * Hook to generate activities from flashcards and quizzes data
 * This is used as a fallback when the backend API doesn't have a dedicated activities endpoint
 * 
 * @param {Array} flashcardSets - Array of flashcard sets
 * @param {Array} quizzes - Array of quizzes
 * @param {Object} options - Options for generating activities
 * @returns {Array} - Generated activities
 */
export const useGeneratedActivities = (flashcardSets, quizzes, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ACTIVITIES, 'generated', options],
    queryFn: () => activityAdapter.generateActivitiesFromData(flashcardSets, quizzes, options),
    enabled: !!flashcardSets && !!quizzes,
    staleTime: 1000 * 60, // 1 minute stale time
  });
};

/**
 * Hook to log a new activity
 */
export const useLogActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: activityAdapter.logActivity,
    onSuccess: () => {
      // Invalidate activities queries to refetch the latest data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIVITIES] });
    },
  });
};

export default {
  useActivities,
  useGeneratedActivities,
  useLogActivity,
  cancelAllRequests,
}; 