import logger from '../src/utils/logger.js';

/**
 * Auth0 Action: Add Email to ID Token
 * 
 * This action adds the user's email to the ID token claims,
 * making it accessible to the client application.
 * 
 * To set up:
 * 1. Go to Auth0 Dashboard > Actions > Library
 * 2. Create a new action
 * 3. Copy and paste this code
 * 4. Deploy the action
 * 5. Add it to the "Login" flow
 */

/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  logger.debug("Running add-email-to-tokens action");
  
  // Only add claims if the user has an email
  if (event.user.email) {
    // Log for debugging
    logger.debug(`Adding email ${event.user.email} to token claims`);
    
    // Add custom claims to the ID token and access token
    // Using namespaced format as recommended by Auth0
    api.idToken.setCustomClaim("https://memorix.app/email", event.user.email);
    api.accessToken.setCustomClaim("https://memorix.app/email", event.user.email);
    
    // Also add email directly to make it more accessible
    if (!event.authorization) {
      api.accessToken.setCustomClaim("email", event.user.email);
    }
  } else {
    logger.debug("User has no email to add to token claims");
  }
};

/**
 * Handler that will be invoked when this action is resuming after an external redirect.
 * If your action has initiated a redirect, you can use this function to complete your action.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onContinuePostLogin = async (event, api) => {
  // Not needed for this action
}; 