import React, { useEffect, useState } from 'react';
import logger from '../utils/logger';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { auth0Config } from './auth0-config';

/**
 * Custom hook that wraps useAuth0 to provide authentication functionality
 */
export const useAuth = () => {
  const auth0 = useAuth0();
  
  return {
    isAuthenticated: auth0.isAuthenticated,
    user: auth0.user,
    loading: auth0.isLoading,
    login: auth0.loginWithRedirect,
    logout: auth0.logout,
    getAccessToken: auth0.getAccessTokenSilently,
    error: auth0.error
  };
};

/**
 * User synchronization component that ensures the user exists in our database
 */
const UserSync = ({ children }) => {
  const { isAuthenticated, getAccessTokenSilently, user, error } = useAuth0();
  const [syncStatus, setSyncStatus] = useState({ status: 'idle', error: null });
  
  // Log Auth0 errors
  useEffect(() => {
    if (error) {
      logger.error('Auth0 Error:', error);
    }
  }, [error]);
  
  useEffect(() => {
    // Create or sync user with our database when they authenticate
    const syncUserWithDatabase = async () => {
      if (isAuthenticated && user) {
        try {
          setSyncStatus({ status: 'syncing', error: null });
          logger.debug('🔄 Syncing user with database:', { value: user.sub });
          
          // Get the access token to make authenticated API requests
          const token = await getAccessTokenSilently();
          
          // Call our API to create/update the user
          const apiUrl = import.meta.env.VITE_API_URL || '/api';
          const response = await fetch(`${apiUrl}/users/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            logger.debug('✅ User synchronized with database:', { value: userData._id });
            setSyncStatus({ status: 'synced', error: null });
            
            // Check if user profile needs update
            if (userData.needsProfileUpdate) {
              logger.debug('⚠️ User profile needs update. Please complete your profile.');
              // Here you could redirect to a profile completion page if needed
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            logger.error('❌ Failed to sync user with database:', { value: response.status, errorData });
            setSyncStatus({ 
              status: 'error', 
              error: `API Error: ${response.status} ${errorData.error || 'Unknown error'}` 
            });
          }
        } catch (error) {
          logger.error('❌ Error syncing user with database:', error);
          setSyncStatus({ 
            status: 'error', 
            error: error.message || 'Unknown error syncing user' 
          });
        }
      }
    };
    
    syncUserWithDatabase();
  }, [isAuthenticated, user, getAccessTokenSilently]);
  
  // You could add a loading state or error state UI component here if needed
  return <>{children}</>;
};

/**
 * Auth0 provider component that wraps the application
 * and provides authentication functionality throughout the app
 */
const AuthProvider = ({ children }) => {
  const { domain, clientId, authorizationParams, useRefreshTokens, cacheLocation } = auth0Config;
  
  // Get current environment info
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseUrl = isDev ? 'http://localhost:5173' : window.location.origin;
  
  // Log Auth0 configuration for debugging
  logger.debug('🔐 Auth0Provider Configuration:');
  logger.debug('  Domain:', { value: domain });
  logger.debug('  Client ID:', { value: clientId.substring(0, 5) + '...' });
  logger.debug('  Redirect URI:', { value: authorizationParams.redirect_uri });
  logger.debug('  Base URL:', { value: baseUrl });
  logger.debug('  Auth Params:', { value: JSON.stringify(authorizationParams) });
  
  const onRedirectCallback = (appState) => {
    logger.debug('🔄 Auth0 redirect callback triggered', { value: appState });
    
    // Check if the user is newly registered (needs onboarding)
    // We'll determine this by seeing if they have just been created
    // in Auth0 and need to be redirected to onboarding
    const isNewUser = localStorage.getItem('isNewRegistration') === 'true';
    
    if (isNewUser) {
      logger.debug('🆕 New user detected, redirecting to onboarding');
      localStorage.removeItem('isNewRegistration');
      
      // After authentication, redirect to the onboarding page
      window.history.replaceState(
        {},
        document.title,
        '/onboarding'
      );
      
      // Navigate to the onboarding page - use the correct base URL
      window.location.href = `${baseUrl}/onboarding`;
      return;
    }
    
    // For existing users, redirect to the dashboard page
    const returnTo = appState?.returnTo || '/dashboard';
    
    // Update history state
    window.history.replaceState(
      {},
      document.title,
      returnTo
    );
    
    // Navigate to the dashboard page - use the correct base URL
    window.location.href = `${baseUrl}${returnTo}`;
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authorizationParams}
      useRefreshTokens={useRefreshTokens}
      cacheLocation={cacheLocation}
      onRedirectCallback={onRedirectCallback}
    >
      <UserSync>
        {children}
      </UserSync>
    </Auth0Provider>
  );
};

export default AuthProvider; 