import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import logger from '../../utils/logger';
import { subscriptionAdapter, cancelAllRequests } from '../adapters/subscriptionAdapter';

// Query keys for caching
export const QUERY_KEYS = {
  CURRENT_SUBSCRIPTION: 'current-subscription',
  SUBSCRIPTION_DETAILS: 'subscription-details'
};

// Export cancelAllRequests for use in navigation handlers
export { cancelAllRequests };

/**
 * Hook to fetch the current user's subscription
 * @returns {Object} The React Query result with subscription data
 */
export const useCurrentSubscription = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  
  return useQuery({
    queryKey: [QUERY_KEYS.CURRENT_SUBSCRIPTION],
    queryFn: subscriptionAdapter.getCurrentSubscription,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    // Only run query if user is authenticated
    enabled: isAuthenticated && !authLoading,
    onError: (error) => {
      logger.error('Error fetching subscription:', error);
    }
  });
};

/**
 * Hook to fetch detailed subscription information
 * @returns {Object} The React Query result with detailed subscription data
 */
export const useSubscriptionDetails = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  
  return useQuery({
    queryKey: [QUERY_KEYS.SUBSCRIPTION_DETAILS],
    queryFn: subscriptionAdapter.getSubscriptionDetails,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    // Only run query if user is authenticated
    enabled: isAuthenticated && !authLoading,
    onError: (error) => {
      logger.error('Error fetching subscription details:', error);
    }
  });
};

/**
 * Hook to create a checkout session
 * @returns {Object} The React Query mutation
 */
export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: (params) => subscriptionAdapter.createCheckoutSession(params),
    onError: (error) => {
      logger.error('Error creating checkout session:', error);
    }
  });
};

/**
 * Hook to create a portal session
 * @returns {Object} The React Query mutation
 */
export const useCreatePortalSession = () => {
  return useMutation({
    mutationFn: subscriptionAdapter.createPortalSession,
    onError: (error) => {
      logger.error('Error creating portal session:', error);
    }
  });
};

/**
 * Hook to cancel a subscription
 * @returns {Object} The React Query mutation
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subscriptionAdapter.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_SUBSCRIPTION] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBSCRIPTION_DETAILS] });
    },
    onError: (error) => {
      logger.error('Error canceling subscription:', error);
    }
  });
};

/**
 * Hook to reactivate a subscription
 * @returns {Object} The React Query mutation
 */
export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subscriptionAdapter.reactivateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_SUBSCRIPTION] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBSCRIPTION_DETAILS] });
    },
    onError: (error) => {
      logger.error('Error reactivating subscription:', error);
    }
  });
};

/**
 * Hook to validate a coupon code
 * @returns {Object} The React Query mutation
 */
export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: (couponCode) => subscriptionAdapter.validateCoupon(couponCode),
    onError: (error) => {
      logger.error('Error validating coupon:', error);
    }
  });
};

/**
 * Hook to check if a feature is available
 * @param {string} feature - The feature to check
 * @returns {boolean} Whether the feature is available
 */
export const useFeatureAvailability = (feature) => {
  const { data: subscription } = useCurrentSubscription();
  
  return {
    isAvailable: subscription ? subscriptionAdapter.isFeatureAvailable(subscription, feature) : false,
    subscription
  };
}; 