import sgMail from '@sendgrid/mail';
import fs from 'fs';
import path from 'path';

/**
 * Email service for sending various types of emails via SendGrid
 * Uses API key from environment variable SENDGRID_API_KEY
 */
class EmailService {
  constructor() {
    // We'll initialize the API key when the service is first used
    this.initialized = false;
  }

  /**
   * Initialize SendGrid with API key
   * Only needs to be done once
   */
  initialize() {
    if (!this.initialized) {
      const apiKey = process.env.SENDGRID_API_KEY;
      
      if (!apiKey) {
        console.warn('SendGrid API key not found in environment variables. Email sending will fail.');
      } else {
        sgMail.setApiKey(apiKey);
        this.initialized = true;
      }
    }
  }

  /**
   * Sends a welcome email to a newly registered user
   * @param {string} to - Recipient email address
   * @param {string} name - Recipient's name
   * @returns {Promise} - SendGrid API response
   */
  async sendWelcomeEmail(to, name) {
    this.initialize();

    try {
      console.log(`📧 Sending welcome email to ${to}`);
      
      // Skip sending for placeholder emails
      if (to.includes('@memorix-user.com')) {
        console.log('⚠️ Skipping welcome email for placeholder email address');
        return { skipped: true, reason: 'Placeholder email' };
      }
      
      // Create the email
      const msg = {
        to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@getmemorix.app',
          name: 'Memorix',
        },
        subject: 'Welcome to Memorix! 🎉',
        html: this.getWelcomeEmailTemplate(name, to),
        attachments: [
          {
            content: this.getLogoBase64(),
            filename: 'MemorixLogoImage.png',
            type: 'image/png',
            disposition: 'inline',
            content_id: 'memorix-logo'
          }
        ]
      };

      // Send the email
      const response = await sgMail.send(msg);
      console.log(`✅ Welcome email sent successfully to: ${to}`);
      return response;
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      if (error.response) {
        console.error('SendGrid API error:', error.response.body);
      }
      // Fail gracefully in production
      if (process.env.NODE_ENV === 'production') {
        return { error: 'Failed to send email, but continuing user flow' };
      }
      throw error;
    }
  }

  /**
   * Get the logo as base64 encoded string
   * @returns {string} - Base64 encoded logo image
   */
  getLogoBase64() {
    try {
      // Path to the logo image
      const logoPath = path.resolve(process.cwd(), '../src/assets/MemorixLogoImage.png');
      // Read the file and convert to base64
      const logoBuffer = fs.readFileSync(logoPath);
      return logoBuffer.toString('base64');
    } catch (error) {
      console.error('Failed to load logo image:', error);
      // Return empty string if logo cannot be loaded
      return '';
    }
  }

  /**
   * Returns HTML template for welcome email with Memorix branding
   * @param {string} name - User's name
   * @param {string} email - User's email address
   * @returns {string} - HTML email template
   */
  getWelcomeEmailTemplate(name, email) {
    // Get the app URL from environment variables or use default
    const appUrl = process.env.APP_URL || 'https://getmemorix.app';
    
    // Using inline logo with Content-ID reference
    const twitterIconUrl = 'https://cdn4.iconfinder.com/data/icons/social-media-black-white-2/1227/X-512.png'; // Replace with your actual Twitter icon URL
    const instagramIconUrl = 'https://cdn0.iconfinder.com/data/icons/social-media-circle-6/1024/instagram-1024.png'; // Replace with your actual Instagram icon URL
    const facebookIconUrl = 'https://cdn3.iconfinder.com/data/icons/2018-social-media-logotypes/1000/2018_social_media_popular_app_logo_facebook-1024.png'; // Replace with your actual Facebook icon URL
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Memorix</title>
          <style>
            /* Base styles */
            body {
              background-color: #18092a;
              color: #ffffff;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: linear-gradient(to bottom, #2E0033, #260041, #1b1b2f);
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 1px solid rgba(128, 128, 128, 0.2);
            }
            .content {
              padding: 30px 20px;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 16px;
              line-height: 1.5;
            }
            .button {
              display: inline-block;
              background-color: rgba(0, 255, 148, 0.1);
              color: #00ff94;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              margin-top: 20px;
              border: 1px solid rgba(0, 255, 148, 0.3);
              font-weight: 500;
            }
            .button:hover {
              background-color: rgba(0, 255, 148, 0.2);
            }
            .footer {
              text-align: center;
              padding: 20px 0;
              font-size: 12px;
              color: rgba(255, 255, 255, 0.5);
              border-top: 1px solid rgba(128, 128, 128, 0.2);
            }
            .accent {
              color: #00ff94;
            }
            .social-icons {
              margin-top: 20px;
            }
            .social-icons a {
              margin: 0 10px;
              text-decoration: none;
            }
            .card {
              background-color: rgba(24, 9, 42, 0.6);
              border: 1px solid rgba(128, 128, 128, 0.3);
              padding: 20px;
              border-radius: 12px;
              margin: 20px 0;
            }
            .user-name {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 16px;
              color: #ffffff;
              font-weight: normal;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="cid:memorix-logo" alt="Memorix Logo" width="150" height="auto">
            </div>
            
            <div class="content">
              <h1>Welcome to <span class="accent">Memorix</span>!</h1>
              <p>Hi <span class="user-name">${name}</span>,</p>
              <p>We're thrilled to have you join us! Memorix is your new study companion that makes learning efficient and fun.</p>
              
              <div class="card">
                <h2>Quick Start Guide</h2>
                <ul>
                  <li>Create your first flashcard set</li>
                  <li>Use our AI to generate cards from your notes</li>
                  <li>Track your progress with our analytics</li>
                  <li>Study on any device, anytime</li>
                </ul>
              </div>
              
              <p>Ready to start your learning journey?</p>
              <a href="${appUrl}/dashboard" class="button">Go to Dashboard</a>
              
              <p style="margin-top: 30px;">If you have any questions, just reply to this email. We're always here to help!</p>
              
              <p>Happy studying!<br>
              <span class="accent">The Memorix Team</span></p>
              
              <div class="social-icons">
                <a href="https://twitter.com/memorixapp"><img src="${twitterIconUrl}" alt="Twitter" width="24" height="24"></a>
                <a href="https://instagram.com/memorixapp"><img src="${instagramIconUrl}" alt="Instagram" width="24" height="24"></a>
                <a href="https://facebook.com/memorixapp"><img src="${facebookIconUrl}" alt="Facebook" width="24" height="24"></a>
              </div>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Memorix. All rights reserved.</p>
              <p>
                <a href="${appUrl}/privacy" style="color: rgba(255, 255, 255, 0.5); margin-right: 10px;">Privacy Policy</a>
                <a href="${appUrl}/terms" style="color: rgba(255, 255, 255, 0.5);">Terms of Service</a>
              </p>
              <p>If you prefer not to receive these emails, you can <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: rgba(255, 255, 255, 0.5);">unsubscribe</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

// Export a singleton instance
export const emailService = new EmailService(); 