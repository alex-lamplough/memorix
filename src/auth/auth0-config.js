// Auth0 configuration settings
// This file reads Auth0 credentials from environment variables
import { getEnvVariable, maskSensitiveValue } from '../utils/env-utils';

// Get Auth0 config from environment variables
const domain = getEnvVariable('AUTH0_DOMAIN', 'YOUR_AUTH0_DOMAIN');
const clientId = getEnvVariable('AUTH0_CLIENT_ID', 'YOUR_AUTH0_CLIENT_ID');
const audience = getEnvVariable('AUTH0_AUDIENCE', '');

// Log for debugging in development mode only
if (import.meta.env.DEV) {
  console.log('Auth0 Configuration:');
  console.log(`  Domain: ${domain}`);
  console.log(`  Client ID: ${maskSensitiveValue(clientId)}`);
  console.log(`  Audience: ${audience ? maskSensitiveValue(audience) : 'Not configured'}`);
}

export const auth0Config = {
  domain,
  clientId,
  audience: audience || undefined,
  redirectUri: window.location.origin,
  useRefreshTokens: true,
  cacheLocation: "localstorage"
}; 