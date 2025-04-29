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
const envLocalPath = path.join(__dirname, '../../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocalConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const key in envLocalConfig) {
    process.env[key] = envLocalConfig[key];
  }
}

// Cache for access tokens to avoid too many requests
let managementApiToken = null;
let tokenExpiry = null;

/**
 * Get an access token for the Auth0 Management API
 * @returns {Promise<string|null>} Access token or null if error
 */
export async function getManagementApiToken() {
  // Return cached token if it's still valid
  if (managementApiToken && tokenExpiry && new Date() < tokenExpiry) {
    return managementApiToken;
  }

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_MGMT_CLIENT_ID;
  const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.warn('Missing Auth0 Management API credentials');
    return null;
  }

  try {
    console.log('Requesting Auth0 Management API token...');
    
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
    
    console.log('✅ Successfully obtained Management API token');
    managementApiToken = response.data.access_token;
    tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
    
    return managementApiToken;
  } catch (error) {
    console.error('❌ Error getting Management API token:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', JSON.stringify(error.response.data));
    }
    return null;
  }
}

/**
 * Get user profile from Auth0 Management API
 * @param {string} userId - Auth0 user ID
 * @returns {Promise<Object|null>} User profile or null if error
 */
export async function getUserProfile(userId) {
  try {
    // Get Management API token
    const token = await getManagementApiToken();
    if (!token) {
      console.warn('No Management API token available');
      return null;
    }
    
    console.log(`Fetching user profile for ${userId}`);
    
    const response = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Successfully retrieved user profile');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching user profile:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      if (error.response.status === 429) {
        console.error('Rate limit exceeded - consider caching user profiles');
      }
    }
    return null;
  }
}

/**
 * Get a list of users from Auth0
 * @param {number} page - Page number (0-based)
 * @param {number} perPage - Number of users per page
 * @returns {Promise<Object[]|null>} Array of users or null if error
 */
export async function getUsers(page = 0, perPage = 10) {
  try {
    const token = await getManagementApiToken();
    if (!token) return null;
    
    const response = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching users list:', error.message);
    return null;
  }
}

export default {
  getManagementApiToken,
  getUserProfile,
  getUsers
}; 