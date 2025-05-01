import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { cancelAllRequests as cancelFlashcardRequests } from '../services/api';
import { cancelAllRequests as cancelQuizRequests } from '../services/quiz-service';

/**
 * Custom hook that returns a navigation function that cancels all pending
 * API requests before navigating to a new route.
 */
export function useNavigationWithCancellation() {
  const navigate = useNavigate();
  
  const navigateWithCancellation = useCallback(
    (to, options) => {
      // Cancel all pending API requests
      cancelFlashcardRequests();
      cancelQuizRequests();
      
      // Then navigate to new route
      navigate(to, options);
    },
    [navigate]
  );
  
  return navigateWithCancellation;
}

export default useNavigationWithCancellation; 