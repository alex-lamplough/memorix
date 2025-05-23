import axios from 'axios';
import logger from '../utils/logger';

// Set default base URL for API requests
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create a separate client for public endpoints that don't require authentication
export const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// This function will be set by the AuthTokenProvider when the app initializes
let getAccessToken = async () => null;
let currentToken = null;

// Export a function to set the token getter
export const setAuthTokenGetter = (tokenGetter) => {
  getAccessToken = tokenGetter;
  
  // Initialize token immediately
  refreshAuthToken();
};

// Function to refresh the auth token
export const refreshAuthToken = async () => {
  try {
    currentToken = await getAccessToken();
    if (currentToken) {
      logger.debug('Successfully obtained auth token');
    }
  } catch (error) {
    logger.error('Failed to refresh auth token:', error);
  }
};

// Add auth token to requests if available
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Try to use cached token first to avoid unnecessary token refreshes
      let token = currentToken;
      
      // If we don't have a token, try to get a fresh one
      if (!token) {
        token = await getAccessToken();
        currentToken = token;
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log the request for debugging
      logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    } catch (error) {
      logger.error('Error getting auth token for request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Log public API requests but don't add auth tokens
publicApiClient.interceptors.request.use(
  async (config) => {
    // Log the request for debugging
    logger.debug(`Public API Request: ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to log all responses and handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  async (error) => {
    if (error.response) {
      logger.error(`API Error: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        data: error.response.data
      });
      
      // Check for onboarding required errors (403 with requiresOnboarding flag)
      if (error.response.status === 403 && error.response.data?.requiresOnboarding) {
        logger.error('Onboarding required error from API:', { value: error.response.data });
        
        // Dispatch a custom event that can be caught by the onboarding guard
        window.dispatchEvent(new CustomEvent('axios-error', { 
          detail: error 
        }));
      }
      
      // Handle 401 Unauthorized errors (expired token)
      if (error.response.status === 401) {
        logger.warn('Unauthorized request - token may be expired');
        
        // Clear the current token
        currentToken = null;
        
        // Try to get a fresh token
        await refreshAuthToken();
        
        // If we got a new token, retry the request
        if (currentToken && error.config) {
          error.config.headers.Authorization = `Bearer ${currentToken}`;
          return axios(error.config);
        }
      }
    } else {
      logger.error('API request failed:', { value: error.message });
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for public API client
publicApiClient.interceptors.response.use(
  (response) => {
    logger.debug(`Public API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error(`Public API Error: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        data: error.response.data
      });
    } else {
      logger.error('Public API request failed:', { value: error.message });
    }
    return Promise.reject(error);
  }
);

// Helper method for making public requests that don't require authentication
apiClient.publicRequest = (method, url, data, config = {}) => {
  return publicApiClient({
    method,
    url,
    data,
    ...config
  });
};

// Helper method specifically for GET requests to public endpoints
apiClient.getPublic = (url, config = {}) => {
  return publicApiClient.get(url, config);
};

export default apiClient; 