# Memorix Backend API

This is the backend API for the Memorix flashcard application. It provides endpoints for managing flashcard sets, user data, and AI-powered flashcard generation.

## Technology Stack

- **Node.js** with Express.js
- **MongoDB** for database
- **Auth0** for authentication
- **OpenAI API** for AI-powered features

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Auth0 account
- OpenAI API key

### Installation

1. Clone the repository and navigate to the backend directory
   ```
   cd backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file based on `env.example`
   ```
   cp env.example .env
   ```

4. Update the `.env` file with your credentials

5. Start the development server
   ```
   npm run dev
   ```

## API Endpoints

### Health Check

- `GET /api/health` - Check if the API is running

### Flashcard Sets

- `GET /api/flashcards` - Get all flashcard sets for the authenticated user
- `GET /api/flashcards/public` - Get public flashcard sets
- `GET /api/flashcards/:id` - Get a specific flashcard set
- `POST /api/flashcards` - Create a new flashcard set
- `PUT /api/flashcards/:id` - Update a flashcard set
- `DELETE /api/flashcards/:id` - Delete a flashcard set
- `POST /api/flashcards/:id/study` - Record a study session for a flashcard set

### User

- `GET /api/users/me` - Get the current user's profile
- `PUT /api/users/me` - Update the current user's profile
- `GET /api/users/me/stats` - Get the current user's statistics

### AI Features

- `POST /api/ai/generate-flashcards` - Generate flashcards from text
- `POST /api/ai/enhance-flashcards` - Enhance existing flashcards with hints
- `POST /api/ai/generate-summary` - Generate a topic summary for a flashcard set

## MongoDB Schema

The database has two main collections:

1. **Users** - Stores user information
2. **FlashcardSets** - Stores flashcard sets with embedded flashcards

## Authentication

Authentication is handled through Auth0. All API endpoints require a valid Auth0 JWT token, which should be included in the Authorization header as a Bearer token.

## Environment Variables

The following environment variables need to be set:

- `PORT` - The port the server runs on (default: 5001)
- `NODE_ENV` - The environment (development, production)
- `MONGODB_URI` - MongoDB connection string
- `AUTH0_AUDIENCE` - Auth0 API audience
- `AUTH0_DOMAIN` - Auth0 domain
- `OPENAI_API_KEY` - OpenAI API key
- `CORS_ORIGIN` - Frontend origin for CORS

## Deployment

For production deployment (e.g., on Railway), make sure to set all the environment variables in your hosting platform.

## Activities API Implementation Plan

The frontend currently has a client-side implementation for activities that:
1. Attempts to fetch from a `/activities` endpoint
2. Falls back to generating activities from flashcard/quiz data if the endpoint doesn't exist

### Implementation Steps

1. Create ActivityModel schema:
```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    enum: ['flashcard', 'quiz'],
    required: true
  },
  actionType: {
    type: String,
    enum: ['create', 'study', 'complete', 'update'],
    required: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('Activity', ActivitySchema);
```

2. Create activity routes:
```javascript
// routes/activities.js
const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

// Get user activities with filtering options
router.get('/', auth, async (req, res) => {
  try {
    const { type, action, startDate, endDate, limit = 100, sort = 'newest' } = req.query;
    
    // Build query
    const query = { userId: req.user.id };
    
    // Filter by item type
    if (type) {
      query.itemType = type;
    }
    
    // Filter by action type
    if (action) {
      query.actionType = action;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Build sort
    const sortOptions = sort === 'newest' ? { timestamp: -1 } : { timestamp: 1 };
    
    // Execute query
    const activities = await Activity.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit));
    
    res.json(activities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Log new activity
router.post('/', auth, async (req, res) => {
  try {
    const { title, itemType, actionType, itemId, metadata } = req.body;
    
    const activity = new Activity({
      userId: req.user.id,
      title,
      itemType,
      actionType,
      itemId,
      metadata
    });
    
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    console.error('Error logging activity:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
```

3. Add activity logging to existing endpoints:
   - Add logging in flashcard creation/update/delete endpoints
   - Add logging in quiz creation/completion/update endpoints
   - Add logging in study session endpoints

4. Update server.js to include the activities routes:
```javascript
// In server.js
app.use('/api/activities', require('./routes/activities'));
```

### Implementation Notes

1. This implementation will track activities in a dedicated collection
2. Activities will be generated by the server when actions happen
3. Client should keep the fallback mechanism for backward compatibility
4. For existing data, a migration script can backfill activities based on existing flashcard and quiz data

### Benefits

1. Proper server-side tracking of user activities
2. Improved search and filtering capabilities
3. Foundation for analytics and insights features
4. More accurate activity history 