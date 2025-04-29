import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Set up dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
const envPath = path.resolve(__dirname, '../../../', envFile);
dotenv.config({ path: envPath });

// Check required environment variables
const requiredEnvVars = [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_AUDIENCE'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Error: Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`- ${varName}`));
  console.error(`Please ensure these are defined in your ${envFile} file.`);
  process.exit(1);
}

/**
 * Test obtaining an access token from Auth0
 */
async function testAuth0Authentication() {
  console.log('🔑 Testing Auth0 Authentication...');
  console.log('--------------------------------------');

  try {
    // Get token for machine-to-machine communication
    const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: process.env.AUTH0_AUDIENCE,
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(`Failed to get token: ${errorData.error_description || errorData.error || 'Unknown error'}`);
    }

    const tokenData = await tokenResponse.json();
    
    console.log('✅ Successfully obtained access token');
    console.log('Token type:', tokenData.token_type);
    console.log('Expires in:', tokenData.expires_in, 'seconds');
    console.log('Scope:', tokenData.scope || 'No specific scope');
    
    // Show first and last 5 characters of the token for verification
    const token = tokenData.access_token;
    const tokenPreview = `${token.substring(0, 5)}...${token.substring(token.length - 5)}`;
    console.log('Token preview:', tokenPreview);
    
    // Validate token by making a request to the /userinfo endpoint with a test user token
    // This would require an actual user token, not a client credentials token
    console.log('\n⚠️ Note: To test a user token, you would need to implement the authorization code flow');
    console.log('   This script only tests obtaining a machine-to-machine access token.');
    
    return tokenData.access_token;
  } catch (error) {
    console.error('❌ Error testing Auth0 authentication:', error.message);
    return null;
  }
}

// Execute the test
testAuth0Authentication()
  .then(token => {
    if (token) {
      console.log('\n🎉 Auth0 authentication test completed successfully');
    } else {
      console.error('\n❌ Auth0 authentication test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }); 