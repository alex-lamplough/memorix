import { useState, useEffect, useCallback } from 'react';
import logger from '../utils/logger';
import { useAuthContext } from '../auth/AuthContext';
import { useCurrentSubscription } from '../api/queries/subscriptions';
import { subscriptionAdapter } from '../api/adapters/subscriptionAdapter';

/**
 * Custom hook for managing subscription state and feature availability
 * @returns {Object} Subscription state and utility functions
 */
export function useSubscription() {
  const { isAuthenticated, getToken } = useAuthContext();
  const [error, setError] = useState(null);
  
  // Use React Query hook to fetch the subscription - the query is disabled when not authenticated
  const { 
    data: subscription, 
    isLoading, 
    refetch: fetchSubscription 
  } = useCurrentSubscription();
  
  // Check if a feature is available for current subscription
  const canUseFeature = useCallback(
    (feature) => {
      return subscriptionAdapter.isFeatureAvailable(subscription, feature);
    },
    [subscription]
  );

  // Check if user is on Pro plan
  const isProSubscriber = useCallback(() => {
    return subscription?.plan === 'pro' && subscription?.status === 'active';
  }, [subscription]);

  // Check if user needs to upgrade for a specific feature
  const needsUpgradeForFeature = useCallback(
    (feature) => {
      return !canUseFeature(feature);
    },
    [canUseFeature]
  );

  return {
    subscription,
    isLoading,
    error,
    fetchSubscription,
    canUseFeature,
    isProSubscriber,
    needsUpgradeForFeature,
  };
}

export default useSubscription; 