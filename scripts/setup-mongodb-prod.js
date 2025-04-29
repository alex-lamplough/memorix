import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Setup dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Ask a question and return the answer
 * @param {string} question - The question to ask
 * @returns {Promise<string>} - The answer
 */
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

/**
 * Main function to set up MongoDB production URI
 */
async function setupMongoDBProd() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│   Memorix MongoDB Production Configuration   │');
  console.log('└─────────────────────────────────────────────┘');
  console.log('This script will help you set up a separate MongoDB URI for production.');
  console.log('');

  // Determine env file path
  const envPath = path.resolve(__dirname, '../.env.local');
  let envVars = {};

  // Load existing env vars if file exists
  if (fs.existsSync(envPath)) {
    const envData = fs.readFileSync(envPath, 'utf8');
    envData.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length === 2) {
        envVars[parts[0].trim()] = parts[1].trim();
      }
    });
    console.log('✅ Loaded existing .env.local file');
  } else {
    console.log('⚠️ No existing .env.local file found. Creating a new one.');
  }

  // Show current MONGODB_URI if exists
  if (envVars.MONGODB_URI) {
    console.log(`\nCurrent development MongoDB URI: ${
      envVars.MONGODB_URI.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://username:password@')
    }`);
  }

  // Show current MONGODB_URI_PROD if exists
  if (envVars.MONGODB_URI_PROD) {
    console.log(`Current production MongoDB URI: ${
      envVars.MONGODB_URI_PROD.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://username:password@')
    }`);
  }

  console.log('\nPlease enter your production MongoDB connection string');
  console.log('Examples:');
  console.log('- MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/memorix');
  console.log('- Railway: mongodb://mongo:password@mongodb.railway.internal:27017/memorix');
  console.log('');
  
  const mongoURI = await askQuestion('Production MongoDB URI: ');
  
  if (!mongoURI) {
    console.log('❌ No URI provided. Exiting without changes.');
    rl.close();
    return;
  }

  // Validate URI format
  if (!(mongoURI.startsWith('mongodb://') || mongoURI.startsWith('mongodb+srv://'))) {
    console.log('❌ Invalid MongoDB URI format. URI must start with mongodb:// or mongodb+srv://');
    rl.close();
    return;
  }

  // Update env vars
  envVars.MONGODB_URI_PROD = mongoURI;

  // Write to file
  let envContent = '';
  for (const [key, value] of Object.entries(envVars)) {
    envContent += `${key}=${value}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Successfully updated .env.local with MONGODB_URI_PROD');
  console.log('\nTo test your production MongoDB connection, run:');
  console.log('  npm run test:mongodb:prod');

  rl.close();
}

// Run the setup
setupMongoDBProd(); 