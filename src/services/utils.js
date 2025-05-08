import logger from '../../utils/logger';

// utils.js - Utility functions for API handling, component lifecycles, etc.

/**
 * Creates a ref that can be used to track if a component is mounted.
 * Use this in useEffect cleanup functions to prevent updates on unmounted components.
 */
export const createMountedRef = () => {
  const isMountedRef = { current: true };
  
  return {
    isMounted: isMountedRef,
    onMount: () => {
      isMountedRef.current = true;
    },
    onUnmount: () => {
      isMountedRef.current = false;
    }
  };
};

/**
 * Cancels all ongoing requests when navigating between routes
 * @param {Array} controllers - Array of AbortController instances to cancel
 */
export const cancelAllRequests = (controllers = []) => {
  controllers.forEach(controller => {
    if (controller && typeof controller.abort === 'function') {
      controller.abort();
    }
  });
};

/**
 * Creates an AbortController for a cancellable API request
 * @returns {Object} Controller and signal for the request
 */
export const createAbortController = () => {
  const controller = new AbortController();
  return {
    controller,
    signal: controller.signal
  };
};

/**
 * Safe state setter that checks if a component is still mounted
 * @param {Function} setState - React setState function 
 * @param {Object} mountedRef - Ref object tracking if component is mounted
 * @returns {Function} Safe setState function that only updates if component is mounted
 */
export const safeSetState = (setState, mountedRef) => {
  return (value) => {
    if (mountedRef.current) {
      setState(value);
    }
  };
};

/**
 * Handles API request errors, distinguishing between cancellations and actual errors
 * @param {Error} error - The error from the API request
 * @param {string} requestName - Name of the request for logging
 * @param {boolean} isCritical - Whether this is a critical request that should not be cancelled
 * @returns {boolean} true if error was handled, false if it should be re-thrown
 */
export const handleRequestError = (error, requestName = 'API request', isCritical = false) => {
  // Check if this is a cancellation (don't treat as error)
  if (error.name === 'CanceledError' || error.name === 'AbortError') {
    logger.debug(`${requestName} was cancelled`);
    
    // For critical requests, we want to indicate that this can be retried
    if (isCritical) {
      return false; // Return false to allow the caller to retry
    }
    
    return true;
  }
  
  // Log other errors
  logger.error(`Error in ${requestName}:`, error);
  return false;
};

/**
 * Creates navigation event handlers to cancel requests on navigation
 * @param {Function} historyMethod - History method to wrap (push, replace)
 * @param {Function} cancelFn - Function to cancel ongoing requests
 * @returns {Function} Wrapped history method that cancels requests before navigation
 */
export const createNavigationHandler = (historyMethod, cancelFn) => {
  return (...args) => {
    // Get the target path from args (first argument to navigate is typically the path)
    const targetPath = args[0];
    
    // Critical paths that need data to be fully loaded
    const isStudyOrEditPath = typeof targetPath === 'string' && 
      (targetPath.startsWith('/study/') || 
       targetPath.startsWith('/edit/') ||
       targetPath.startsWith('/edit-quiz/'));
       
    // If navigating to a critical path, ensure we run cancellation more carefully
    if (isStudyOrEditPath) {
      logger.debug(`Navigating to critical path: ${targetPath}, preserving essential requests`);
    }
    
    // Cancel non-critical ongoing requests before navigating
    cancelFn();
    
    // Proceed with navigation
    return historyMethod(...args);
  };
}; 