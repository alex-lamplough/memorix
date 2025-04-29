import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setAuthTokenGetter } from '../services/api';

/**
 * This component initializes the auth token getter for the API service.
 * It doesn't render anything visible, just hooks up the Auth0 token to the API.
 */
const AuthTokenProvider = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  
  useEffect(() => {
    // Set up the token getter function that the API service will use
    setAuthTokenGetter(async () => {
      if (!isAuthenticated) return null;
      
      try {
        const token = await getAccessTokenSilently();
        return token;
      } catch (error) {
        console.error('Error in AuthTokenProvider getting token:', error);
        return null;
      }
    });
    
    // Log that the token provider is initialized
    console.log('🔐 Auth token provider initialized');
  }, [getAccessTokenSilently, isAuthenticated]);
  
  // This component doesn't render anything, just passes children through
  return <>{children}</>;
};

export default AuthTokenProvider; 