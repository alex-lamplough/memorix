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
import { errorHandler } from './middleware/error-middleware.js';
import { connectToMongoDB } from './db/mongodb.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set up middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
  const PORT = process.env.PORT || 3000;
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${PORT} is already in use, trying port ${PORT + 1}...`);
      // Try another port
      app.listen(PORT + 1, () => {
        console.log(`🚀 Server running on port ${PORT + 1}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
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