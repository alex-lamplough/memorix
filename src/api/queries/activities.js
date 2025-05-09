import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import logger from '../../utils/logger';
import { activityAdapter, cancelAllRequests } from '../adapters/activityAdapter';

// Query keys for caching
export const QUERY_KEYS = {
  ACTIVITIES: 'activities',
};

// Export cancelAllRequests for use in navigation handlers
export { cancelAllRequests };

// Keep track of API endpoint availability between renders
let activitiesEndpointExists = true;

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
 * @param {Object} options - Additional React Query options
 * @returns {Object} - React Query result object
 */
export const useActivities = (params = {}, options = {}) => {
  // If we already know the endpoint doesn't exist, return a disabled query
  if (!activitiesEndpointExists && !options.enabled) {
    return {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      status: 'success'
    };
  }

  return useQuery({
    queryKey: [QUERY_KEYS.ACTIVITIES, params],
    queryFn: async () => {
      try {
        const data = await activityAdapter.getUserActivities(params);
        // If we get here, the endpoint exists
        activitiesEndpointExists = true;
        return data;
      } catch (error) {
        // If we get a 404, the endpoint doesn't exist
        if (error.response && error.response.status === 404) {
          activitiesEndpointExists = false;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minute stale time
    ...options,
    // Only attempt to fetch if we think the endpoint exists or if it's explicitly enabled
    enabled: activitiesEndpointExists && (options.enabled !== false)
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