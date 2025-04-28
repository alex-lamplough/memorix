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

// Determine MongoDB connection string and database based on environment
const getMongoConnectionString = () => {
  const baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  
  // Remove any existing database name from the URI
  const uriWithoutDb = baseUri.split('/').slice(0, 3).join('/');
  
  // Choose database name based on environment
  let dbName;
  if (process.env.NODE_ENV === 'production') {
    dbName = 'memorix';
  } else if (process.env.NODE_ENV === 'test') {
    dbName = 'memorixTest';
  } else {
    dbName = 'memorixDev';
  }
  
  console.log(`🔧 Using ${dbName} database in ${process.env.NODE_ENV || 'development'} environment`);
  
  // Return the full connection string with the appropriate database name
  return `${uriWithoutDb}/${dbName}`;
};

// Connect to MongoDB
mongoose.connect(getMongoConnectionString())
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 