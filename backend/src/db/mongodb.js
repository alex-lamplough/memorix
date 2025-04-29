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
  
  // Determine which URI to use based on environment
  const isProd = process.env.NODE_ENV === 'production';
  const baseUri = isProd && process.env.MONGODB_URI_PROD
    ? process.env.MONGODB_URI_PROD  // Use production URI if available
    : process.env.MONGODB_URI || 'mongodb://localhost:27017';
  
  console.log(`Using ${isProd ? 'production' : 'development'} MongoDB URI`);
  
  // For production, ensure we're using the 'memorix' database
  if (isProd) {
    // Always ensure production uses 'memorix' database
    const prodDbName = 'memorix';
    
    // Handle Atlas-style URLs (mongodb+srv://)
    if (baseUri.includes('mongodb+srv://')) {
      const parts = baseUri.split('/');
      const lastPart = parts[parts.length - 1];
      
      if (lastPart.includes('?')) {
        // Has query parameters
        const dbAndParams = lastPart.split('?');
        const params = dbAndParams[1];
        
        // Replace the database name
        parts[parts.length - 1] = prodDbName + '?' + params;
        
        // Also update appName parameter if it exists
        let newUri = parts.join('/');
        if (newUri.includes('appName=')) {
          newUri = newUri.replace(/appName=memorixDev|appName=[^&]+/, 'appName=memorix');
        } else {
          // Add appName if it doesn't exist
          newUri += (newUri.includes('?') ? '&' : '?') + 'appName=memorix';
        }
        
        console.log(`Production URI now uses database: ${prodDbName} with matching appName`);
        return newUri;
      } else {
        // No query parameters
        parts[parts.length - 1] = prodDbName;
        
        // Add appName parameter
        const newUri = parts.join('/') + '?appName=memorix';
        console.log(`Production URI now uses database: ${prodDbName} with matching appName`);
        return newUri;
      }
    }
    
    // For other URI formats, use standard logic but with 'memorix' database
    console.log(`Ensuring production uses database: ${prodDbName}`);
  }
  
  // For Railway/MongoDB Atlas in production, the URI typically includes the database name
  if (isProd && (baseUri.includes('mongodb.railway.internal') || baseUri.includes('mongodb+srv'))) {
    console.log('Using cloud-hosted MongoDB URI');
    
    // Check if a database name is specified in the URI
    const lastSlashIndex = baseUri.lastIndexOf('/');
    const questionMarkIndex = baseUri.indexOf('?', lastSlashIndex);
    
    // If there's a database name in the URI
    if (lastSlashIndex !== -1 && lastSlashIndex < baseUri.length - 1) {
      let dbName;
      if (questionMarkIndex !== -1) {
        dbName = baseUri.substring(lastSlashIndex + 1, questionMarkIndex);
      } else {
        dbName = baseUri.substring(lastSlashIndex + 1);
      }
      
      console.log(`Database name in URI: ${dbName}`);
      
      // If the database name is 'test' (Railway default), replace it with 'memorix'
      if (dbName === 'test') {
        console.log('Replacing default database "test" with "memorix"');
        if (questionMarkIndex !== -1) {
          return baseUri.substring(0, lastSlashIndex + 1) + 'memorix' + baseUri.substring(questionMarkIndex);
        } else {
          return baseUri.substring(0, lastSlashIndex + 1) + 'memorix';
        }
      }
    } else {
      // No database specified, append our database
      console.log('No database specified in URI, appending "memorix"');
      return baseUri + (baseUri.endsWith('/') ? '' : '/') + 'memorix';
    }
    
    return baseUri;
  }
  
  // For other URIs, handle database selection
  const dbName = isProd ? 'memorix' : 'memorixDev';
  console.log(`Connecting to ${isProd ? 'production' : 'development'} database: ${dbName}`);

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
  console.warn('Warning: MongoDB URI does not appear to be a standard MongoDB connection string');
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