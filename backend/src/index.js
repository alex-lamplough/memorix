import express from 'express';
import logger from './utils/logger';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import handleStripeWebhook from './controllers/stripe-webhook-controller.js';
import { initSubscriptionCronJobs } from './cron/subscription-cron.js';
import { config } from './config/config.js';

// Import routes
import flashcardRoutes from './routes/flashcard-routes.js';
import userRoutes from './routes/user-routes.js';
import aiRoutes from './routes/ai-routes.js';
import flashcardGeneratorRoutes from './routes/flashcard-generator-routes.js';
import todoRoutes from './routes/todo-routes.js';
import quizRoutes from './routes/quiz-routes.js';
import publicRoutes from './routes/public-routes.js';
import partnershipRoutes from './routes/partnership-routes.js';
import subscriptionRoutes from './routes/subscription-routes.js';
import adminRoutes from './routes/admin-routes.js';
import { errorHandler } from './middleware/error-middleware.js';
import { connectToMongoDB } from './db/mongodb.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Setup middleware to parse raw body for Stripe webhooks
// This middleware must come BEFORE express.json() and bodyParser middleware
const stripeWebhookPath = '/webhook';
const apiStripeWebhookPath = '/api/stripe/webhook';
const apiWebhookPath = '/api/webhook';
const apiSubscriptionsWebhookPath = '/api/subscriptions/webhook';

app.use((req, res, next) => {
  if (
    req.originalUrl === stripeWebhookPath ||
    req.originalUrl === apiStripeWebhookPath ||
    req.originalUrl === apiWebhookPath ||
    req.originalUrl === apiSubscriptionsWebhookPath
  ) {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

// Standard middleware 
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true
}));
app.use(helmet());
app.use(morgan('combined'));

// Set up webhook routes
app.post('/webhook', (req, res) => {
  logger.debug('Webhook received at /webhook');
  return handleStripeWebhook(req, res);
});

app.post('/api/webhook', (req, res) => {
  logger.debug('Webhook received at /api/webhook');
  return handleStripeWebhook(req, res);
});

app.post('/api/stripe/webhook', (req, res) => {
  logger.debug('Webhook received at /api/stripe/webhook');
  return handleStripeWebhook(req, res);
});

app.post('/api/subscriptions/webhook', (req, res) => {
  logger.debug('Webhook received at /api/subscriptions/webhook');
  return handleStripeWebhook(req, res);
});

// Debug webhook route
app.post('/api/stripe/debug-webhook', (req, res) => {
  logger.debug('Debug webhook received');
  logger.debug('Headers:', { value: JSON.stringify(req.headers, null, 2 }));
  logger.debug('Body:', typeof req.body, req.body instanceof Buffer ? 'Is Buffer' : 'Not Buffer');
  return res.status(200).json({ received: true, debug: true });
});

// Function to set up and start the server
const setupServer = () => {
  // Initialize cron jobs
  initSubscriptionCronJobs();
  
  // Public API routes that don't require authentication
  app.use('/api/public', publicRoutes);
  app.use('/api/partnerships', partnershipRoutes);
  
  // API routes that require authentication
  app.use('/api/flashcards', flashcardRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/generator', flashcardGeneratorRoutes);
  app.use('/api/todos', todoRoutes);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: mongoose.connection.name
    });
  });

  // Error handling middleware
  app.use(errorHandler);

  // Start server
  const PORT = process.env.PORT || 5001;
  
  const server = app.listen(PORT, () => {
    logger.debug(`🚀 Server running on port ${PORT}`);
    logger.debug(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.debug(`🔒 CORS allowed origins:`, { value: config.server.corsOrigin });
    logger.debug(`✅ Stripe webhook endpoints configured at:`);
    logger.debug(`   - /webhook`);
    logger.debug(`   - /api/webhook`);
    logger.debug(`   - /api/stripe/webhook`);
    logger.debug(`   - /api/subscriptions/webhook`);
    logger.debug(`   - Webhook secret: ${config.stripe.webhookSecret ? 'configured' : 'missing'}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.debug(`⚠️ Port ${PORT} is already in use, trying port ${PORT + 1}...`);
      // Try another port
      app.listen(PORT + 1, () => {
        logger.debug(`🚀 Server running on port ${PORT + 1}`);
        logger.debug(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.debug(`🔒 CORS allowed origins:`, { value: config.server.corsOrigin });
      });
    } else {
      logger.error('Server error:', { value: err });
    }
  });
};

// Connect to MongoDB
connectToMongoDB()
  .then((connection) => {
    setupServer();
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB', { value: err });
    process.exit(1);
  }); 