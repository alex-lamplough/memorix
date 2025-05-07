import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import subscriptionService from '../services/subscription-service';

/**
 * Custom hook for managing subscription state and feature availability
 * @returns {Object} Subscription state and utility functions
 */
export function useSubscription() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current subscription status
  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription({ plan: 'free', status: 'active' });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get token and store it for API calls
      const token = await getAccessTokenSilently();
      localStorage.setItem('auth_token', token);

      const data = await subscriptionService.getCurrentSubscription();
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription information');
      // Default to free plan on error
      setSubscription({ plan: 'free', status: 'active' });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // Load subscription on mount and when auth state changes
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Check if a feature is available for current subscription
  const canUseFeature = useCallback(
    (feature) => {
      return subscriptionService.isFeatureAvailable(subscription, feature);
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