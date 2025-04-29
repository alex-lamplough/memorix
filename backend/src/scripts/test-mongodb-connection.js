import { connectToMongoDB, disconnectFromMongoDB, getMongoConnectionString } from '../db/mongodb.js';

/**
 * Test MongoDB connection and display connection details
 */
async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Connection...');
  console.log('--------------------------------------');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  try {
    // Get actual connection string that will be used
    const actualConnectionString = getMongoConnectionString();
    const redactedActualUri = actualConnectionString.replace(
      /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 
      'mongodb$1://username:password@'
    );
    
    // Attempt to connect to MongoDB
    const db = await connectToMongoDB();
    
    console.log('\n📊 MongoDB Connection Details:');
    console.log('--------------------------------------');
    console.log(`Database name: ${db.name}`);
    console.log(`Connection state: ${db.readyState === 1 ? 'connected' : 'not connected'}`);
    
    // Safely check MongoDB version and host info
    try {
      // Different MongoDB driver versions have different object structures
      let mongoVersion = 'Unknown';
      if (db.db.serverConfig?.s?.options?.serverApi) {
        mongoVersion = '5+';
      } else if (db.db.serverConfig?.isMongoClient) {
        mongoVersion = '4+';
      } else if (db.db.serverConfig) {
        mongoVersion = '3+';
      }
      console.log(`MongoDB version: ${mongoVersion}`);
      
      // Try to get host information safely
      let host = 'Unknown';
      if (db.db.serverConfig?.s?.options?.srvHost) {
        host = db.db.serverConfig.s.options.srvHost;
      } else if (db.db.serverConfig?.s?.options?.host) {
        host = db.db.serverConfig.s.options.host;
      } else if (db.db.serverConfig?.host) {
        host = db.db.serverConfig.host;
      }
      console.log(`Host: ${host}`);
    } catch (err) {
      console.log('Unable to determine MongoDB version and host details');
    }
    
    // Show actual connection URI used (redacted for security)
    console.log(`Connection URI: ${redactedActualUri}`);
    
    // List all collections
    try {
      const collections = await db.db.listCollections().toArray();
      console.log('\n📁 Collections:');
      if (collections.length > 0) {
        collections.forEach(collection => {
          console.log(`- ${collection.name}`);
        });
      } else {
        console.log('No collections found in this database');
      }
    } catch (err) {
      console.log('Unable to list collections:', err.message);
    }
    
    // Disconnect when done
    await disconnectFromMongoDB();
    console.log('\n✅ Test completed successfully');
    
  } catch (error) {
    console.error('\n❌ MongoDB connection test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testMongoDBConnection(); 