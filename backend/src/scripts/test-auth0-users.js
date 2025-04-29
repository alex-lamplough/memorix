import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ManagementClient } from 'auth0';

// Setup dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? path.resolve(__dirname, '../../../.env') 
  : path.resolve(__dirname, '../../../.env.local');

dotenv.config({ path: envFile });

// Check for required Auth0 environment variables
const requiredVars = [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_AUDIENCE'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

console.log('✅ All required Auth0 environment variables are set');

// Initialize Auth0 Management API client
const auth0 = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  audience: process.env.AUTH0_AUDIENCE || `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
  scope: 'read:users'
});

async function testAuth0Users() {
  try {
    console.log('🔑 Connecting to Auth0 Management API...');
    
    // Try to get users (limited to 5)
    const users = await auth0.users.getAll({
      page: 0,
      per_page: 5,
      include_totals: true
    });
    
    console.log(`✅ Successfully connected to Auth0 Management API`);
    console.log(`📊 Total users: ${users.total}`);
    console.log('\n👤 First 5 users:');
    
    users.users.forEach((user, index) => {
      console.log(`\n----- User ${index + 1} -----`);
      console.log(`ID: ${user.user_id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name || 'Not provided'}`);
      console.log(`Last Login: ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}`);
      console.log(`Logins Count: ${user.logins_count || 0}`);
    });
    
  } catch (error) {
    console.error('❌ Error connecting to Auth0 Management API:');
    
    if (error.statusCode === 401) {
      console.error('Authentication failed. Check your AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET.');
    } else if (error.statusCode === 403) {
      console.error('Authorization failed. Ensure your application has the required scopes (read:users).');
    } else {
      console.error(error.message || error);
    }
    
    process.exit(1);
  }
}

// Run the test
testAuth0Users(); 