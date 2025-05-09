import express from 'express';
import logger from '../utils/logger.js';
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
      logger.debug('Using MongoDB user ID from mongoUser:', { value: userId });
    } else if (req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
      userId = new mongoose.Types.ObjectId(req.user.id);
      logger.debug('Using converted ObjectId from req.user.id:', { value: userId });
    } else {
      // If no valid MongoDB ID found, look up the user by Auth0 ID
      console.log('No valid MongoDB ID available, searching by Auth0 ID:', req.user.auth0Id);
      
      if (!req.user.auth0Id) {
        return res.status(401).json({ error: 'User not authenticated properly' });
      }
      
      const user = await User.findOne({ auth0Id: req.user.auth0Id });
      if (!user) {
        logger.debug('No user found with Auth0 ID:', { value: req.user.auth0Id });
        // Return empty array instead of error to not break the UI
        return res.json([]);
      }
      
      userId = user._id;
      console.log('Found user by Auth0 ID, using MongoDB ID:', userId);
    }
    
    logger.debug('Get favorites - Final User ID for query:', { value: userId });
    
    // Find all flashcard sets where the user's ID is in the favorites array
    const favoriteFlashcardSets = await FlashcardSet.find({
      favorites: userId
    }).populate('userId', 'name picture');
    
    logger.debug(`Found ${favoriteFlashcardSets.length} favorite flashcard sets`);
    
    // Format response
    const formattedSets = favoriteFlashcardSets.map(set => ({
      id: set._id,
      title: set.title,
      description: set.description,
      category: set.category,
      tags: set.tags,
      cardCount: set.cards ? set.cards.length : 0,
      createdBy: set.userId,
      isPublic: set.isPublic,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      isFavorite: true
    }));
    
    res.json(formattedSets);
  } catch (error) {
    logger.error('Error getting favorite flashcard sets:', error);
    // Return empty array instead of error to prevent UI from breaking
    res.json([]);
  }
});

// Get all flashcard sets for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    // Debug logging
    logger.debug('==== FLASHCARD GET REQUEST ====');
    logger.debug('Database name:', { value: mongoose.connection.name });
    logger.debug('User from request:', {
      id: req.user.id,
      auth0Id: req.user.auth0Id
    });
    
    // Add more detailed checking
    if (!req.user || !req.user.id) {
      logger.error('No valid user in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    logger.debug('Finding flashcards with userId:', { value: req.user.id });
    
    const flashcardSets = await FlashcardSet.find({ userId: req.user.id })
      .select('-cards.reviewHistory -cards.hint')
      .sort({ updatedAt: -1 });
    
    logger.debug(`Found ${flashcardSets.length} flashcard sets`);
    
    // If no sets are found, double-check with a looser query
    if (flashcardSets.length === 0) {
      logger.debug('No flashcards found for this user, checking all sets in the database');
      const allSets = await FlashcardSet.find({}).select('_id title userId');
      
      // Add null check to make sure set.cards exists before accessing length
      logger.debug('All sets in database:', allSets.map(set => ({
        id: set._id,
        title: set.title,
        cards: set.cards ? set.cards.length : 0
      })));
      
      // Try to find by Auth0 ID if MongoDB ID approach failed
      logger.debug('Attempting to find user in database by Auth0 ID');
      const dbUser = await User.findOne({ auth0Id: req.user.auth0Id });
      if (dbUser) {
        logger.debug(`Found user in database with ID ${dbUser._id}`);
        logger.debug('Checking if any flashcard sets have this userId');
        
        // Look for flashcards with the found user ID
        const setsByDbUser = await FlashcardSet.find({ userId: dbUser._id })
          .select('-cards.reviewHistory -cards.hint')
          .sort({ updatedAt: -1 });
          
        logger.debug(`Found ${setsByDbUser.length} flashcard sets for database user`);
        
        if (setsByDbUser.length > 0) {
          // If we found flashcards with the database user ID, use them
          const formattedSets = setsByDbUser.map(set => ({
            ...set.toObject(),
            cardCount: set.cards ? set.cards.length : 0,
            progress: set.studyStats.masteryLevel || 0,
            lastStudied: set.studyStats.lastStudied || null,
            // Check if the current user has favorited this set
            isFavorite: set.favorites && Array.isArray(set.favorites) && 
                        set.favorites.some(favId => favId.equals(dbUser._id)),
            cards: undefined
          }));
          
          logger.debug('Returning sets found by database user ID lookup');
          return res.json(formattedSets);
        }
      }
    }
    
    // Transform the response to include card count and formatted study stats
    const formattedSets = flashcardSets.map(set => {
      const setObj = set.toObject();
      return {
        ...setObj,
        cardCount: set.cards ? set.cards.length : 0,
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
    logger.error('Error in flashcard GET route:', error);
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
    
    logger.debug(`Generating flashcards with: content length=${content.length}, count=${count}, difficulty=${difficulty}`);
    
    try {
      // Generate flashcards using OpenAI
      const cards = await openaiService.generateFlashcards(content, count, difficulty);
      
      // Generate a title for the flashcard set
      const title = await openaiService.generateFlashcardSetTitle(content);
      
      // Log success
      logger.debug(`Successfully generated ${cards.length} flashcards`);
      
      // Return the generated flashcards and title
      res.json({
        cards,
        title,
        count: cards.length
      });
    } catch (openaiError) {
      logger.error('OpenAI service error:', openaiError);
      return res.status(500).json({ 
        error: 'Failed to generate flashcards',
        message: openaiError.message,
        details: process.env.NODE_ENV === 'development' ? openaiError.stack : undefined
      });
    }
  } catch (error) {
    logger.error('Unexpected error in flashcard generation route:', error);
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
    logger.debug('Get flashcard permission check:', {
      setUserId: flashcardSet.userId.toString(),
      reqUserId: req.user.id,
      reqUserAuth0Id: req.user.auth0Id,
      isPublic: flashcardSet.isPublic
    });
    
    // Check if the flashcard set is public or belongs to user
    const isOwner = flashcardSet.userId.toString() === req.user.id || 
                   (req.user.mongoUser && flashcardSet.userId.equals(req.user.mongoUser._id));
    
    if (!flashcardSet.isPublic && !isOwner) {
      return res.status(403).json({ error: 'You do not have permission to view this private flashcard set' });
    }
    
    // Check if the user has favorited this set
    let isFavorite = false;
    if (req.user.mongoUser && flashcardSet.favorites.some(id => id.equals(req.user.mongoUser._id))) {
      isFavorite = true;
    } else if (req.user.id && flashcardSet.favorites.some(id => id.toString() === req.user.id)) {
      isFavorite = true;
    }
    
    // Format the response with appropriate fields
    const responseData = {
      id: flashcardSet._id,
      title: flashcardSet.title,
      description: flashcardSet.description,
      category: flashcardSet.category,
      tags: flashcardSet.tags,
      isPublic: flashcardSet.isPublic,
      // Transform cards format
      cards: flashcardSet.cards.map(card => ({
        id: card._id,
        question: card.front,
        answer: card.back,
        hint: card.hint,
        difficulty: card.difficulty,
        lastReviewed: card.lastReviewed,
        nextReviewDate: card.nextReviewDate
      })),
      userId: flashcardSet.userId,
      createdAt: flashcardSet.createdAt,
      updatedAt: flashcardSet.updatedAt,
      // Include study stats and formatting
      progress: flashcardSet.studyStats.masteryLevel || 0,
      studyStats: {
        totalStudySessions: flashcardSet.studyStats.totalStudySessions,
        totalTimeSpent: flashcardSet.studyStats.totalTimeSpent,
        lastStudied: flashcardSet.studyStats.lastStudied,
        masteryLevel: flashcardSet.studyStats.masteryLevel,
      },
      isFavorite
    };
    
    // Include study progress data if the user is the owner
    if (isOwner && flashcardSet.studyProgress) {
      // Convert Maps to objects for the response
      responseData.studyProgress = {
        currentCardIndex: flashcardSet.studyProgress.currentCardIndex,
        studyMode: flashcardSet.studyProgress.studyMode,
        lastUpdated: flashcardSet.studyProgress.lastUpdated,
        // Convert Maps to objects
        learnedCards: Object.fromEntries(flashcardSet.studyProgress.learnedCards || new Map()),
        reviewLaterCards: Object.fromEntries(flashcardSet.studyProgress.reviewLaterCards || new Map()),
      };
    }
    
    res.json(responseData);
  } catch (error) {
    logger.error('Error fetching flashcard set:', error);
    next(error);
  }
});

// Create a new flashcard set
router.post('/', async (req, res, next) => {
  try {
    const { title, description, category, tags, isPublic, cards } = req.body;
    
    // Check if user ID is properly set by the lookupMongoUser middleware
    if (!req.user || !req.user.id) {
      logger.error('User ID not properly set');
      return res.status(401).json({ error: 'User not authenticated or identified' });
    }
    
    console.log(`Creating flashcard set for user ID: ${req.user.id} (Auth0 ID: ${req.user.auth0Id})`);
    
    // Find user by Auth0 ID
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      // Extract user info from Auth0 token
      const userInfo = req.auth;
      
      logger.error('❌ User not found in database when creating flashcard set');
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
    
    logger.debug(`Flashcard set created with ID: ${flashcardSet._id}`);
    
    res.status(201).json(flashcardSet);
  } catch (error) {
    logger.error('Error creating flashcard set:', error);
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
    logger.debug('Update flashcard permission check:', {
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
    logger.error('Error updating flashcard set:', error);
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
    logger.debug('Delete flashcard permission check:', {
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
    logger.error('Error deleting flashcard set:', error);
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
    logger.debug('Study session permission check:', {
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
      const totalCards = flashcardSet.cards ? flashcardSet.cards.length : 0;
      let masteredCards = 0;
      
      flashcardSet.cards && flashcardSet.cards.forEach(card => {
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
        logger.error('Error converting user ID to ObjectId:', { value: e });
        userId = req.user.id; // Use as is if conversion fails
      }
    } else {
      return res.status(401).json({ error: 'User not authenticated properly' });
    }
    
    logger.debug('Toggle favorite - User ID:', { value: userId });
    
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
    logger.error('Error toggling favorite status:', error);
    next(error);
  }
});

// Update detailed study progress for a flashcard set
router.post('/:id/progress', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    logger.debug('Updating study progress:', { 
      setId: id, 
      progressData: Object.keys(progress || {}).length > 0 ? 'Data present' : 'Empty data',
      userId: req.user.id 
    });
    
    // Use findOneAndUpdate with optimistic concurrency control
    const flashcardSet = await FlashcardSet.findById(id);
    
    if (!flashcardSet) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }
    
    // Check if user has permission
    const isOwner = flashcardSet.userId.toString() === req.user.id || 
                   (req.user.mongoUser && flashcardSet.userId.equals(req.user.mongoUser._id));
    
    if (!isOwner) {
      return res.status(403).json({ error: 'You do not have permission to update progress for this flashcard set' });
    }
    
    // Initialize studyProgress if it doesn't exist
    if (!flashcardSet.studyProgress) {
      flashcardSet.studyProgress = {
        currentCardIndex: 0,
        learnedCards: new Map(),
        reviewLaterCards: new Map(),
        studyMode: 'normal',
        sessionHistory: [],
        lastUpdated: new Date()
      };
    }
    
    // Update progress fields only if they're provided
    if (progress.currentCardIndex !== undefined) {
      flashcardSet.studyProgress.currentCardIndex = progress.currentCardIndex;
    }
    
    if (progress.studyMode) {
      flashcardSet.studyProgress.studyMode = progress.studyMode;
    }
    
    // Handle learnedCards: convert from object to Map for storage
    if (progress.learnedCards && Object.keys(progress.learnedCards).length > 0) {
      // Convert object to Map
      const learnedCardsMap = new Map();
      Object.entries(progress.learnedCards).forEach(([key, value]) => {
        learnedCardsMap.set(key, Boolean(value));
      });
      flashcardSet.studyProgress.learnedCards = learnedCardsMap;
      
      // For analytics: update the count of learned cards
      if (flashcardSet.cards && flashcardSet.cards.length > 0) {
        flashcardSet.studyStats.masteryLevel = Math.round((Object.keys(progress.learnedCards).length / flashcardSet.cards.length) * 100);
      }
    }
    
    // Handle reviewLaterCards: convert from object to Map for storage
    if (progress.reviewLaterCards && Object.keys(progress.reviewLaterCards).length > 0) {
      // Convert object to Map
      const reviewLaterCardsMap = new Map();
      Object.entries(progress.reviewLaterCards).forEach(([key, value]) => {
        reviewLaterCardsMap.set(key, Boolean(value));
      });
      flashcardSet.studyProgress.reviewLaterCards = reviewLaterCardsMap;
    }
    
    // Add session history entry only if timeSpent is provided
    if (progress.timeSpent && progress.timeSpent > 0) {
      // If no session history exists, create array
      if (!flashcardSet.studyProgress.sessionHistory) {
        flashcardSet.studyProgress.sessionHistory = [];
      }
      
      // Add new session entry
      flashcardSet.studyProgress.sessionHistory.push({
        date: new Date(),
        timeSpent: progress.timeSpent,
        cardsLearned: progress.learnedCards ? Object.keys(progress.learnedCards).length : 0,
        cardsReviewed: progress.reviewLaterCards ? Object.keys(progress.reviewLaterCards).length : 0,
        completedStatus: progress.studyMode === 'completed' ? 'completed' : 'partial'
      });
      
      // Update overall study stats
      flashcardSet.studyStats.totalTimeSpent += progress.timeSpent;
      flashcardSet.studyStats.totalStudySessions += 1;
      flashcardSet.studyStats.lastStudied = new Date();
    }
    
    // Always update the lastUpdated timestamp
    flashcardSet.studyProgress.lastUpdated = new Date();
    
    // Save with a version check
    await flashcardSet.save();
    
    // Convert Maps back to objects for response, but only include minimal data
    const responseData = {
      currentCardIndex: flashcardSet.studyProgress.currentCardIndex,
      studyMode: flashcardSet.studyProgress.studyMode,
      lastUpdated: flashcardSet.studyProgress.lastUpdated,
      updated: true
    };
    
    res.json({
      message: 'Study progress updated successfully',
      progress: responseData
    });
  } catch (error) {
    logger.error('Error updating study progress:', error);
    
    if (error.name === 'VersionError') {
      // Handle concurrent modification
      res.status(409).json({ error: 'Progress update conflict. Please refresh and try again.' });
    } else {
      next(error);
    }
  }
});

export default router; 