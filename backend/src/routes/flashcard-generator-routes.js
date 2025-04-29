import express from 'express';
import { generateFlashcards, generateTitle } from '../controllers/flashcard-generator-controller.js';
import { authenticate } from '../middleware/auth-middleware.js';
import { rateLimit } from '../middleware/rate-limit-middleware.js';

const router = express.Router();

// Limit generateFlashcards to 10 requests per minute
const flashcardGeneratorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many requests, please try again later' }
});

// Limit generateTitle to 20 requests per minute
const titleGeneratorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many requests, please try again later' }
});

/**
 * @route POST /api/generator/flashcards
 * @desc Generate flashcards from content
 * @access Public for generation, Private for saving
 */
router.post('/flashcards', flashcardGeneratorLimiter, authenticate({ required: false }), generateFlashcards);

/**
 * @route POST /api/generator/title
 * @desc Generate a title for content
 * @access Public
 */
router.post('/title', titleGeneratorLimiter, generateTitle);

export default router; 