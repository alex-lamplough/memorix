import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Setup dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: path.resolve(__dirname, '../../../', envFile) });

// Constants
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_MGMT_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_MGMT_CLIENT_SECRET;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const API_URL = process.env.API_URL || 'https://api.getmemorix.app/api';

/**
 * Get an access token from Auth0
 */
async function getAccessToken() {
  try {
    console.log('Getting Auth0 access token...');
    
    const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: AUTH0_CLIENT_ID,
        client_secret: AUTH0_CLIENT_SECRET,
        audience: AUTH0_AUDIENCE,
        grant_type: 'client_credentials'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get token: ${errorData.error_description || errorData.error || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully got access token');
    return data.access_token;
  } catch (error) {
    console.error('❌ Error getting access token:', error.message);
    return null;
  }
}

/**
 * Test the user creation endpoint
 */
async function testUserCreation() {
  try {
    // Get an Auth0 access token
    const token = await getAccessToken();
    if (!token) {
      console.error('No token available, cannot proceed with test');
      return;
    }
    
    // Make the request to the users/me endpoint
    console.log(`Making request to ${API_URL}/users/me`);
    
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Get full response including headers and status
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log('Response headers:', response.headers.raw());
    
    // Parse the JSON body or get text
    let responseBody;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
      console.log('Response body:', JSON.stringify(responseBody, null, 2));
    } else {
      responseBody = await response.text();
      console.log('Response text:', responseBody);
    }
    
    // Check if successful
    if (response.ok) {
      console.log('✅ Successfully tested user creation');
    } else {
      console.error('❌ Failed to test user creation');
    }
    
    return { status: response.status, body: responseBody };
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return { error: error.message };
  }
}

// Execute the test
console.log('🧪 Testing user creation API...');
console.log('Auth0 Domain:', AUTH0_DOMAIN);
console.log('Auth0 Audience:', AUTH0_AUDIENCE);
console.log('API URL:', API_URL);

testUserCreation()
  .then(result => {
    if (result && !result.error) {
      console.log('\n🎉 Test completed');
    } else {
      console.error('\n❌ Test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 