import React, { useEffect, useState, useCallback } from 'react';
import logger from '../utils/logger';
import { useAuth0 } from '@auth0/auth0-react';
import { setAuthTokenGetter, refreshAuthToken } from '../api/apiClient';

/**
 * This component initializes the auth token getter for the API service.
 * It doesn't render anything visible, just hooks up the Auth0 token to the API.
 */
const AuthTokenProvider = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated, logout } = useAuth0();
  const [tokenErrorCount, setTokenErrorCount] = useState(0);
  
  // Define token getter with useCallback to prevent infinite renders
  const tokenGetter = useCallback(async () => {
    if (!isAuthenticated) return null;
    
    try {
      // Try to get a fresh token
      const token = await getAccessTokenSilently({
        detailedResponse: true,
        timeoutInSeconds: 10
      });
      
      // If we succeeded in getting a token after errors, reset error count
      if (tokenErrorCount > 0) {
        setTokenErrorCount(0);
      }
      
      // Auth0 may return a different format based on options
      const accessToken = token.access_token || token;
      return accessToken;
    } catch (error) {
      // Increment error counter to track recurring issues
      setTokenErrorCount(prev => prev + 1);
      
      // Check error type to provide better logging
      if (error.error === 'login_required' || 
          error.error === 'consent_required' || 
          error.error === 'interaction_required') {
        logger.error('Session expired or login required:', { value: error.error });
        
        // If we've had multiple failures, attempt logout
        if (tokenErrorCount > 2) {
          logger.warn('Multiple token failures detected, logging out');
          setTimeout(() => {
            logout({ returnTo: window.location.origin });
          }, 500);
        }
      } else {
        logger.error('Error in AuthTokenProvider getting token:', error);
      }
      return null;
    }
  }, [getAccessTokenSilently, isAuthenticated, logout, tokenErrorCount]);
  
  // Set up the token getter function when component mounts or tokenGetter changes
  useEffect(() => {
    // Set up the token getter function for the API
    setAuthTokenGetter(tokenGetter);
    
    // Log that the token provider is initialized
    logger.debug('🔐 Auth token provider initialized');
    
    // Force refresh token immediately if authenticated
    if (isAuthenticated) {
      refreshAuthToken();
    }
  }, [tokenGetter, isAuthenticated]);
  
  // Set up periodic token checks to keep session fresh - separate effect to avoid dependency issues
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (isAuthenticated) {
        logger.debug('Performing periodic token check');
        refreshAuthToken()
          .then(() => logger.debug('Token check successful'))
          .catch(error => {
            logger.warn('Token check failed:', error);
            // Reset UI state if token is expired
            if (error?.error === 'login_required') {
              logger.error('Session expired during token check');
              
              // Show a warning to the user
              const message = document.createElement('div');
              message.style.position = 'fixed';
              message.style.top = '20px';
              message.style.left = '50%';
              message.style.transform = 'translateX(-50%)';
              message.style.backgroundColor = '#ff7262';
              message.style.color = 'white';
              message.style.padding = '12px 20px';
              message.style.borderRadius = '8px';
              message.style.zIndex = '9999';
              message.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              message.textContent = 'Your session has expired. Please log in again.';
              
              document.body.appendChild(message);
              
              // Redirect to login after a short delay
              setTimeout(() => {
                logout({ returnTo: window.location.origin });
              }, 2000);
            }
          });
      }
    }, 15 * 60 * 1000); // Check every 15 minutes
    
    return () => clearInterval(checkInterval);
  }, [isAuthenticated, logout]);
  
  // This component doesn't render anything, just passes children through
  return <>{children}</>;
};

export default AuthTokenProvider; 