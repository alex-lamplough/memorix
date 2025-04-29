import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// For ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load environment variables from .env.local if it exists
 */
const loadEnvLocal = () => {
  const envLocalPath = path.join(__dirname, '../../.env.local');
  
  try {
    if (fs.existsSync(envLocalPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
      for (const key in envConfig) {
        process.env[key] = envConfig[key];
      }
      console.log('✅ Loaded MongoDB connection string from .env.local');
    }
  } catch (err) {
    console.error('Error loading .env.local:', err);
  }
};

/**
 * Builds the MongoDB connection string based on environment variables
 * Handles different MongoDB URI formats (local, Railway, Atlas, etc.)
 * @returns {string} MongoDB connection string with correct database
 */
export const getMongoConnectionString = () => {
  // Load from .env.local first
  loadEnvLocal();
  
  // Get base MongoDB URI from environment or fallback to local
  const baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  
  // For Railway production, we need to make sure we're using the correct database
  if (baseUri.includes('mongodb.railway.internal')) {
    console.log('Using Railway-provided MongoDB URI');
    
    try {
      // Parse the URI using URL
      const uriParts = new URL(baseUri);
      
      // Extract the database name or use empty string if none
      const pathParts = uriParts.pathname.split('/');
      const currentDb = pathParts.length > 1 ? pathParts[1] : '';
      
      // In production, set database to 'memorix'
      if (process.env.NODE_ENV === 'production') {
        const targetDb = 'memorix';
        console.log(`Replacing database "${currentDb || 'none'}" with "${targetDb}" in Railway URI`);
        
        // IMPORTANT: preserve the original auth information (username/password)
        // Just update the path portion to use the correct database name
        uriParts.pathname = `/${targetDb}`;
        return uriParts.toString();
      }
      
      // For non-production, if no database specified, use memorixDev
      if (!currentDb) {
        console.log('No database specified in Railway URI, appending "memorixDev"');
        uriParts.pathname = '/memorixDev';
        return uriParts.toString();
      }
      
      return baseUri;
    } catch (error) {
      console.error('Error parsing MongoDB URI:', error.message);
      console.log('Falling back to original URI');
      return baseUri;
    }
  }
  
  // For other URIs, handle database selection
  const dbName = process.env.NODE_ENV === 'production' ? 'memorix' : 'memorixDev';
  console.log(`Connecting to ${process.env.NODE_ENV || 'development'} database: ${dbName}`);

  // Handle standard MongoDB URLs
  if (baseUri.includes('mongodb+srv://') || baseUri.includes('mongodb://')) {
    // Extract the base URI without any database specification
    const lastSlashIndex = baseUri.lastIndexOf('/');
    if (lastSlashIndex !== -1 && lastSlashIndex < baseUri.length - 1) {
      // If there's a database specified, strip it
      const questionMarkIndex = baseUri.indexOf('?', lastSlashIndex);
      if (questionMarkIndex !== -1) {
        // URI has parameters after the database
        return baseUri.substring(0, lastSlashIndex + 1) + dbName + baseUri.substring(questionMarkIndex);
      } else {
        // URI just has the database without parameters
        return baseUri.substring(0, lastSlashIndex + 1) + dbName;
      }
    } else {
      // No database specified, append our database
      return baseUri + (baseUri.endsWith('/') ? '' : '/') + dbName;
    }
  }
  
  // Not a standard MongoDB URI, warn and return as is
  console.warn('Warning: MONGODB_URI does not appear to be a standard MongoDB connection string');
  return baseUri;
};

/**
 * Creates initial collections if they don't exist and checks if they have data
 * @param {Object} db - Mongoose connection object
 */
const initializeDatabase = async (db) => {
  try {
    const collections = await db.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Define collections that should exist
    const requiredCollections = ['users', 'flashcardsets'];
    
    // Create collections that don't exist
    for (const collection of requiredCollections) {
      if (!collectionNames.includes(collection)) {
        console.log(`Creating collection: ${collection}`);
        await db.db.createCollection(collection);
      }
    }
    
    // Check if collections have data
    for (const collection of requiredCollections) {
      if (collectionNames.includes(collection)) {
        const count = await db.db.collection(collection).countDocuments();
        console.log(`Collection '${collection}' contains ${count} documents`);
      }
    }
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

/**
 * Connects to MongoDB using the connection string from getMongoConnectionString()
 * @returns {Promise} Mongoose connection promise
 */
export const connectToMongoDB = async () => {
  try {
    const connectionString = getMongoConnectionString();
    
    // Add logging for debugging the connection string (sanitized)
    console.log('Attempting to connect with URI:', 
      connectionString.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://username:password@')); 
    
    const options = {
      serverSelectionTimeoutMS: 10000 // Timeout after 10 seconds
    };
    
    await mongoose.connect(connectionString, options);
    console.log('✅ Connected to MongoDB successfully');
    
    // Log connection details
    const db = mongoose.connection;
    console.log(`Database name: ${db.name}`);
    console.log(`Connection state: ${db.readyState === 1 ? 'connected' : 'not connected'}`);
    
    // Initialize database with required collections
    await initializeDatabase(db);
    
    // Log all collections after initialization
    const collections = await db.db.listCollections().toArray();
    console.log('Collections in database:', collections.length ? 
      collections.map(c => c.name) : 'No collections found');
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error; // Re-throw to be handled by caller
  }
};

/**
 * Disconnects from MongoDB
 * @returns {Promise} Mongoose disconnection promise
 */
export const disconnectFromMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    return true;
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

export default {
  getMongoConnectionString,
  connectToMongoDB,
  disconnectFromMongoDB
}; 