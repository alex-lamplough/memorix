# Auth0 Setup for Memorix

This guide will walk you through the process of setting up Auth0 authentication for the Memorix application.

## Prerequisites

- [Auth0 account](https://auth0.com/signup)
- Memorix project cloned locally

## Setup Steps

### 1. Create an Auth0 Application

1. Sign in to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to Applications > Applications
3. Click "Create Application"
4. Enter a name for your application (e.g. "Memorix")
5. Select "Single Page Web Applications" as the application type
6. Click "Create"

### 2. Configure Application Settings

1. In your new application settings, scroll down to "Application URIs"
2. Set the following URIs:
   - **Allowed Callback URLs**: `http://localhost:5173, http://localhost:5173/dashboard`
   - **Allowed Logout URLs**: `http://localhost:5173`
   - **Allowed Web Origins**: `http://localhost:5173`
3. Scroll down and click "Save Changes"

### 3. Configure Auth0 in the Memorix Application

1. Open the `src/auth/auth0-config.js` file in the Memorix project
2. Update the config with your Auth0 application details:

```js
export const auth0Config = {
  domain: "YOUR_AUTH0_DOMAIN", // e.g. dev-xyz123.us.auth0.com
  clientId: "YOUR_AUTH0_CLIENT_ID",
  redirectUri: window.location.origin,
  useRefreshTokens: true,
  cacheLocation: "localstorage"
};
```

You can find your `domain` and `clientId` in the Auth0 application settings.

### 4. (Optional) Set Up an API for Secured Backend Integration

If your application will communicate with a backend API:

1. In Auth0 Dashboard, navigate to "Applications" > "APIs"
2. Click "Create API"
3. Enter a name (e.g. "Memorix API")
4. Enter an identifier (e.g. `https://api.memorix.com`)
5. Click "Create"
6. Add the API identifier to your `auth0-config.js` as the `audience` property

## Testing Authentication

1. Start the Memorix application: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Click the "Log In" button
4. You should be redirected to the Auth0 login page
5. After logging in, you should be redirected back to the application

## Resources

- [Auth0 React SDK Documentation](https://auth0.com/docs/quickstart/spa/react)
- [Auth0 Universal Login](https://auth0.com/docs/universal-login)
- [Auth0 Management API](https://auth0.com/docs/api/management/v2)

## Troubleshooting

**Issue: Callback URL error during login**

Ensure the callback URL in Auth0 settings exactly matches your application URL, including protocol and port.

**Issue: Token validation errors**

Verify that your domain and clientId are correctly set in the auth0-config.js file.

**Issue: User is not redirected after login**

Check the `redirectUri` in your auth0-config.js and make sure it matches an allowed callback URL in your Auth0 settings. 