import express from 'express';
import mongoose from 'mongoose';
import FlashcardSet from '../models/flashcard-set-model.js';
import Quiz from '../models/quiz-model.js';

const router = express.Router();

// These routes are all public and don't require authentication

// Get public flashcards
router.get('/flashcards', async (req, res, next) => {
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
      .select('-cards.reviewHistory -cards.hint')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 })
      .populate('userId', 'name picture');
    
    const total = await FlashcardSet.countDocuments(query);
    
    // Format the response
    const formattedSets = flashcardSets.map(set => ({
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
      favoriteCount: set.favorites ? set.favorites.length : 0,
      views: set.views || 0
    }));
    
    res.json(formattedSets);
  } catch (error) {
    console.error('Error fetching public flashcards:', error);
    next(error);
  }
});

// Get public quizzes
router.get('/quizzes', async (req, res, next) => {
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
    
    const quizzes = await Quiz.find(query)
      .select('-questions.explanation -questions.answers.isCorrect')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 })
      .populate('userId', 'name picture');
    
    const total = await Quiz.countDocuments(query);
    
    // Format the response
    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      tags: quiz.tags,
      questionCount: quiz.questions ? quiz.questions.length : 0,
      difficulty: quiz.difficulty,
      time: quiz.time,
      createdBy: quiz.userId,
      isPublic: quiz.isPublic,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      favoriteCount: quiz.favorites ? quiz.favorites.length : 0, 
      views: quiz.views || 0
    }));
    
    res.json(formattedQuizzes);
  } catch (error) {
    console.error('Error fetching public quizzes:', error);
    next(error);
  }
});

// Get a single public flashcard set
router.get('/flashcards/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const flashcardSet = await FlashcardSet.findById(id)
      .populate('userId', 'name picture');
    
    if (!flashcardSet) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }
    
    // Check if set is public
    if (!flashcardSet.isPublic) {
      return res.status(403).json({ error: 'This flashcard set is not public' });
    }
    
    // Increment view count
    flashcardSet.views = (flashcardSet.views || 0) + 1;
    await flashcardSet.save();
    
    res.json(flashcardSet);
  } catch (error) {
    console.error('Error getting public flashcard set:', error);
    next(error);
  }
});

// Get a single public quiz
router.get('/quizzes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const quiz = await Quiz.findById(id)
      .populate('userId', 'name picture');
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Check if quiz is public
    if (!quiz.isPublic) {
      return res.status(403).json({ error: 'This quiz is not public' });
    }
    
    // Increment view count
    quiz.views = (quiz.views || 0) + 1;
    await quiz.save();
    
    res.json(quiz);
  } catch (error) {
    console.error('Error getting public quiz:', error);
    next(error);
  }
});

export default router; 