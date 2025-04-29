# Memorix Troubleshooting Guide

## Auth0 Integration Issues

If you're experiencing issues with Auth0 user authentication or profile retrieval, follow these steps to troubleshoot:

### Running the Auth0 Test Script

We have a dedicated script to verify Auth0 credentials and permissions:

```bash
# In development environment
npm run test:auth0

# In production environment
NODE_ENV=production npm run test:auth0
```

This script will:
1. Verify all required Auth0 environment variables are present
2. Test obtaining a Management API token
3. Test retrieving users from the Auth0 API
4. Provide detailed error messages and suggested fixes

### Common Auth0 Issues

#### Missing User Profiles
If user profiles aren't being retrieved:

1. Check Auth0 Management API permissions:
   - Go to Auth0 Dashboard > APIs > Auth0 Management API > Machine to Machine Applications
   - Find your application and ensure it has the necessary permissions:
     - `read:users`
     - `read:user_idp_tokens`

2. Verify environment variables:
   - `AUTH0_DOMAIN`
   - `AUTH0_AUDIENCE`
   - `AUTH0_MGMT_CLIENT_ID`
   - `AUTH0_MGMT_CLIENT_SECRET`

3. Check rate limiting:
   - Auth0 has rate limits on API calls
   - Consider implementing caching for user profiles

#### User Creation Issues

If new users aren't being created properly:

1. Verify the user creation logic in `backend/src/routes/user-routes.js`
2. Check MongoDB connection and permissions
3. Ensure Auth0 webhooks are properly configured

## MongoDB Connection Issues

If you're experiencing issues with MongoDB connections:

1. Run the MongoDB connection test:
   ```bash
   npm run test:mongodb
   ```

2. Check MongoDB environment variables:
   - `MONGODB_URI` or individual connection parameters
   - `MONGODB_USER`
   - `MONGODB_PASSWORD`
   - `MONGODB_HOST`
   - `MONGODB_DATABASE`

3. Verify network access:
   - If using MongoDB Atlas, check IP whitelist
   - If using a local MongoDB, check if the service is running

## Deployment Issues

### Vercel Deployment

If experiencing issues with Vercel deployment:

1. Check build logs in the Vercel dashboard
2. Verify environment variables are properly set in Vercel
3. Ensure all dependencies are properly listed in package.json

### Backend Deployment

For backend deployment issues:

1. Check server logs:
   ```bash
   pm2 logs
   ```

2. Verify process status:
   ```bash
   pm2 status
   ```

3. Restart the server:
   ```bash
   pm2 restart memorix-backend
   ```

## Application Performance Issues

If the application is running slowly:

1. Check server resources (CPU, memory)
2. Review database query performance
3. Consider implementing caching for frequently accessed data

## Reporting New Issues

When reporting new issues:

1. Use the issue template at `.github/ISSUE_TEMPLATE/bug_report.md`
2. Include environment details (Node.js version, browser, etc.)
3. Provide steps to reproduce the issue
4. Include relevant logs and screenshots 