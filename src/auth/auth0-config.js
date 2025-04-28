// Auth0 configuration settings
// Replace these with your actual Auth0 credentials
export const auth0Config = {
  domain: "YOUR_AUTH0_DOMAIN",
  clientId: "YOUR_AUTH0_CLIENT_ID",
  audience: "YOUR_AUTH0_AUDIENCE", // Optional: Your API identifier
  redirectUri: window.location.origin,
  useRefreshTokens: true,
  cacheLocation: "localstorage"
}; 