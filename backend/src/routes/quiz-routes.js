import express from 'express';
import logger from '../utils/logger.js';
import { checkJwt, getUserFromToken, requireCompletedOnboarding } from '../middleware/auth-middleware.js';
import { lookupMongoUser } from '../middleware/user-middleware.js';
import quizController from '../controllers/quiz-controller.js';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth-middleware.js';
import Quiz from '../models/quiz-model.js';
import User from '../models/user-model.js';
import openaiService from '../services/openai-service.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(checkJwt);
router.use(getUserFromToken);
router.use(lookupMongoUser);
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
      
      const User = mongoose.model('User');
      const user = await User.findOne({ auth0Id: req.user.auth0Id });
      if (!user) {
        logger.debug('No user found with Auth0 ID:', { value: req.user.auth0Id });
        // Return empty array instead of error to not break the UI
        return res.json([]);
      }
      
      userId = user._id;
      console.log('Found user by Auth0 ID, using MongoDB ID:', userId);
    }
    
    logger.debug('Get quiz favorites - Final User ID for query:', { value: userId });
    
    // Find all quizzes where the user's ID is in the favorites array
    const favoriteQuizzes = await Quiz.find({
      favorites: userId
    }).populate('userId', 'name picture');
    
    logger.debug(`Found ${favoriteQuizzes.length} favorite quizzes`);
    
    // Format response
    const formattedQuizzes = favoriteQuizzes.map(quiz => ({
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      tags: quiz.tags,
      questionCount: quiz.questions.length,
      difficulty: quiz.difficulty,
      time: quiz.time,
      createdBy: quiz.userId,
      isPublic: quiz.isPublic,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      isFavorite: true
    }));
    
    res.json(formattedQuizzes);
  } catch (error) {
    logger.error('Error getting favorite quizzes:', error);
    // Return empty array instead of error to prevent UI from breaking
    res.json([]);
  }
});

// Route: GET /api/quizzes
// Description: Get all quizzes for the authenticated user
router.get('/', quizController.getAllQuizzes);

// Route: GET /api/quizzes/public
// Description: Get public quizzes with pagination, filtering and search
router.get('/public', quizController.getPublicQuizzes);

// Route: GET /api/quizzes/:id
// Description: Get a specific quiz by ID
router.get('/:id', quizController.getQuizById);

// Route: POST /api/quizzes
// Description: Create a new quiz
router.post('/', quizController.createQuiz);

// Route: PUT /api/quizzes/:id
// Description: Update an existing quiz
router.put('/:id', quizController.updateQuiz);

// Route: DELETE /api/quizzes/:id
// Description: Delete a quiz
router.delete('/:id', quizController.deleteQuiz);

// Toggle favorite status for a quiz
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
    
    logger.debug('Toggle quiz favorite - User ID:', { value: userId });
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Check if quiz is public or belongs to user
    const isOwner = quiz.userId.toString() === req.user.id || 
                   (req.user.mongoUser && quiz.userId.equals(req.user.mongoUser._id));
    
    if (!quiz.isPublic && !isOwner) {
      return res.status(403).json({ 
        error: 'You do not have permission to favorite this private quiz' 
      });
    }
    
    // Update the favorites array
    if (isFavorite) {
      // Add to favorites if not already in array
      if (!quiz.favorites.some(favId => favId.equals(userId))) {
        quiz.favorites.push(userId);
      }
    } else {
      // Remove from favorites
      quiz.favorites = quiz.favorites.filter(
        favUserId => !favUserId.equals(userId)
      );
    }
    
    await quiz.save();
    
    res.json({ 
      success: true,
      isFavorite: isFavorite,
      favorites: quiz.favorites.length
    });
  } catch (error) {
    logger.error('Error toggling favorite status:', error);
    next(error);
  }
});

// Generate quiz questions using AI
router.post('/generate', authenticate(), async (req, res, next) => {
  try {
    const { content, count = 5, difficulty = 'medium' } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    logger.debug(`Generating quiz questions with: content length=${content.length}, count=${count}, difficulty=${difficulty}`);
    
    try {
      // Generate questions using OpenAI
      const questions = await openaiService.generateQuizQuestions(content, count, difficulty);
      
      // Generate a title for the quiz
      const title = await openaiService.generateQuizTitle(content);
      
      // Log success
      logger.debug(`Successfully generated ${questions.length} quiz questions`);
      
      // Return the generated questions and title
      res.json({
        questions,
        title,
        count: questions.length
      });
    } catch (openaiError) {
      logger.error('OpenAI service error:', { value: openaiError.message });
      return res.status(500).json({ 
        error: 'Failed to generate quiz questions',
        message: openaiError.message,
        details: process.env.NODE_ENV === 'development' ? openaiError.stack : undefined
      });
    }
  } catch (error) {
    logger.error('Unexpected error in quiz generation route:', { value: error.message });
    res.status(500).json({ 
      error: 'Failed to generate quiz questions',
      message: error.message 
    });
  }
});

export default router; 