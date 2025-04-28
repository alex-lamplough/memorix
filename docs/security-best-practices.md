# Security Best Practices for Memorix

This document outlines the security best practices for managing credentials and sensitive information in the Memorix application.

## Environment Variables

### Why Use Environment Variables?

Environment variables are the safest way to store sensitive information like API keys, authentication credentials, and other secrets because:

1. They are not committed to your source code repository
2. They can be different across environments (development, staging, production)
3. They can be managed securely in deployment platforms
4. They prevent accidental exposure of credentials

### How We Use Environment Variables

In Memorix, we use Vite's built-in environment variable support with these guidelines:

- All environment variables must be prefixed with `VITE_` to be accessible in the client-side code
- We use a `.env.local` file for local development (automatically ignored by git)
- We provide a setup script (`npm run setup`) to help you create this file securely
- Environment variables are accessed through our utilities in `src/utils/env-utils.js`

## Auth0 Credentials

Auth0 credentials are particularly sensitive as they control access to user authentication. Follow these guidelines:

1. **Store credentials in environment variables**:
   ```
   VITE_AUTH0_DOMAIN=your-auth0-domain
   VITE_AUTH0_CLIENT_ID=your-auth0-client-id
   VITE_AUTH0_AUDIENCE=your-api-identifier
   ```

2. **Use separate applications for different environments**:
   - Create different Auth0 applications for development, staging, and production
   - Each environment should have its own credentials

3. **Restrict application permissions**:
   - Only grant the permissions that your application actually needs
   - Use the principle of least privilege

4. **Set appropriate callback URLs**:
   - Only allow specific callback URLs for your application
   - Be explicit about allowed origins

## API Keys and Secrets

For other API keys and secrets:

1. **Never hardcode secrets in your application**
2. **Store all API keys in environment variables**
3. **Use different API keys for development and production**
4. **Rotate keys periodically** (recommended: every 90 days)
5. **Limit the scope and permissions** of API keys

## Local Development

When developing locally:

1. Use the `npm run setup` script to create your `.env.local` file
2. Never commit the `.env.local` file to git (it's already in `.gitignore`)
3. If you need to share environment configurations with your team, use `.env.example` with placeholder values

## Deployment

For deployment:

1. **Never store production credentials in files**
2. Configure environment variables directly in your hosting platform:
   - Vercel: Environment Variables section in project settings
   - Netlify: Build & Deploy > Environment variables
   - AWS: Use Parameter Store or Secrets Manager
   - Heroku: Config Vars in app settings

3. **Use a CI/CD pipeline** that handles secrets securely
4. Consider using a secrets manager for more complex applications

## Handling Exposed Credentials

If credentials are accidentally exposed:

1. **Rotate the credentials immediately** (create new ones and invalidate old ones)
2. **Assess the potential impact** of the exposure
3. **Monitor for unusual activity**
4. **Document the incident** and implement additional safeguards

## Security Monitoring

To maintain strong security:

1. **Regularly audit** your application's use of credentials
2. **Monitor Auth0 logs** for suspicious activity
3. **Keep dependencies updated** to avoid security vulnerabilities
4. **Implement Content Security Policy (CSP)** to prevent common attacks

Remember: security is a continuous process, not a one-time setup.

## Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Auth0 Security](https://auth0.com/docs/secure)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Best Practices](https://web.dev/secure/) 