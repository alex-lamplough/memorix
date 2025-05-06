import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../apiClient';

// Query keys for caching
export const QUERY_KEYS = {
  USER: 'user',
  USER_PROFILE: 'user-profile',
  USER_STATS: 'user-stats',
  USER_ONBOARDING: 'user-onboarding',
};

// Get current user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/users/me');
        return response.data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    },
  });
};

// Hook to update user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData) => {
      try {
        const response = await apiClient.patch('/users/me', userData);
        return response.data;
      } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate user profile query to refetch with updated data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
    },
  });
};

// Hook to update user preferences
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preferences) => {
      try {
        // Enhanced logging to debug the exact payload being sent
        console.log('🔍 Preferences update payload:', JSON.stringify(preferences, null, 2));
        console.log('🔄 Sending PATCH request to /users/me with preferences:', 
          Object.keys(preferences).map(key => `${key}: ${preferences[key]}`).join(', '));
        
        // Use PATCH instead of PUT for partial updates
        const response = await apiClient.patch('/users/me', { preferences });
        
        // Log response for debugging
        console.log('✅ Preferences update response:', JSON.stringify(response.data.preferences, null, 2));
        
        return response.data;
      } catch (error) {
        console.error('❌ Error updating user preferences:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Log invalidation
      console.log('🔄 Invalidating USER_PROFILE query after preferences update');
      
      // Invalidate user profile query to refetch with updated data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
      
      // Log the updated user data
      console.log('✅ Updated user data:', data ? JSON.stringify(data.preferences, null, 2) : 'No data returned');
    },
    // Log the actual payload being sent for debugging
    onMutate: (preferences) => {
      console.log('🚀 Starting preferences update mutation with:', JSON.stringify(preferences, null, 2));
    },
  });
};

// Get user statistics
export const useUserStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_STATS],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/users/me/stats');
        return response.data;
      } catch (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }
    },
  });
};

// Get user onboarding status
export const useUserOnboardingStatus = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_ONBOARDING],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/users/me/onboarding');
        return response.data;
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
        throw error;
      }
    },
  });
}; 