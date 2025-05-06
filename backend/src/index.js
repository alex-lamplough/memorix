import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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
import { errorHandler } from './middleware/error-middleware.js';
import { connectToMongoDB } from './db/mongodb.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set up middleware
app.use(helmet()); // Security headers

// Configure CORS to allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5001',
  process.env.CORS_ORIGIN
].filter(Boolean); // Remove any undefined or empty values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('dev')); // Logging

// Special route for Stripe webhook that needs raw body
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), subscriptionRoutes);

// Parse JSON request body for all other routes
app.use(express.json()); // Parse JSON request body

// Function to set up and start the server
const setupServer = () => {
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
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS allowed origins:`, allowedOrigins);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${PORT} is already in use, trying port ${PORT + 1}...`);
      // Try another port
      app.listen(PORT + 1, () => {
        console.log(`🚀 Server running on port ${PORT + 1}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔒 CORS allowed origins:`, allowedOrigins);
      });
    } else {
      console.error('Server error:', err);
    }
  });
};

// Connect to MongoDB
connectToMongoDB()
  .then((connection) => {
    setupServer();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }); 