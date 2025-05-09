import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import logger from '../utils/logger';

// Create the auth context
const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  login: () => {},
  logout: () => {},
  getToken: () => Promise.resolve(null),
});

// Custom hook to use the auth context
export const useAuthContext = () => useContext(AuthContext);

// Auth context provider component
export const AuthContextProvider = ({ children }) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    error,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0();
  
  const [lastAuthState, setLastAuthState] = useState({
    isAuthenticated: false,
    isLoading: true
  });
  
  // Track auth state changes
  useEffect(() => {
    // Only log meaningful changes
    if (lastAuthState.isAuthenticated !== isAuthenticated || 
        lastAuthState.isLoading !== isLoading) {
      
      logger.debug(`🔐 Auth state updated: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}, Loading: ${isLoading}`);
      
      setLastAuthState({
        isAuthenticated,
        isLoading
      });
    }
  }, [isAuthenticated, isLoading, lastAuthState]);
  
  // Log any auth errors
  useEffect(() => {
    if (error) {
      logger.error('Auth0 Error:', error);
    }
  }, [error]);
  
  // Login function
  const login = () => {
    loginWithRedirect({
      appState: { returnTo: '/dashboard' }
    });
  };
  
  // Logout function with proper redirection
  const handleLogout = () => {
    // Determine the correct redirect URL based on environment
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    const redirectUrl = isDevelopment ? 
                       'http://localhost:5173' : 
                       window.location.origin;
    
    logger.debug(`Logging out. Redirect URL: ${redirectUrl}`);
    
    auth0Logout({ 
      logoutParams: { 
        returnTo: redirectUrl 
      }
    });
  };
  
  // Get access token
  const getToken = async () => {
    if (!isAuthenticated) return null;
    
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      logger.error('Error getting access token:', error);
      return null;
    }
  };
  
  const contextValue = {
    isAuthenticated,
    isLoading,
    user,
    error,
    login,
    logout: handleLogout,
    getToken,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider; 