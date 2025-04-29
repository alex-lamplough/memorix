#!/usr/bin/env node

/**
 * This script helps update the .env file with the Railway MongoDB URI
 * Run it with: node backend/update-env.js
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

// Path to .env file
const envFilePath = path.join(__dirname, '.env');

// Read current .env file
if (!fs.existsSync(envFilePath)) {
  console.error('❌ .env file not found in backend directory. Please create one first.');
  process.exit(1);
}

const envContent = fs.readFileSync(envFilePath, 'utf8');
let updatedContent = envContent;

console.log('🔧 Update MongoDB connection string in .env file');
console.log('Current content:');
console.log(envContent);
console.log('\n');

rl.question('Enter your Railway MongoDB URI: ', (mongoUri) => {
  if (!mongoUri) {
    console.log('❌ No URI provided. Exiting without changes.');
    rl.close();
    return;
  }
  
  // Update the MongoDB URI
  const dbEnvRegex = /MONGODB_URI=.*/;
  updatedContent = updatedContent.replace(dbEnvRegex, `MONGODB_URI=${mongoUri}`);
  
  // Write the updated content back to the file
  fs.writeFileSync(envFilePath, updatedContent);
  
  console.log('✅ .env file updated successfully!');
  console.log('✅ MongoDB URI has been updated.');
  
  rl.close();
}); 