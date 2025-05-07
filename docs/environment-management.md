# Environment Management in Memorix

This guide explains how Memorix handles different environments (development and production) and how to properly configure your application for each.

## Environment Detection

Memorix automatically detects the current environment using Vite's environment variables. The application distinguishes between:

- **Development environment**: When running with `npm run dev` (uses `.env.local`)
- **Production environment**: When deployed to a hosting platform (uses environment variables set on the platform)

## Environment Variables

### Core Variables

| Variable Name | Purpose | Required |
|---------------|---------|----------|
| `VITE_AUTH0_DOMAIN` | Auth0 domain for authentication | Yes |
| `VITE_AUTH0_CLIENT_ID` | Auth0 client ID | Yes |
| `VITE_AUTH0_AUDIENCE` | Auth0 API audience for JWT tokens | Recommended |
| `VITE_API_URL` | API endpoint URL | Yes |
| `VITE_ENV` | Environment name (development/production) | Recommended |

### Development Setup

In development, environment variables are loaded from the `.env.local` file. This file is not committed to the repository for security reasons.

To set up your development environment:

1. Run the setup script:
   ```
   npm run setup
   ```

2. Answer the prompts to configure your Auth0 credentials and other settings.

3. The script will create a `.env.local` file in the project root with your settings.

### Production Setup

For production deployments (e.g., Railway):

1. Set all environment variables in your hosting platform's dashboard or settings panel.

2. Make sure to set `VITE_ENV=production`.

3. Use production-specific values for URLs and API endpoints.

## Backend Connection

Memorix uses a separate backend service for API functionality, database operations, and AI features. The frontend connects to this backend through the `VITE_API_URL` environment variable.

### Local Development

1. When running locally, set `VITE_API_URL` to `http://localhost:5001/api` (or whatever port your local backend runs on)

2. Ensure your backend is running with the correct environment variables:
   - `AUTH0_AUDIENCE` and `AUTH0_DOMAIN` should match your frontend's Auth0 configuration
   - `CORS_ORIGIN` should allow your frontend's URL (e.g., `http://localhost:5173`)

### Production Deployment

1. In production, set `VITE_API_URL` to your deployed backend URL (e.g., `https://memorix-backend-production.up.railway.app/api`)

2. Make sure both services are deployed and configured correctly on Railway:
   - MongoDB service
   - Backend API service
   - Frontend service
   
3. Each service should have its appropriate environment variables set in Railway's dashboard.

## Debugging Environment Issues

If you encounter environment-related issues:

1. Run the environment validation script:
   ```
   npm run validate-env
   ```

2. Check the console logs when the app starts for environment information.

3. Verify that all required environment variables are properly set.

4. Test the API connection using the health check endpoint:
   ```
   curl -v https://your-backend-url/api/health
   ```

## Railway Deployment

When deploying to Railway:

1. Set up three services:
   - **MongoDB** - Database service
   - **Backend API** - The Express backend API
   - **Frontend** - The React frontend

2. For the Frontend service, add these environment variables:
   - `VITE_AUTH0_DOMAIN`
   - `VITE_AUTH0_CLIENT_ID`
   - `VITE_AUTH0_AUDIENCE`
   - `VITE_API_URL` (pointing to your backend API service)
   - `VITE_ENV=production`

3. For the Backend API service, add these environment variables:
   - `PORT=5001`
   - `NODE_ENV=production`
   - `MONGODB_URI` (connection string to your MongoDB service)
   - `AUTH0_AUDIENCE`
   - `AUTH0_DOMAIN`
   - `OPENAI_API_KEY`
   - `CORS_ORIGIN` (URL of your frontend service)

4. Railway automatically injects these variables during build and runtime.

## Environment Utility Functions

Memorix provides utility functions to work with environments:

- `isProduction()`: Returns true if running in production mode
- `isDevelopment()`: Returns true if running in development mode
- `getEnvironmentName()`: Returns the current environment name
- `getEnvVariable(key, defaultValue)`: Safely retrieves an environment variable

These functions are located in `src/utils/env-utils.js` and should be used instead of directly accessing `import.meta.env` throughout the codebase.

## Best Practices

1. **Never hardcode credentials** - Always use environment variables.
2. **Set appropriate defaults** - Provide sensible defaults for optional variables.
3. **Validate on startup** - The app validates environment setup on startup.
4. **Use different values per environment** - Use different API endpoints, logging levels, etc. for different environments.
5. **Guard environment-specific features** - Use the utility functions to enable/disable features based on the environment. 