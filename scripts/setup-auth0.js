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
 * Main function to set up Auth0 environment variables
 */
async function setupAuth0() {
  console.log('┌─────────────────────────────────┐');
  console.log('│   Memorix Auth0 Configuration   │');
  console.log('└─────────────────────────────────┘');
  console.log('This script will help you set up Auth0 environment variables.');
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

  console.log('\nPlease enter your Auth0 credentials from your Auth0 dashboard:');
  console.log('');
  
  // Auth0 Domain
  const domain = await askQuestion('Auth0 Domain (e.g. dev-abc123.us.auth0.com): ');
  if (domain) envVars.AUTH0_DOMAIN = domain;
  
  // Auth0 Client ID (regular web app)
  const clientId = await askQuestion('Auth0 Client ID (regular web application): ');
  if (clientId) envVars.AUTH0_CLIENT_ID = clientId;
  
  // Auth0 Client Secret
  const clientSecret = await askQuestion('Auth0 Client Secret: ');
  if (clientSecret) envVars.AUTH0_CLIENT_SECRET = clientSecret;
  
  // Auth0 API Audience
  const audience = await askQuestion('Auth0 API Audience (e.g. https://api.memorix.com): ');
  if (audience) envVars.AUTH0_AUDIENCE = audience;
  
  console.log('\nNext, enter credentials for the Auth0 Management API:');
  console.log('You need to create a Machine-to-Machine application in Auth0 with access to the Management API');
  console.log('');
  
  // Auth0 Management API Client ID
  const mgmtClientId = await askQuestion('Auth0 Management API Client ID: ');
  if (mgmtClientId) envVars.AUTH0_MGMT_CLIENT_ID = mgmtClientId;
  
  // Auth0 Management API Client Secret
  const mgmtClientSecret = await askQuestion('Auth0 Management API Client Secret: ');
  if (mgmtClientSecret) envVars.AUTH0_MGMT_CLIENT_SECRET = mgmtClientSecret;

  // Write to file
  let envContent = '';
  for (const [key, value] of Object.entries(envVars)) {
    envContent += `${key}=${value}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Successfully updated .env.local with Auth0 configuration');
  console.log('\nTo test your Auth0 configuration, run:');
  console.log('  npm run test:auth0');

  rl.close();
}

// Run the setup
setupAuth0(); 