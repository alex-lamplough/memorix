import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { cancelAllRequests as cancelFlashcardRequests } from '../api/queries/flashcards';
import { cancelAllRequests as cancelQuizRequests } from '../api/queries/quizzes';
import { cancelAllRequests as cancelTodoRequests } from '../api/queries/todos';
import { cancelAllRequests as cancelActivityRequests } from '../api/queries/activities';
import { cancelAllRequests as cancelSubscriptionRequests } from '../api/queries/subscriptions';

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
      cancelTodoRequests();
      cancelActivityRequests();
      cancelSubscriptionRequests();
      
      // Then navigate to new route
      navigate(to, options);
    },
    [navigate]
  );
  
  return navigateWithCancellation;
}

export default useNavigationWithCancellation; 