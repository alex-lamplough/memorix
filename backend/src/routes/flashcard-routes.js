import express from 'express';
import mongoose from 'mongoose';
import { checkJwt, getUserFromToken, requireCompletedOnboarding } from '../middleware/auth-middleware.js';
import { lookupMongoUser } from '../middleware/user-middleware.js';
import FlashcardSet from '../models/flashcard-set-model.js';
import User from '../models/user-model.js';
import openaiService from '../services/openai-service.js';
import { authenticate } from '../middleware/auth-middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(checkJwt);
router.use(getUserFromToken);
// Add the MongoDB user lookup middleware to get proper user._id
router.use(lookupMongoUser);
// Enforce onboarding completion for all flashcard routes
router.use(requireCompletedOnboarding);

// Get all favorites for current user
router.get('/favorites', authenticate(), lookupMongoUser, async (req, res, next) => {
  try {
    // Fix: Get user ID safely
    let userId;
    if (req.user.mongoUser && req.user.mongoUser._id) {
      userId = req.user.mongoUser._id;
      console.log('Using MongoDB user ID from mongoUser:', userId);
    } else if (req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
      userId = new mongoose.Types.ObjectId(req.user.id);
      console.log('Using converted ObjectId from req.user.id:', userId);
    } else {
      // If no valid MongoDB ID found, look up the user by Auth0 ID
      console.log('No valid MongoDB ID available, searching by Auth0 ID:', req.user.auth0Id);
      
      if (!req.user.auth0Id) {
        return res.status(401).json({ error: 'User not authenticated properly' });
      }
      
      const user = await User.findOne({ auth0Id: req.user.auth0Id });
      if (!user) {
        console.log('No user found with Auth0 ID:', req.user.auth0Id);
        // Return empty array instead of error to not break the UI
        return res.json([]);
      }
      
      userId = user._id;
      console.log('Found user by Auth0 ID, using MongoDB ID:', userId);
    }
    
    console.log('Get favorites - Final User ID for query:', userId);
    
    // Find all flashcard sets where the user's ID is in the favorites array
    const favoriteFlashcardSets = await FlashcardSet.find({
      favorites: userId
    }).populate('userId', 'name picture');
    
    console.log(`Found ${favoriteFlashcardSets.length} favorite flashcard sets`);
    
    // Format response
    const formattedSets = favoriteFlashcardSets.map(set => ({
      id: set._id,
      title: set.title,
      description: set.description,
      category: set.category,
      tags: set.tags,
      cardCount: set.cards.length,
      createdBy: set.userId,
      isPublic: set.isPublic,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      isFavorite: true
    }));
    
    res.json(formattedSets);
  } catch (error) {
    console.error('Error getting favorite flashcard sets:', error);
    // Return empty array instead of error to prevent UI from breaking
    res.json([]);
  }
});

// Get all flashcard sets for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    // Debug logging
    console.log('==== FLASHCARD GET REQUEST ====');
    console.log('Database name:', mongoose.connection.name);
    console.log('User from request:', {
      id: req.user.id,
      auth0Id: req.user.auth0Id
    });
    
    // Add more detailed checking
    if (!req.user || !req.user.id) {
      console.error('No valid user in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    console.log('Finding flashcards with userId:', req.user.id);
    
    const flashcardSets = await FlashcardSet.find({ userId: req.user.id })
      .select('-cards.reviewHistory -cards.hint')
      .sort({ updatedAt: -1 });
    
    console.log(`Found ${flashcardSets.length} flashcard sets`);
    
    // If no sets are found, double-check with a looser query
    if (flashcardSets.length === 0) {
      console.log('No flashcards found for this user, checking all sets in the database');
      const allSets = await FlashcardSet.find({}).select('_id title userId');
      console.log('All sets in database:', JSON.stringify(allSets.map(set => ({
        id: set._id,
        title: set.title,
        userId: set.userId
      }))));
      
      // Try to find by Auth0 ID if MongoDB ID approach failed
      console.log('Attempting to find user in database by Auth0 ID');
      const dbUser = await User.findOne({ auth0Id: req.user.auth0Id });
      if (dbUser) {
        console.log(`Found user in database with ID ${dbUser._id}`);
        console.log('Checking if any flashcard sets have this userId');
        
        // Look for flashcards with the found user ID
        const setsByDbUser = await FlashcardSet.find({ userId: dbUser._id })
          .select('-cards.reviewHistory -cards.hint')
          .sort({ updatedAt: -1 });
          
        console.log(`Found ${setsByDbUser.length} flashcard sets for database user`);
        
        if (setsByDbUser.length > 0) {
          // If we found flashcards with the database user ID, use them
          const formattedSets = setsByDbUser.map(set => ({
            ...set.toObject(),
            cardCount: set.cards.length,
            progress: set.studyStats.masteryLevel || 0,
            lastStudied: set.studyStats.lastStudied || null,
            // Check if the current user has favorited this set
            isFavorite: set.favorites && Array.isArray(set.favorites) && 
                        set.favorites.some(favId => favId.equals(dbUser._id)),
            cards: undefined
          }));
          
          console.log('Returning sets found by database user ID lookup');
          return res.json(formattedSets);
        }
      }
    }
    
    // Transform the response to include card count and formatted study stats
    const formattedSets = flashcardSets.map(set => {
      const setObj = set.toObject();
      return {
        ...setObj,
        cardCount: set.cards.length,
        progress: set.studyStats.masteryLevel || 0,
        lastStudied: set.studyStats.lastStudied || null,
        // Check if the current user has favorited this set
        isFavorite: set.favorites && Array.isArray(set.favorites) && 
                    set.favorites.some(favId => favId.equals(req.user.id)),
        // Don't send full card content to reduce payload size
        cards: undefined
      };
    });
    
    res.json(formattedSets);
  } catch (error) {
    console.error('Error in flashcard GET route:', error);
    next(error);
  }
});

// Get public flashcard sets
router.get('/public', async (req, res, next) => {
  try {
    const { limit = 20, page = 1, category, search } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isPublic: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const flashcardSets = await FlashcardSet.find(query)
      .select('-cards')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 })
      .populate('userId', 'name picture');
    
    const total = await FlashcardSet.countDocuments(query);
    
    res.json({
      data: flashcardSets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Generate flashcards using OpenAI - protected, only for authenticated users
router.post('/generate', async (req, res, next) => {
  try {
    const { content, count = 5, difficulty = 'intermediate' } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    console.log(`Generating flashcards with: content length=${content.length}, count=${count}, difficulty=${difficulty}`);
    
    try {
      // Generate flashcards using OpenAI
      const cards = await openaiService.generateFlashcards(content, count, difficulty);
      
      // Generate a title for the flashcard set
      const title = await openaiService.generateFlashcardSetTitle(content);
      
      // Log success
      console.log(`Successfully generated ${cards.length} flashcards`);
      
      // Return the generated flashcards and title
      res.json({
        cards,
        title,
        count: cards.length
      });
    } catch (openaiError) {
      console.error('OpenAI service error:', openaiError);
      return res.status(500).json({ 
        error: 'Failed to generate flashcards',
        message: openaiError.message,
        details: process.env.NODE_ENV === 'development' ? openaiError.stack : undefined
      });
    }
  } catch (error) {
    console.error('Unexpected error in flashcard generation route:', error);
    res.status(500).json({ 
      error: 'Failed to generate flashcards',
      message: error.message 
    });
  }
});

// Get a single flashcard set by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const flashcardSet = await FlashcardSet.findById(id);
    
    if (!flashcardSet) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }
    
    // Log for debugging
    console.log('Get flashcard permission check:', {
      setUserId: flashcardSet.userId.toString(),
      reqUserId: req.user.id,
      reqUserAuth0Id: req.user.auth0Id,
      isPublic: flashcardSet.isPublic
    });
    
    // Check if user has permission to view this set
    // Allow access if set is public or user is the owner
    const isOwner = flashcardSet.userId.toString() === req.user.id || 
                   (req.user.mongoUser && flashcardSet.userId.equals(req.user.mongoUser._id));
    
    if (!flashcardSet.isPublic && !isOwner) {
      return res.status(403).json({ error: 'You do not have permission to view this flashcard set' });
    }
    
    // Add isFavorite flag before sending response
    const responseObj = flashcardSet.toObject();
    responseObj.isFavorite = flashcardSet.favorites && Array.isArray(flashcardSet.favorites) && 
                             flashcardSet.favorites.some(favId => 
                               req.user.mongoUser ? 
                               favId.equals(req.user.mongoUser._id) : 
                               favId.equals(req.user.id)
                             );

    res.json(responseObj);
  } catch (error) {
    console.error('Error getting flashcard set:', error);
    next(error);
  }
});

// Create a new flashcard set
router.post('/', async (req, res, next) => {
  try {
    const { title, description, category, tags, isPublic, cards } = req.body;
    
    // Check if user ID is properly set by the lookupMongoUser middleware
    if (!req.user || !req.user.id) {
      console.error('User ID not properly set');
      return res.status(401).json({ error: 'User not authenticated or identified' });
    }
    
    console.log(`Creating flashcard set for user ID: ${req.user.id} (Auth0 ID: ${req.user.auth0Id})`);
    
    // Find user by Auth0 ID
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      // Extract user info from Auth0 token
      const userInfo = req.auth;
      
      console.error('❌ User not found in database when creating flashcard set');
      return res.status(404).json({ error: 'User not found. Please try logging in again.' });
    }
    
    // Create new flashcard set with the correct MongoDB user ID
    const flashcardSet = await FlashcardSet.create({
      title,
      description,
      category,
      tags,
      isPublic,
      cards,
      userId: user._id // Use the MongoDB _id, not Auth0 ID
    });
    
    console.log(`Flashcard set created with ID: ${flashcardSet._id}`);
    
    res.status(201).json(flashcardSet);
  } catch (error) {
    console.error('Error creating flashcard set:', error);
    next(error);
  }
});

// Update a flashcard set
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, isPublic, cards } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const flashcardSet = await FlashcardSet.findById(id);
    
    if (!flashcardSet) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }
    
    // Log for debugging
    console.log('Update flashcard permission check:', {
      setUserId: flashcardSet.userId.toString(),
      reqUserId: req.user.id,
      reqUserAuth0Id: req.user.auth0Id
    });
    
    // Check if user has permission to update this set
    // Support both MongoDB ObjectId and Auth0 ID for permission check
    const isOwner = flashcardSet.userId.toString() === req.user.id || 
                   (req.user.mongoUser && flashcardSet.userId.equals(req.user.mongoUser._id));
    
    if (!isOwner) {
      return res.status(403).json({ error: 'You do not have permission to update this flashcard set' });
    }
    
    // Update flashcard set
    const updatedFlashcardSet = await FlashcardSet.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        tags,
        isPublic,
        cards,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json(updatedFlashcardSet);
  } catch (error) {
    console.error('Error updating flashcard set:', error);
    next(error);
  }
});

// Delete a flashcard set
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const flashcardSet = await FlashcardSet.findById(id);
    
    if (!flashcardSet) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }
    
    // Log for debugging
    console.log('Delete flashcard permission check:', {
      setUserId: flashcardSet.userId.toString(),
      reqUserId: req.user.id,
      reqUserAuth0Id: req.user.auth0Id
    });
    
    // Check if user has permission to delete this set
    // Support both MongoDB ObjectId and Auth0 ID for permission check
    const isOwner = flashcardSet.userId.toString() === req.user.id || 
                   (req.user.mongoUser && flashcardSet.userId.equals(req.user.mongoUser._id));
    
    if (!isOwner) {
      return res.status(403).json({ error: 'You do not have permission to delete this flashcard set' });
    }
    
    await FlashcardSet.findByIdAndDelete(id);
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting flashcard set:', error);
    next(error);
  }
});

// Record study session for a flashcard set
router.post('/:id/study', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { timeSpent, cardReviews } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const flashcardSet = await FlashcardSet.findById(id);
    
    if (!flashcardSet) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }
    
    // Log for debugging
    console.log('Study session permission check:', {
      setUserId: flashcardSet.userId.toString(),
      reqUserId: req.user.id,
      reqUserAuth0Id: req.user.auth0Id
    });
    
    // Check if user has permission
    // Support both MongoDB ObjectId and Auth0 ID for permission check
    const isOwner = flashcardSet.userId.toString() === req.user.id || 
                   (req.user.mongoUser && flashcardSet.userId.equals(req.user.mongoUser._id));
    
    if (!isOwner) {
      return res.status(403).json({ error: 'You do not have permission to record study for this flashcard set' });
    }
    
    // Update study stats
    flashcardSet.studyStats.totalStudySessions += 1;
    flashcardSet.studyStats.totalTimeSpent += timeSpent;
    flashcardSet.studyStats.lastStudied = new Date();
    
    // Update cards with review data if provided
    if (cardReviews && Array.isArray(cardReviews)) {
      cardReviews.forEach(review => {
        const card = flashcardSet.cards.id(review.cardId);
        if (card) {
          card.lastReviewed = new Date();
          // Calculate next review date based on performance
          const daysToAdd = review.performance <= 2 ? 1 : (review.performance <= 4 ? 3 : 7);
          const nextReviewDate = new Date();
          nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);
          
          card.nextReviewDate = nextReviewDate;
          card.reviewHistory.push({
            date: new Date(),
            performance: review.performance,
            timeSpent: review.timeSpent
          });
        }
      });
      
      // Calculate mastery level based on review history
      const totalCards = flashcardSet.cards.length;
      let masteredCards = 0;
      
      flashcardSet.cards.forEach(card => {
        const history = card.reviewHistory || [];
        // Consider a card mastered if it has at least 3 reviews with performance > 3
        if (history.filter(h => h.performance > 3).length >= 3) {
          masteredCards++;
        }
      });
      
      // Update mastery level (0-100%)
      flashcardSet.studyStats.masteryLevel = Math.round((masteredCards / totalCards) * 100);
    }
    
    await flashcardSet.save();
    
    res.json(flashcardSet.studyStats);
  } catch (error) {
    next(error);
  }
});

// Toggle favorite status for a flashcard set
router.patch('/:id/favorite', authenticate(), lookupMongoUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isFavorite } = req.body;
    
    // Fix: Get user ID safely
    let userId;
    if (req.user.mongoUser && req.user.mongoUser._id) {
      userId = req.user.mongoUser._id;
    } else if (req.user.id) {
      // Try to convert string ID to ObjectId if needed
      try {
        userId = new mongoose.Types.ObjectId(req.user.id);
      } catch (e) {
        console.error('Error converting user ID to ObjectId:', e);
        userId = req.user.id; // Use as is if conversion fails
      }
    } else {
      return res.status(401).json({ error: 'User not authenticated properly' });
    }
    
    console.log('Toggle favorite - User ID:', userId);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const flashcardSet = await FlashcardSet.findById(id);
    if (!flashcardSet) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }
    
    // Check if flashcard set is public or belongs to user
    const isOwner = flashcardSet.userId.toString() === req.user.id || 
                   (req.user.mongoUser && flashcardSet.userId.equals(req.user.mongoUser._id));
    
    if (!flashcardSet.isPublic && !isOwner) {
      return res.status(403).json({ 
        error: 'You do not have permission to favorite this private flashcard set' 
      });
    }
    
    // Update the favorites array
    if (isFavorite) {
      // Add to favorites if not already in array
      if (!flashcardSet.favorites.some(favId => favId.equals(userId))) {
        flashcardSet.favorites.push(userId);
      }
    } else {
      // Remove from favorites
      flashcardSet.favorites = flashcardSet.favorites.filter(
        favUserId => !favUserId.equals(userId)
      );
    }
    
    await flashcardSet.save();
    
    res.json({ 
      success: true,
      isFavorite: isFavorite,
      favorites: flashcardSet.favorites.length
    });
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    next(error);
  }
});

export default router; 