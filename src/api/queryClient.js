import { QueryClient } from '@tanstack/react-query';

// Create a client with default settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Shorter stale time to avoid stale data issues during development
      staleTime: 1000 * 60 * 2, // 2 minutes
      // Retry failed queries 1 time
      retry: 1,
      // Don't refetch on window focus for better UX during development
      refetchOnWindowFocus: false,
      // Cache successful query results for 10 minutes
      cacheTime: 1000 * 60 * 10,
      // Handle errors gracefully
      useErrorBoundary: false,
      // Return the last successful result to avoid flashing loading states
      keepPreviousData: true,
      // No suspense to avoid issues with older React versions
      suspense: false,
      // Return empty array instead of undefined for better TypeScript compatibility
      placeholderData: (previousData) => previousData || [],
    },
    mutations: {
      // Retry failed mutations 1 time
      retry: 1,
      // No suspense for mutations
      useErrorBoundary: false,
    },
  },
});

export default queryClient; 