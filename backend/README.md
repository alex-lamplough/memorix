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

- `PORT` - The port the server runs on (default: 3000)
- `NODE_ENV` - The environment (development, production)
- `MONGODB_URI` - MongoDB connection string
- `AUTH0_AUDIENCE` - Auth0 API audience
- `AUTH0_DOMAIN` - Auth0 domain
- `OPENAI_API_KEY` - OpenAI API key
- `CORS_ORIGIN` - Frontend origin for CORS

## Deployment

For production deployment (e.g., on Railway), make sure to set all the environment variables in your hosting platform. 