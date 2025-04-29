import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Load .env.local if it exists
const envLocalPath = path.join(__dirname, '../../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
  console.log('✅ Loaded environment variables from .env.local');
}

// Define user schema
const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  picture: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Define flashcard set schema
const flashcardSetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  userId: { type: String, required: true },
  cards: [{
    front: { type: String, required: true },
    back: { type: String, required: true },
    hint: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastStudied: { type: Date }
});

const FlashcardSet = mongoose.model('FlashcardSet', flashcardSetSchema);

// Sample data
const sampleUser = {
  auth0Id: 'auth0|test123456789',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
};

const sampleFlashcardSet = {
  title: 'Example Flashcard Set',
  description: 'This is a sample flashcard set for testing',
  userId: 'auth0|test123456789',
  cards: [
    {
      front: 'What is MongoDB?',
      back: 'MongoDB is a NoSQL document database',
      hint: 'Think about database types'
    },
    {
      front: 'What is React?',
      back: 'React is a JavaScript library for building user interfaces',
      hint: 'Frontend framework'
    }
  ]
};

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    
    // Log database info
    console.log(`Database name: ${mongoose.connection.name}`);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Create test data
async function createTestData() {
  try {
    const db = await connectToMongoDB();
    
    // Check existing data
    const usersCount = await User.countDocuments();
    const flashcardSetsCount = await FlashcardSet.countDocuments();
    
    console.log(`Existing users: ${usersCount}`);
    console.log(`Existing flashcard sets: ${flashcardSetsCount}`);
    
    if (usersCount === 0) {
      console.log('Creating test user...');
      const newUser = new User(sampleUser);
      await newUser.save();
      console.log('✅ Test user created');
    } else {
      console.log('Users already exist, skipping user creation');
    }
    
    if (flashcardSetsCount === 0) {
      console.log('Creating test flashcard set...');
      const newFlashcardSet = new FlashcardSet(sampleFlashcardSet);
      await newFlashcardSet.save();
      console.log('✅ Test flashcard set created');
    } else {
      console.log('Flashcard sets already exist, skipping creation');
    }
    
    // Log data after creation
    const users = await User.find();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });
    
    const flashcardSets = await FlashcardSet.find();
    console.log('Flashcard sets in database:');
    flashcardSets.forEach(set => {
      console.log(`- ${set.title} (${set.cards.length} cards)`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

// Run the function
createTestData(); 