import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import logger from '../../utils/logger';
import { flashcardAdapter, cancelAllRequests } from '../adapters/flashcardAdapter';

// Query keys for caching
export const QUERY_KEYS = {
  FLASHCARDS: 'flashcards',
  FLASHCARD: (id) => ['flashcard', id],
  FAVORITES: 'favorites',
};

// Export cancelAllRequests for use in navigation handlers
export { cancelAllRequests };

// Hook to fetch all flashcard sets
export const useFlashcardSets = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FLASHCARDS],
    queryFn: flashcardAdapter.getAllFlashcardSets,
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
    queryFn: () => flashcardAdapter.getFlashcardSet(id),
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
    queryFn: flashcardAdapter.getFavorites,
    staleTime: 1000 * 60 * 2, // 2 minute stale time
    retry: 1,
  });
};

// Hook to create a new flashcard set
export const useCreateFlashcardSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: flashcardAdapter.createFlashcardSet,
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
    mutationFn: ({ id, flashcardSet }) => 
      flashcardAdapter.updateFlashcardSet(id, flashcardSet),
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
    mutationFn: ({ id, isFavorite }) => 
      flashcardAdapter.toggleFavorite(id, isFavorite),
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
    mutationFn: flashcardAdapter.deleteFlashcardSet,
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

// Hook to search flashcards
export const useSearchFlashcards = (query) => {
  return useQuery({
    queryKey: ['flashcards', 'search', query],
    queryFn: () => flashcardAdapter.searchFlashcards(query),
    enabled: !!query && query.length > 2, // Only search if query is at least 3 chars
    staleTime: 1000 * 60 * 5, // 5 minute stale time
  });
};

// Hook to generate flashcards using AI
export const useGenerateFlashcards = () => {
  return useMutation({
    mutationFn: flashcardAdapter.generateFlashcards,
  });
};

// Hook to update study progress
export const useUpdateStudyProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, progressData }) => 
      flashcardAdapter.updateStudyProgress(id, progressData),
    onSuccess: (data, variables) => {
      // Update the specific flashcard in the cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLASHCARD(variables.id) });
      // Also update the flashcards list since progress may be displayed there
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FLASHCARDS] });
    },
  });
};

// Hook to share a flashcard set
export const useShareFlashcardSet = () => {
  return useMutation({
    mutationFn: ({ id, shareOptions }) => 
      flashcardAdapter.shareFlashcardSet(id, shareOptions),
  });
}; 