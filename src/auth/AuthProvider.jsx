import React, { useEffect, useState } from 'react';
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
      console.error('Auth0 Error:', error);
    }
  }, [error]);
  
  useEffect(() => {
    // Create or sync user with our database when they authenticate
    const syncUserWithDatabase = async () => {
      if (isAuthenticated && user) {
        try {
          setSyncStatus({ status: 'syncing', error: null });
          console.log('🔄 Syncing user with database:', user.sub);
          
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
            console.log('✅ User synchronized with database:', userData._id);
            setSyncStatus({ status: 'synced', error: null });
            
            // Check if user profile needs update
            if (userData.needsProfileUpdate) {
              console.log('⚠️ User profile needs update. Please complete your profile.');
              // Here you could redirect to a profile completion page if needed
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Failed to sync user with database:', response.status, errorData);
            setSyncStatus({ 
              status: 'error', 
              error: `API Error: ${response.status} ${errorData.error || 'Unknown error'}` 
            });
          }
        } catch (error) {
          console.error('❌ Error syncing user with database:', error);
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
  
  // Log Auth0 configuration for debugging
  console.log('🔐 Auth0Provider Configuration:');
  console.log('  Domain:', domain);
  console.log('  Client ID:', clientId.substring(0, 5) + '...');
  console.log('  Redirect URI:', window.location.origin);
  console.log('  Auth Params:', JSON.stringify(authorizationParams));
  
  const onRedirectCallback = (appState) => {
    console.log('🔄 Auth0 redirect callback triggered', appState);
    // After authentication, redirect to the dashboard page
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || '/dashboard'
    );
    
    // Navigate to the dashboard page
    window.location.pathname = '/dashboard';
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