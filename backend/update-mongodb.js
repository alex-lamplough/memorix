import fs from 'fs';
import logger from './utils/logger';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

// Read current .env file, or create if it doesn't exist
const updateEnvFile = (mongoUri) => {
  let envContent = '';
  
  try {
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
  } catch (err) {
    logger.error('Error reading .env file:', { value: err });
  }

  // Parse existing content into key-value pairs
  const envVars = {};
  if (envContent) {
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          envVars[key] = value;
        }
      }
    });
  }

  // Update or add MONGODB_URI
  envVars['MONGODB_URI'] = mongoUri;

  // Convert back to string format
  let newEnvContent = '';
  for (const [key, value] of Object.entries(envVars)) {
    newEnvContent += `${key}=${value}\n`;
  }

  // Write to .env file
  fs.writeFileSync(envPath, newEnvContent);
  logger.debug('✅ .env file updated successfully with MongoDB URI');
};

logger.debug('📋 This utility will update your MongoDB connection string in the .env file.');
logger.debug('🔗 Please enter your Railway MongoDB connection string:');

rl.question('MongoDB URI: ', (mongoUri) => {
  if (!mongoUri) {
    logger.debug('❌ No MongoDB URI provided. Exiting without changes.');
    rl.close();
    return;
  }
  
  updateEnvFile(mongoUri);
  logger.debug('🚀 Your MongoDB connection is set up! Run "npm run dev" to start the server.');
  rl.close();
}); 