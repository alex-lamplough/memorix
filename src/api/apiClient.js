import axios from 'axios';

// Set default base URL for API requests
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const apiClient = axios.create({
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
      console.log('Successfully obtained auth token');
    }
  } catch (error) {
    console.error('Failed to refresh auth token:', error);
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
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    } catch (error) {
      console.error('Error getting auth token for request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to log all responses and handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`API Error: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        data: error.response.data
      });
      
      // Handle 401 Unauthorized errors (expired token)
      if (error.response.status === 401) {
        console.warn('Unauthorized request - token may be expired');
        
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
      console.error('API request failed:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient; 