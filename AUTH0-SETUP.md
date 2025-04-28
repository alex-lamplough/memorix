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

### 3. Configure Auth0 in the Memorix Application (Secure Method)

#### Using the Credential Setup Script (Recommended)

We've created a simple script to help you securely store your Auth0 credentials in a local environment file:

1. Run the setup script:
   ```
   node scripts/create-env.js
   ```
2. Follow the prompts to enter your Auth0 credentials
3. The script will create a `.env.local` file with your credentials
4. This file is automatically ignored by git, so your credentials won't be committed to the repository

#### Manual Setup

If you prefer to set up credentials manually:

1. Create a file named `.env.local` in the project root with the following content:
   ```
   VITE_AUTH0_DOMAIN=your-auth0-domain.region.auth0.com
   VITE_AUTH0_CLIENT_ID=your-auth0-client-id
   VITE_AUTH0_AUDIENCE=your-auth0-audience-optional
   VITE_ENV=development
   ```

2. Replace the placeholder values with your actual Auth0 credentials

You can find your `domain` and `clientId` in the Auth0 application settings.

### 4. (Optional) Set Up an API for Secured Backend Integration

If your application will communicate with a backend API:

1. In Auth0 Dashboard, navigate to "Applications" > "APIs"
2. Click "Create API"
3. Enter a name (e.g. "Memorix API")
4. Enter an identifier (e.g. `https://api.memorix.com`)
5. Click "Create"
6. Add the API identifier to your `.env.local` file as the `VITE_AUTH0_AUDIENCE` value

## Security Best Practices

To keep your Auth0 credentials and other sensitive information secure:

1. **Never commit credentials directly into your code**
   - Always use environment variables
   - The `.env.local` file is already in `.gitignore` to prevent accidental commits

2. **Use different Auth0 applications for development and production**
   - Create separate Auth0 applications for each environment
   - Use environment-specific `.env` files (e.g., `.env.production`)

3. **Limit permissions and API scopes**
   - Configure the minimum required permissions in Auth0

4. **Regularly rotate credentials**
   - Periodically rotate your Auth0 client secrets
   - Update your environment files when credentials change

5. **For production deployment**
   - Set environment variables directly in your hosting platform (Vercel, Netlify, etc.)
   - Never store production credentials in files or repositories

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
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)

## Troubleshooting

**Issue: Callback URL error during login**

Ensure the callback URL in Auth0 settings exactly matches your application URL, including protocol and port.

**Issue: Token validation errors**

Verify that your Auth0 domain and clientId are correctly set in your `.env.local` file.

**Issue: User is not redirected after login**

Check that the `redirectUri` matches an allowed callback URL in your Auth0 settings.

**Issue: Environment variables not loading**

- Make sure you're using the `VITE_` prefix for all environment variables
- Restart the development server after updating the `.env.local` file 