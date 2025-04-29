# Production Deployment Checklist

This document outlines the steps needed to prepare the Memorix application for production deployment on Railway.

## Environment Variables

### Backend Environment Variables

Set the following environment variables in your Railway project:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment name | `production` |
| `PORT` | Server port (usually set by Railway) | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:password@cluster.mongodb.net/memorix?retryWrites=true` |
| `AUTH0_DOMAIN` | Auth0 tenant domain | `dev-spk5b1r7dbr52ilx.eu.auth0.com` |
| `AUTH0_AUDIENCE` | Auth0 API audience | `https://dev-spk5b1r7dbr52ilx.eu.auth0.com/api/v2/` |
| `AUTH0_MGMT_CLIENT_ID` | Auth0 Management API client ID | `iQpcTDiJKKK10m2qHAYHMT9GjDvbUZms` |
| `AUTH0_MGMT_CLIENT_SECRET` | Auth0 Management API client secret | `TYS61SV-W0epKaoZ...` |
| `CORS_ORIGIN` | Frontend origin URL | `https://memorix-app.up.railway.app` |
| `OPENAI_API_KEY` | OpenAI API Key (if used) | `sk-...` |

### Frontend Environment Variables

Set these variables for your frontend deployment:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain | `dev-spk5b1r7dbr52ilx.eu.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | Auth0 application client ID | `iQpcTDiJKKK10m2qHAYHMT9GjDvbUZms` |
| `VITE_AUTH0_AUDIENCE` | Auth0 API audience | `https://dev-spk5b1r7dbr52ilx.eu.auth0.com/api/v2/` |
| `VITE_API_URL` | Backend API URL | `https://memorix-api.up.railway.app/api` |
| `VITE_ENV` | Environment name | `production` |

## Auth0 Configuration

### Application Settings

1. Go to Auth0 Dashboard > Applications > Your SPA Application
2. Update the following settings:
   - **Allowed Callback URLs**: Add `https://your-frontend-domain.com, https://your-frontend-domain.com/dashboard`
   - **Allowed Logout URLs**: Add `https://your-frontend-domain.com`
   - **Allowed Web Origins**: Add `https://your-frontend-domain.com`
   - **CORS**: Ensure CORS is enabled for your domains

### Management API Settings

1. Go to Auth0 Dashboard > Applications > Your M2M Application
2. Ensure it has the following API permissions:
   - `read:users`
   - `read:user_idp_tokens` (if you need to get user profile data from social providers)

## MongoDB Configuration

1. Ensure your MongoDB Atlas cluster is accessible from Railway's IP range
2. Consider setting up IP allow lists or VPC peering for better security
3. Create a dedicated database user with appropriate permissions

## Deployment Process

1. **Prepare your code**:
   - Ensure all environment variables are referenced correctly
   - Remove any hardcoded development URLs
   - Set proper NODE_ENV detection in your code

2. **Deploy to Railway**:
   - Connect your GitHub repository to Railway
   - Configure the build command: `npm install && npm run build`
   - Configure the start command: `npm start`
   - Set all required environment variables
   - Deploy!

3. **Verify deployment**:
   - Check Railway logs for any errors
   - Test authentication flow in production
   - Verify MongoDB connection
   - Test API endpoints

## Monitoring Considerations

1. Set up logging with a service like Logtail or use Railway's built-in logs
2. Consider implementing error tracking with Sentry
3. Set up uptime monitoring for your production endpoints

## Security Best Practices

1. Ensure all secrets are stored securely as environment variables
2. Set up rate limiting for API endpoints
3. Implement proper CORS configuration
4. Use HTTPS for all communications
5. Regularly rotate Auth0 client secrets and MongoDB credentials 