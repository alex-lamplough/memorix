import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setAuthTokenGetter } from '../services/api';

/**
 * This component initializes the auth token getter for the API service.
 * It doesn't render anything visible, just hooks up the Auth0 token to the API.
 */
const AuthTokenProvider = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated, logout } = useAuth0();
  const [tokenErrorCount, setTokenErrorCount] = useState(0);
  
  useEffect(() => {
    // Set up the token getter function that the API service will use
    setAuthTokenGetter(async () => {
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
          console.error('Session expired or login required:', error.error);
          
          // If we've had multiple failures, attempt logout
          if (tokenErrorCount > 2) {
            console.warn('Multiple token failures detected, logging out');
            setTimeout(() => {
              logout({ returnTo: window.location.origin });
            }, 500);
          }
        } else {
          console.error('Error in AuthTokenProvider getting token:', error);
        }
        return null;
      }
    });
    
    // Log that the token provider is initialized
    console.log('🔐 Auth token provider initialized');
    
    // Set up periodic token checks to keep session fresh
    const checkInterval = setInterval(() => {
      if (isAuthenticated) {
        console.log('Performing periodic token check');
        getAccessTokenSilently()
          .then(() => console.log('Token check successful'))
          .catch(error => {
            console.warn('Token check failed:', error);
            // Reset UI state if token is expired
            if (error.error === 'login_required') {
              console.error('Session expired during token check');
              
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
  }, [getAccessTokenSilently, isAuthenticated, logout, tokenErrorCount]);
  
  // This component doesn't render anything, just passes children through
  return <>{children}</>;
};

export default AuthTokenProvider; 