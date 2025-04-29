# Auth0 Email Integration Guide

## Issue: Email Not Being Captured from Auth0

When using Auth0 for authentication, you might encounter an issue where user emails are not properly captured in your application, resulting in default emails like `user@example.com` being stored in your database.

## Solution

We've implemented two approaches to ensure your app correctly captures emails from Auth0:

### Approach 1: Auth0 Management API (Recommended)

This approach fetches the complete user profile directly from Auth0's Management API, ensuring we get all user data including email addresses:

1. **Set up Auth0 Management API credentials**:
   
   Add these to your backend `.env.local` file:
   ```
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   ```

2. **Get these values from your Auth0 Dashboard**:
   - Go to Applications > APIs > Auth0 Management API > API Explorer
   - Copy the Client ID and Client Secret
   - Ensure the API Explorer has the `read:users` permission

This approach is the most reliable because it will always fetch the complete user profile directly from Auth0.

### Approach 2: Auth0 Action (Alternative)

Alternatively, you can enrich your Auth0 tokens directly by adding an Action:

1. Go to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Actions** > **Library**
3. Click **Create** to create a new action
4. Choose **Custom** action type
5. Name it "Add Email to Tokens"
6. Paste the code from `/backend/auth0-actions/add-email-to-tokens.js` into the editor
7. Deploy the action
8. Go to **Actions** > **Flows**
9. Select the **Login** flow
10. Add the "Add Email to Tokens" action to the flow
11. Save changes

## Other Auth0 Settings to Check

If you're still having issues, check these Auth0 settings:

1. In your Auth0 application settings:
   - Enable "OIDC Conformant"
   - Use RS256 algorithm for token signing
   - Make sure "profile" and "email" are in your default scopes

2. In the "Rules" section, check for any rules that might be filtering token contents

## Technical Implementation Details

Our backend now tries multiple approaches to get user email, in this order:

1. Auth0 Management API (most reliable)
2. Standard JWT token claims
3. Custom namespaced claims
4. Email from emails array (social logins)
5. Username if it looks like an email
6. Fallback to a generated placeholder email

If you need to test and debug this functionality, look for these log messages in your server output:

```
Auth0 user info received: {...}
Email fields in token: {...}
Fetching complete profile from Auth0 Management API
Using email from Auth0 Management API: user@example.com
```

## Troubleshooting

If you still have issues after implementing these changes:

1. Ensure you've properly configured the Auth0 Management API credentials
2. Check Auth0 logs for any errors in the authentication process
3. Look at your server logs for detailed information about the token claims and Management API responses
4. Try logging out and logging back in to generate fresh tokens 