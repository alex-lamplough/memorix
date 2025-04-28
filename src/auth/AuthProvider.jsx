import React, { useEffect } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { auth0Config } from './auth0-config';
import { getEnvVariable } from '../utils/env-utils';

/**
 * User synchronization component that ensures the user exists in our database
 */
const UserSync = ({ children }) => {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  
  useEffect(() => {
    // Create or sync user with our database when they authenticate
    const syncUserWithDatabase = async () => {
      if (isAuthenticated && user) {
        try {
          // Get the access token to make authenticated API requests
          const token = await getAccessTokenSilently();
          
          // Call our API to create/update the user
          const apiUrl = getEnvVariable('API_URL', 'http://localhost:3000/api');
          const response = await fetch(`${apiUrl}/users/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log('User synchronized with database');
          } else {
            console.error('Failed to sync user with database');
          }
        } catch (error) {
          console.error('Error syncing user with database:', error);
        }
      }
    };
    
    syncUserWithDatabase();
  }, [isAuthenticated, user, getAccessTokenSilently]);
  
  return <>{children}</>;
};

/**
 * Auth0 provider component that wraps the application
 * and provides authentication functionality throughout the app
 */
const AuthProvider = ({ children }) => {
  const { domain, clientId, redirectUri, audience, useRefreshTokens, cacheLocation } = auth0Config;
  
  const onRedirectCallback = (appState) => {
    // Handle redirect after authentication
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || window.location.pathname
    );
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
      }}
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