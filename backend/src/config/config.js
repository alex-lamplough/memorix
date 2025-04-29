/**
 * Main application configuration
 */

// Server configuration
const serverConfig = {
  port: process.env.PORT || 3000,
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

// Default configuration for OpenAI
const openaiDefaults = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2048,
  apiKey: process.env.OPENAI_API_KEY
};

// Export the complete config
export const config = {
  server: serverConfig,
  database: dbConfig,
  openai: openaiDefaults
};

// Also export a default for modules that might use default import
export default config; 