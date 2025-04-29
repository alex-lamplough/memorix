import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Also load .env.local if it exists
const envLocalPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envLocalPath)) {
  const envLocalConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const key in envLocalConfig) {
    process.env[key] = envLocalConfig[key];
  }
  console.log('✅ Loaded variables from .env');
}

// Use variables from command line arguments if provided
const clientId = process.argv[2] || process.env.AUTH0_MGMT_CLIENT_ID;
const clientSecret = process.argv[3] || process.env.AUTH0_MGMT_CLIENT_SECRET;
const domain = process.argv[4] || process.env.AUTH0_DOMAIN;

console.log('\n🔐 Testing Auth0 Management API credentials:');
console.log(`Domain: ${domain}`);
console.log(`Client ID: ${clientId ? clientId.substring(0, 5) + '...' : 'Not set'}`);
console.log(`Client Secret: ${clientSecret ? '******' : 'Not set'}`);

// Function to get an Auth0 management token
async function getManagementToken() {
  try {
    console.log('\n📡 Requesting Auth0 Management API token...');
    
    const response = await axios.post(
      `https://${domain}/oauth/token`,
      {
        client_id: clientId,
        client_secret: clientSecret,
        audience: `https://${domain}/api/v2/`,
        grant_type: 'client_credentials'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Successfully obtained Management API token!');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Error getting Management API token:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error details:', error.response.data);
    } else {
      console.error(error.message);
    }
    return null;
  }
}

// Function to get users list as a test
async function getUsers(token) {
  try {
    console.log('\n📡 Testing token by fetching users...');
    
    const response = await axios.get(
      `https://${domain}/api/v2/users?page=0&per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Successfully retrieved users!');
    console.log(`Total users retrieved: ${response.data.length}`);
    
    // Print user details (safely)
    response.data.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`- ID: ${user.user_id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Name: ${user.name || 'Not set'}`);
      console.log(`- Created: ${user.created_at}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching users:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error details:', error.response.data);
    } else {
      console.error(error.message);
    }
    return null;
  }
}

// Run the test
async function runTest() {
  try {
    // Check if we have all required credentials
    if (!clientId || !clientSecret || !domain) {
      console.error('\n❌ Missing required Auth0 credentials!');
      console.error('Please provide credentials in .env.local or as command line arguments:');
      console.error('node src/scripts/test-auth0-credentials.js CLIENT_ID CLIENT_SECRET DOMAIN');
      return;
    }
    
    // Get a token
    const token = await getManagementToken();
    if (!token) {
      return;
    }
    
    // Try to get users
    await getUsers(token);
    
    console.log('\n🎉 Auth0 Management API test completed successfully!');
    console.log('Your application should be able to retrieve user profiles now.');
  } catch (error) {
    console.error('\n❌ An unexpected error occurred:', error.message);
  }
}

runTest(); 