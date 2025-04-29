import { useAuth0 } from '@auth0/auth0-react';

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
    loginWithRedirect({
      appState: { returnTo: '/dashboard' }
    });
  };

  const logoutUser = () => {
    logout({ 
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  // Function to get an access token for API calls
  const getToken = async () => {
    try {
      const token = await getAccessTokenSilently();
      return token;
    } catch (error) {
      console.error('Error getting access token', error);
      return null;
    }
  };

  return {
    isLoading,
    isAuthenticated,
    error,
    user,
    login,
    logout: logoutUser,
    getToken
  };
} 