import logger from './logger';

/**
 * Utility function to manually clear auth state in local development
 * This can be called from the browser console if logout is not working properly
 */
export function clearAuthState() {
  logger.debug('Manually clearing auth state');
  
  // Clear Auth0 related cookies
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    if (name.includes('auth0') || name.includes('_identity') || name.includes('auth')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
  
  // Clear Auth0 related localStorage items
  Object.keys(localStorage).forEach(key => {
    if (key.includes('auth0') || key.includes('user') || key.includes('token')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear Auth0 related sessionStorage items
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('auth0') || key.includes('user') || key.includes('token')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Add utility to window for easy access in console
  window.clearAuth = clearAuthState;
  
  logger.debug('Auth state cleared');
  
  return 'Auth state cleared. Refresh the page and you should be logged out.';
}

/**
 * Utility function to force redirect to localhost
 */
export function redirectToLocalhost() {
  window.location.replace('http://localhost:5173');
}

/**
 * Initialize auth utilities in development environment
 */
export function initAuthUtils() {
  if (process.env.NODE_ENV === 'development' || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    // Add utilities to window for development purposes
    window.clearAuth = clearAuthState;
    window.goToLocalhost = redirectToLocalhost;
    
    logger.debug('Auth utilities initialized in development environment');
  }
}

export default {
  clearAuthState,
  redirectToLocalhost,
  initAuthUtils
}; 