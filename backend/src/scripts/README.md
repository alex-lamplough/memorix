# Memorix Backend Scripts

This directory contains utility scripts for the Memorix backend.

## Available Scripts

### test-auth0-users.js

Tests the Auth0 Management API connection and retrieves a list of users.

**Usage:**
```bash
node backend/src/scripts/test-auth0-users.js
```

**Requirements:**
- Auth0 credentials in `.env.local` file:
  - AUTH0_DOMAIN
  - AUTH0_CLIENT_ID
  - AUTH0_CLIENT_SECRET
  - AUTH0_AUDIENCE

**What it does:**
- Verifies Auth0 environment variables
- Connects to Auth0 Management API
- Retrieves and displays the first 5 users
- Shows total user count

### test-auth.js

Tests Auth0 authentication by obtaining an access token.

**Usage:**
```bash
node backend/src/scripts/test-auth.js
```

**Requirements:**
- Auth0 credentials in `.env.local` file:
  - AUTH0_DOMAIN
  - AUTH0_CLIENT_ID
  - AUTH0_CLIENT_SECRET
  - AUTH0_AUDIENCE

**What it does:**
- Verifies Auth0 environment variables
- Attempts to obtain an access token from Auth0
- Displays token information (type, expiration, scope)
- Shows a preview of the token (first and last 5 characters)

## Running Scripts

To run any script in this directory:

1. Ensure you're in the project root directory
2. Run the script using Node.js
3. Make sure required environment variables are set

Example:
```bash
# From project root
node backend/src/scripts/test-auth0-users.js
``` 