import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ManagementClient } from 'auth0';

// Setup dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.local';

dotenv.config({ 
  path: path.resolve(__dirname, '../../../../', envFile) 
});

console.log(`Testing Auth0 credentials in ${process.env.NODE_ENV || 'development'} environment`);
console.log(`Using environment file: ${envFile}`);

// Check if required Auth0 environment variables are set
const requiredEnvVars = [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_AUDIENCE'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  process.exit(1);
}

console.log('✅ All required Auth0 environment variables are set');

// Test Auth0 Management API connection
const auth0 = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
  scope: 'read:users update:users create:users'
});

// Test retrieving users
console.log('Testing Auth0 Management API connection...');
auth0.getUsers({ per_page: 1, page: 0 })
  .then(users => {
    console.log('✅ Successfully connected to Auth0 Management API');
    console.log(`Retrieved ${users.length} user(s) from Auth0`);
    console.log('Auth0 configuration is working correctly');
  })
  .catch(error => {
    console.error('❌ Failed to connect to Auth0 Management API:');
    console.error(error.message);
    
    if (error.message.includes('invalid_client')) {
      console.error('\nPossible issues:');
      console.error('- Client ID or Client Secret is incorrect');
      console.error('- The application does not have the required API permissions');
    }
    
    if (error.message.includes('unauthorized')) {
      console.error('\nPossible issues:');
      console.error('- The Management API audience is incorrect');
      console.error('- The application does not have the required scopes');
    }
    
    console.error('\nVerify your Auth0 credentials in the Auth0 dashboard and update your environment variables.');
    process.exit(1);
  }); 