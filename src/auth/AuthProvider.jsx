import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { auth0Config } from './auth0-config';

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
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider; 