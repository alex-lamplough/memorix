#!/usr/bin/env node

/**
 * This script helps create a .env.local file with Auth0 credentials.
 * Run it with: node scripts/create-env.js
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define the environment variables we need
const envVars = [
  {
    name: 'VITE_AUTH0_DOMAIN',
    description: 'Your Auth0 domain (e.g. dev-xyz123.us.auth0.com)',
    default: ''
  },
  {
    name: 'VITE_AUTH0_CLIENT_ID',
    description: 'Your Auth0 client ID',
    default: ''
  },
  {
    name: 'VITE_AUTH0_AUDIENCE',
    description: 'Your Auth0 API audience (optional)',
    default: ''
  },
  {
    name: 'VITE_API_URL',
    description: 'Your API URL (optional)',
    default: 'http://localhost:3000/api'
  },
  {
    name: 'VITE_ENV',
    description: 'Environment',
    default: 'development'
  }
];

// Path to .env.local file
const envFilePath = path.join(__dirname, '..', '.env.local');

// Check if file already exists
if (fs.existsSync(envFilePath)) {
  rl.question('⚠️ .env.local already exists. Overwrite? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      createEnvFile();
    } else {
      console.log('❌ Operation cancelled.');
      rl.close();
    }
  });
} else {
  createEnvFile();
}

// Function to create the .env.local file
function createEnvFile() {
  console.log('🔐 Creating .env.local file for secure credential storage');
  console.log('Please enter your Auth0 credentials:');
  
  let envFileContent = '# Auth0 Configuration - Generated on ' + new Date().toISOString() + '\n';
  let currentVar = 0;

  // Ask for each environment variable
  function askForVar() {
    if (currentVar >= envVars.length) {
      // We've got all the variables, write the file
      fs.writeFileSync(envFilePath, envFileContent);
      
      console.log('✅ .env.local file created successfully!');
      console.log('🔒 Your credentials are now stored securely.');
      console.log('👉 Note: This file is in .gitignore and will not be committed to your repository.');
      console.log('\n⚠️ IMPORTANT: These credentials are used only in development mode.');
      console.log('For production deployment, set these environment variables in your hosting platform.');
      console.log('If deploying to Railway, set these variables in your project settings.');
      rl.close();
      return;
    }

    const variable = envVars[currentVar];
    const defaultText = variable.default ? ` (default: "${variable.default}")` : '';
    
    rl.question(`${variable.name}: ${variable.description}${defaultText}: `, (value) => {
      // Use default if nothing entered and default exists
      const finalValue = value.trim() || variable.default;
      
      // Add to env file content
      envFileContent += `${variable.name}=${finalValue}\n`;
      
      // Move to next variable
      currentVar++;
      askForVar();
    });
  }

  // Start asking
  askForVar();
} 