import React, { useEffect, useState } from 'react';
import logger from '../utils/logger';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import apiClient from '../api/apiClient';

// Query to check onboarding status
const fetchOnboardingStatus = async () => {
  try {
    logger.debug('Fetching onboarding status from API');
    const response = await apiClient.get('/users/me/onboarding');
    logger.debug('Onboarding status response:', { value: response.data });
    return response.data;
  } catch (error) {
    // Check if error is due to backend enforcing onboarding completion
    if (error.response && error.response.status === 403 && error.response.data.requiresOnboarding) {
      logger.error('Backend enforced onboarding required:', { value: error.response.data });
      return { 
        completed: false, 
        requiresOnboarding: true, 
        stage: 'enforced',
        message: error.response.data.message || 'Onboarding required'
      };
    }
    
    logger.error('Error fetching onboarding status:', error);
    // Default to requiring onboarding if there's an error
    return { 
      completed: false, 
      requiresOnboarding: true,
      stage: 'error',
      message: 'Error checking onboarding status' 
    };
  }
};

/**
 * OnboardingGuard is a route guard that checks if the user has completed
 * the onboarding process. If not, it redirects to the onboarding page.
 */
const OnboardingGuard = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);
  const queryClient = useQueryClient();

  // Setup event listener to catch API 403 errors from backend enforcing onboarding
  useEffect(() => {
    // Create event listener for API errors
    const handleAxiosError = (event) => {
      const error = event.detail;
      // Check if this is an onboarding enforcement error
      if (error.response && 
          error.response.status === 403 && 
          error.response.data && 
          error.response.data.requiresOnboarding) {
        
        logger.debug('💫 Intercepted API error enforcing onboarding');
        
        // Invalidate the onboarding status cache to force a recheck
        queryClient.invalidateQueries({ queryKey: ['onboardingStatus'] });
        
        // Redirect to onboarding page
        window.location.href = '/onboarding';
      }
    };
    
    // Register the event listener
    window.addEventListener('axios-error', handleAxiosError);
    
    // Cleanup
    return () => {
      window.removeEventListener('axios-error', handleAxiosError);
    };
  }, [queryClient]);

  // Define paths that should skip the onboarding check
  const skipOnboarding = ['/onboarding', '/login', '/logout', '/'].some(
    path => location.pathname.startsWith(path)
  );

  // Fetch onboarding status
  const { 
    data: onboardingStatus, 
    isLoading: statusLoading,
    isError: statusError,
    refetch
  } = useQuery({
    queryKey: ['onboardingStatus'],
    queryFn: fetchOnboardingStatus,
    enabled: isAuthenticated && !loading && !skipOnboarding,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Force refetch onboarding status when navigating to a new page
  useEffect(() => {
    if (isAuthenticated && !loading && !skipOnboarding) {
      logger.debug('Navigation detected, invalidating onboarding status cache');
      // Invalidate the cache to force a refetch
      queryClient.invalidateQueries({ queryKey: ['onboardingStatus'] });
    }
  }, [location.pathname, isAuthenticated, loading, skipOnboarding, queryClient]);

  useEffect(() => {
    // Mark as checked once we have loaded auth and onboarding status
    if (!loading && (!isAuthenticated || statusLoading === false)) {
      setHasChecked(true);
    }
    
    // Log onboarding status for debugging
    if (onboardingStatus) {
      logger.debug('Current onboarding status:', { value: onboardingStatus });
      
      // If backend enforced onboarding, redirect immediately
      if (onboardingStatus.stage === 'enforced') {
        logger.debug('Backend enforced onboarding, redirecting immediately');
        window.location.href = '/onboarding';
      }
    }
  }, [loading, isAuthenticated, statusLoading, onboardingStatus]);

  // Don't guard these paths
  if (skipOnboarding) {
    return children;
  }

  // Show loading while checking auth and onboarding status
  if (!hasChecked || loading || (isAuthenticated && statusLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f]">
        <div className="w-16 h-16 border-4 border-t-[#00ff94] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white">Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    logger.debug('User not authenticated, redirecting to login');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Handle error fetching onboarding status
  if (statusError) {
    logger.error('Error checking onboarding status, redirecting to onboarding for safety');
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // If onboarding is required or status check failed, redirect to onboarding
  if (onboardingStatus?.requiresOnboarding || !onboardingStatus) {
    logger.debug('Onboarding required, redirecting to onboarding page');
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // User is authenticated and has completed onboarding, render children
  logger.debug('Onboarding complete, allowing access to protected route');
  return children;
};

export default OnboardingGuard; 