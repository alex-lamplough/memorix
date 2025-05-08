import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import logger from '../../utils/logger';
import apiClient from '../apiClient';

// Query keys for caching
export const QUERY_KEYS = {
  FLASHCARDS: 'flashcards',
  FLASHCARD: (id) => ['flashcard', id],
  FAVORITES: 'favorites',
};

// Hook to fetch all flashcard sets
export const useFlashcardSets = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FLASHCARDS],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/flashcards');
        
        // Process the response to include cardCount
        const flashcardSets = response.data.map(set => ({
          ...set,
          // Add cardCount if not present (backend might not include it)
          cardCount: set.cardCount || (set.cards ? set.cards.length : 0)
        }));
        
        return flashcardSets;
      } catch (error) {
        logger.error('Error fetching flashcard sets:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 1000 * 60, // Shorter stale time of 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

// Hook to fetch a specific flashcard set by ID
export const useFlashcardSet = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.FLASHCARD(id),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/flashcards/${id}`);
        return response.data;
      } catch (error) {
        logger.error(`Error fetching flashcard set ${id}:`, error);
        throw error;
      }
    },
    // Don't fetch if no id is provided
    enabled: !!id,
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minute stale time
  });
};

// Hook to fetch favorite flashcard sets
export const useFavoriteFlashcardSets = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FAVORITES],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/flashcards/favorites');
        
        // Process the response to include cardCount
        const flashcardSets = response.data.map(set => ({
          ...set,
          cardCount: set.cardCount || (set.cards ? set.cards.length : 0)
        }));
        
        return flashcardSets;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          logger.debug('Favorites endpoint not found, trying alternative path...');
          try {
            // Some backends might expect /api/flashcards/favorites format
            const altResponse = await apiClient.get('/api/flashcards/favorites');
            
            // Process the response to include cardCount
            const flashcardSets = altResponse.data.map(set => ({
              ...set,
              cardCount: set.cardCount || (set.cards ? set.cards.length : 0)
            }));
            
            return flashcardSets;
          } catch (altError) {
            logger.error('Error fetching from alternative path:', altError);
            return [];
          }
        }
        
        logger.error('Error fetching favorites:', error);
        // Return empty array for better UI experience
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minute stale time
    retry: 1,
  });
};

// Hook to create a new flashcard set
export const useCreateFlashcardSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (flashcardSet) => {
      try {
        const response = await apiClient.post('/flashcards', flashcardSet);
        return response.data;
      } catch (error) {
        logger.error('Error creating flashcard set:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the flashcards list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FLASHCARDS] });
    },
    retry: 1,
  });
};

// Hook to update an existing flashcard set
export const useUpdateFlashcardSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, flashcardSet }) => {
      try {
        const response = await apiClient.put(`/flashcards/${id}`, flashcardSet);
        return response.data;
      } catch (error) {
        logger.error(`Error updating flashcard set ${id}:`, error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLASHCARD(variables.id) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FLASHCARDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITES] });
    },
    retry: 1,
  });
};

// Hook to toggle favorite status of a flashcard set
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isFavorite }) => {
      try {
        const response = await apiClient.patch(`/flashcards/${id}/favorite`, { isFavorite });
        return response.data;
      } catch (error) {
        logger.error(`Error toggling favorite status for ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FLASHCARDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITES] });
    },
    retry: 1,
  });
};

// Hook to delete a flashcard set
export const useDeleteFlashcardSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      try {
        const response = await apiClient.delete(`/flashcards/${id}`);
        return response.data;
      } catch (error) {
        logger.error(`Error deleting flashcard set ${id}:`, error);
        throw error;
      }
    },
    onSuccess: (data, id) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FLASHCARDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITES] });
      // Remove the specific flashcard from the cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.FLASHCARD(id) });
    },
    retry: 1,
  });
}; 