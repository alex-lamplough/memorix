import { useAuth0 } from '@auth0/auth0-react';
import logger from '../utils/logger';

/**
 * Custom hook to provide simplified access to Auth0 authentication functions
 * @returns {Object} Authentication methods and state
 */
export function useAuth() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently
  } = useAuth0();

  const login = () => {
    // Use a minimal configuration to prevent issues
    loginWithRedirect({
      // Only specify the returnTo for the simplest possible configuration
      appState: { returnTo: '/dashboard' }
    });
  };

  const signup = () => {
    // First, set a flag to indicate this is a new registration
    localStorage.setItem('isNewRegistration', 'true');
    
    // Then direct the user to the Auth0 signup screen
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      },
      appState: { returnTo: '/onboarding' }
    });
  };

  const logoutUser = () => {
    // Determine the correct redirect URL based on environment
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    const redirectUrl = isDevelopment ? 
                        'http://localhost:5173' : 
                        window.location.origin;
    
    logger.debug(`Logging out. Redirect URL: ${redirectUrl}`);
    
    logout({ 
      logoutParams: {
        returnTo: redirectUrl
      }
    });
  };

  // Function to get an access token for API calls
  const getToken = async () => {
    try {
      const token = await getAccessTokenSilently();
      return token;
    } catch (error) {
      logger.error('Error getting access token', error);
      return null;
    }
  };

  return {
    isLoading,
    isAuthenticated,
    error,
    user,
    login,
    signup,
    logout: logoutUser,
    getToken
  };
} 