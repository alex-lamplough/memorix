/**
 * Main application configuration
 */

import dotenv from 'dotenv';
dotenv.config();

// Server configuration
const serverConfig = {
  port: process.env.PORT || 5001,
  environment: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

// Database configuration
const dbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/memorix',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};

// Auth0 configuration
const auth0Config = {
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE
};

// Default configuration for OpenAI
const openaiDefaults = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2048,
  apiKey: process.env.OPENAI_API_KEY
};

// Stripe configuration
const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  // Price IDs for different subscription plans
  proPlanPriceId: process.env.STRIPE_PRO_PLAN,
  creatorPlanPriceId: process.env.STRIPE_CREATOR_PLAN,
  enterprisePlanPriceId: process.env.STRIPE_ENTERPRISE_PLAN,
  // Trial configuration
  trialPeriodDays: parseInt(process.env.STRIPE_TRIAL_PERIOD_DAYS || '14', 10)
};

// Export the complete config
export const config = {
  server: serverConfig,
  database: dbConfig,
  auth0: auth0Config,
  openai: openaiDefaults,
  stripe: stripeConfig
};

// Also export a default for modules that might use default import
export default config; 