import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import fs from 'fs';
import { getManagementApiToken, getUserProfile } from '../services/auth0-service.js';

// Import User model directly
import '../models/user-model.js';

// Setup dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from multiple possible locations
function loadEnvFiles() {
  const envFiles = [
    // Root level files
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../../../.env.local'),
    // Backend specific files
    path.resolve(__dirname, '../../../backend/.env'),
    path.resolve(__dirname, '../../../backend/.env.local'),
    // src level files
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../.env.local')
  ];

  console.log('🔍 Searching for environment files...');
  
  const foundFiles = [];
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      console.log(`Found env file: ${file}`);
      dotenv.config({ path: file });
      foundFiles.push(file);
    }
  }
  
  if (foundFiles.length === 0) {
    console.log('❌ No environment files found');
  } else {
    console.log(`✅ Loaded ${foundFiles.length} environment files`);
  }
}

// Load environment variables
loadEnvFiles();

// Define a test user ID from Auth0
const testUserId = process.argv[2]; // Pass Auth0 user ID as argument

if (!testUserId) {
  console.error('❌ Please provide an Auth0 user ID as an argument.');
  console.log('Usage: node backend/src/scripts/debug-auth0-user-creation.js auth0|12345678');
  process.exit(1);
}

// Display all environment variables with AUTH0 in the name (redacted)
console.log('\nCurrent AUTH0 environment variables:');
Object.keys(process.env)
  .filter(key => key.includes('AUTH0'))
  .forEach(key => {
    const value = process.env[key];
    // Show the first 5 chars of secrets
    const displayValue = key.includes('SECRET') 
      ? (value ? `${value.substring(0, 5)}...` : 'not set')
      : (value || 'not set');
    console.log(`${key}: ${displayValue}`);
  });

/**
 * Test the user creation process
 */
async function testUserCreation() {
  try {
    console.log('🔍 Diagnosing Auth0 user creation process');
    console.log('--------------------------------------');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Test User ID: ${testUserId}`);
    
    // Step 1: Check Auth0 environment variables
    console.log('\n📋 Step 1: Checking Auth0 environment variables');
    const requiredVars = [
      'AUTH0_DOMAIN', 
      'AUTH0_CLIENT_ID', 
      'AUTH0_CLIENT_SECRET', 
      'AUTH0_AUDIENCE'
    ];
    
    // Management API variables
    const managementVars = [
      'AUTH0_MGMT_CLIENT_ID',
      'AUTH0_MGMT_CLIENT_SECRET'
    ];
    
    // Check if using regular client credentials for management API
    if (!process.env.AUTH0_MGMT_CLIENT_ID && process.env.AUTH0_CLIENT_ID) {
      console.log('ℹ️ Using regular Auth0 client credentials for Management API');
      process.env.AUTH0_MGMT_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
      process.env.AUTH0_MGMT_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
    }
    
    let missingVars = [];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length > 0) {
      console.error('❌ Missing Auth0 environment variables:');
      missingVars.forEach(v => console.error(`  - ${v}`));
      return;
    }
    
    console.log('✅ All Auth0 environment variables are present');
    
    // Step 2: Test connecting to MongoDB
    console.log('\n📋 Step 2: Testing MongoDB connection');
    let db;
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const mongoUri = isProd && process.env.MONGODB_URI_PROD
        ? process.env.MONGODB_URI_PROD 
        : process.env.MONGODB_URI || 'mongodb://localhost:27017/memorixDev';
      
      console.log(`Connecting to MongoDB ${isProd ? '(PRODUCTION)' : '(DEVELOPMENT)'}: ${mongoUri.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://username:password@')}`);
      
      db = await mongoose.connect(mongoUri);
      console.log('✅ Successfully connected to MongoDB');
      console.log(`Database name: ${db.connection.name}`);
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      return;
    }
    
    // Step 3: Test Auth0 Management API connection
    console.log('\n📋 Step 3: Testing Auth0 Management API connection');
    const token = await getManagementApiToken();
    
    if (!token) {
      console.error('❌ Failed to obtain Auth0 Management API token');
      return;
    }
    
    console.log('✅ Successfully obtained Auth0 Management API token');
    
    // Step 4: Test retrieving user profile from Auth0
    console.log('\n📋 Step 4: Testing retrieving user profile from Auth0');
    const userProfile = await getUserProfile(testUserId);
    
    if (!userProfile) {
      console.error('❌ Failed to retrieve user profile from Auth0');
      return;
    }
    
    console.log('✅ Successfully retrieved user profile from Auth0');
    console.log('User details:');
    console.log(` - Name: ${userProfile.name || 'Not provided'}`);
    console.log(` - Email: ${userProfile.email || 'Not provided'}`);
    console.log(` - Email verified: ${userProfile.email_verified || false}`);
    console.log(` - Created at: ${new Date(userProfile.created_at).toLocaleString()}`);
    
    // Step 5: Test user creation in MongoDB
    console.log('\n📋 Step 5: Testing user creation in MongoDB');
    
    // First, check if User model is properly defined
    try {
      const UserModel = mongoose.model('User');
      console.log('✅ User model is defined');
      
      // Check if user already exists
      const existingUser = await UserModel.findOne({ auth0Id: testUserId });
      
      if (existingUser) {
        console.log('ℹ️ User already exists in the database:');
        console.log(` - MongoDB ID: ${existingUser._id}`);
        console.log(` - Auth0 ID: ${existingUser.auth0Id}`);
        console.log(` - Email: ${existingUser.email}`);
        console.log(` - Created at: ${existingUser.createdAt}`);
      } else {
        console.log('ℹ️ User does not exist in database, attempting to create...');
        
        try {
          // Create user based on Auth0 profile
          const newUser = new UserModel({
            auth0Id: testUserId,
            email: userProfile.email || `${testUserId.replace(/[|]/g, '-')}@memorix-user.com`,
            name: userProfile.name || userProfile.nickname || 'Memorix User',
            picture: userProfile.picture || ''
          });
          
          await newUser.save();
          console.log('✅ Successfully created user in MongoDB');
          console.log(` - MongoDB ID: ${newUser._id}`);
          console.log(` - Email: ${newUser.email}`);
        } catch (error) {
          console.error('❌ Failed to create user in MongoDB:', error.message);
          console.log('Error details:', error);
        }
      }
    } catch (error) {
      console.error('❌ Error with User model:', error.message);
      console.log('This could indicate that the User model is not properly imported or defined');
    }
    
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\n✅ Diagnostics completed');
    
  } catch (error) {
    console.error('\n❌ Error during diagnostics:', error);
  }
}

// Run the test
testUserCreation(); 