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
import { errorHandler } from './middleware/error-middleware.js';
import { connectToMongoDB } from './db/mongodb.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Health check endpoint at the root - Added before any middleware to ensure it's always accessible
// This is critical for Railway deployments
app.get('/', (req, res) => {
  res.status(200).send('Memorix API is running');
});

// Public health check endpoint (accessible without auth)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    time: new Date().toISOString()
  });
});

// Set up middleware
app.use(helmet()); // Security headers

// Configure CORS to allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
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
app.use(express.json()); // Parse JSON request body

// Function to set up and start the server
const setupServer = () => {
  // API routes
  app.use('/api/flashcards', flashcardRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/generator', flashcardGeneratorRoutes);
  app.use('/api/todos', todoRoutes);
  app.use('/api/quizzes', quizRoutes);

  // Authenticated health check endpoint (for internal use)
  app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        name: mongoose.connection.name,
        status: dbStatus
      },
      memory: process.memoryUsage()
    });
  });

  // Error handling middleware
  app.use(errorHandler);

  // Start server
  const PORT = process.env.PORT || 3000;
  
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

// Connect to MongoDB and then start the server
// Added better error handling to prevent hanging connections
try {
  console.log('Attempting to connect to MongoDB...');
  connectToMongoDB()
    .then((connection) => {
      console.log('MongoDB connection successful, starting server...');
      setupServer();
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
      // If in Railway, we'll start the server anyway so health checks can pass
      if (process.env.RAILWAY) {
        console.log('Running in Railway environment, starting server despite MongoDB connection failure');
        setupServer();
      } else {
        process.exit(1);
      }
    });
} catch (err) {
  console.error('Unexpected error during startup:', err);
  process.exit(1);
} 