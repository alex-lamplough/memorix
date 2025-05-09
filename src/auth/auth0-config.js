// Auth0 configuration settings
// This file reads Auth0 credentials from environment variables
import { getEnvVariable, maskSensitiveValue, isProduction, isDevelopment, getEnvironmentName } from '../utils/env-utils';
import logger from '../utils/logger';

// Get Auth0 config from environment variables
const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
// Audience is optional and may cause problems if not correctly configured
const audience = import.meta.env.VITE_AUTH0_AUDIENCE || '';

// Get current environment
const currentEnv = getEnvironmentName();
const isProd = isProduction();
const isDev = isDevelopment();

// Determine the correct redirect URI based on environment
const redirectUri = isDev ? 'http://localhost:5173' : window.location.origin;

// Log for debugging in development mode only
if (isDevelopment()) {
  console.log(`🔐 Auth0 Configuration (${currentEnv} environment):`);
  logger.debug(`  Domain: ${domain || 'NOT SET - AUTH WILL FAIL'}`);
  console.log(`  Client ID: ${clientId ? maskSensitiveValue(clientId) : 'NOT SET - AUTH WILL FAIL'}`);
  console.log(`  Audience: ${audience ? maskSensitiveValue(audience) : 'Not configured (this is optional)'}`);
  console.log(`  Redirect URI: ${redirectUri}`);
}

// Check if required values are missing
if (!domain || !clientId) {
  logger.error('❌ ERROR: Missing required Auth0 configuration. Authentication will fail!');
  logger.error('Please check your .env.local file and ensure VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID are set.');
}

// Only include audience if it's actually needed and configured
const authParams = {
  redirect_uri: redirectUri,
};

// Only add audience if it's specifically set
if (audience) {
  authParams.audience = audience;
}

export const auth0Config = {
  domain,
  clientId,
  authorizationParams: authParams,
  useRefreshTokens: true,
  cacheLocation: "localstorage"
}; 