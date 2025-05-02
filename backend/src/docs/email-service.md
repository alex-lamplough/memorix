# Memorix Email Service

This document explains how to use and configure the email service for sending welcome emails and other notifications through SendGrid.

## Configuration

The email service uses environment variables for all configuration to avoid hardcoding sensitive credentials.

### Required Environment Variables

Add these to your `.env` file:

```
# SendGrid API credentials
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@getmemorix.app

# Application URL (used in email templates)
APP_URL=https://getmemorix.app
```

### For Development

For local development, you can add these variables to:
- `.env` file in the backend directory
- Environment variables in your IDE's run configuration
- Your hosting platform's environment variables (Railway, Vercel, etc.)

### For Production

In production environments, set these variables in your hosting platform:
- Railway: Add them in the project's Variables tab
- Vercel: Add them in Project Settings > Environment Variables
- Docker: Pass them as environment variables to your container

## Sending Emails

The email service is used automatically when:
1. A new user registers with a valid email address
2. A user updates their profile and adds a valid email address

### Manual Usage

If you need to send emails from other parts of the application:

```javascript
import { emailService } from '../services/email-service.js';

// Example: Send welcome email
try {
  await emailService.sendWelcomeEmail('user@example.com', 'User Name');
  console.log('Welcome email sent successfully');
} catch (error) {
  console.error('Failed to send welcome email:', error);
}
```

## Security

- **Never hardcode API keys** in your code. Always use environment variables.
- Verify your sender email in SendGrid before sending.
- The current implementation uses a single verified sender address for all emails.
- For production, consider implementing domain verification for better deliverability.

## Email Templates

The welcome email template is defined in the `getWelcomeEmailTemplate` method in `email-service.js`.

To modify the template:
1. Edit the HTML/CSS in the template string
2. Use environment variables for dynamic content
3. Test your changes with a test email before deploying

## Troubleshooting

Common issues:

1. **Email not sending**: Check if SENDGRID_API_KEY is properly set
2. **Sender verification failed**: Verify your sender email in SendGrid
3. **Emails in spam folder**: Complete domain authentication in SendGrid

## SendGrid Dashboard

Manage your account, view email stats, and troubleshoot delivery issues:
- [SendGrid Dashboard](https://app.sendgrid.com/)
- [SendGrid Documentation](https://docs.sendgrid.com/) 