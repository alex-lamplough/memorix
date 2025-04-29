import express from 'express';
import mongoose from 'mongoose';
import { checkJwt, getUserFromToken } from '../middleware/auth-middleware.js';
import FlashcardSet from '../models/flashcard-set-model.js';
import User from '../models/user-model.js';
import openaiService from '../services/openai-service.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(checkJwt);
router.use(getUserFromToken);

// Get all flashcard sets for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const flashcardSets = await FlashcardSet.find({ userId: req.user.id })
      .select('-cards')
      .sort({ updatedAt: -1 });
    
    res.json(flashcardSets);
  } catch (error) {
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
    
    // Check if user has permission to view this set
    if (!flashcardSet.isPublic && flashcardSet.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to view this flashcard set' });
    }
    
    res.json(flashcardSet);
  } catch (error) {
    next(error);
  }
});

// Create a new flashcard set
router.post('/', async (req, res, next) => {
  try {
    const { title, description, category, tags, isPublic, cards } = req.body;
    
    // Find or create user
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      // Extract user info from Auth0 token
      const userInfo = req.auth;
      
      // Create new user
      user = await User.create({
        auth0Id: req.user.auth0Id,
        email: userInfo.email || 'unknown@email.com',
        name: userInfo.name || 'Anonymous User',
        nickname: userInfo.nickname,
        picture: userInfo.picture
      });
    }
    
    // Create new flashcard set
    const flashcardSet = await FlashcardSet.create({
      title,
      description,
      category,
      tags,
      isPublic,
      cards,
      userId: user._id
    });
    
    res.status(201).json(flashcardSet);
  } catch (error) {
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
    
    // Check if user has permission to update this set
    if (flashcardSet.userId.toString() !== req.user.id) {
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
    
    // Check if user has permission to delete this set
    if (flashcardSet.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this flashcard set' });
    }
    
    await FlashcardSet.findByIdAndDelete(id);
    
    res.status(204).end();
  } catch (error) {
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
    
    // Check if user has permission
    if (flashcardSet.userId.toString() !== req.user.id) {
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

export default router; 