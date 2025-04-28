import express from 'express';
import { checkJwt, getUserFromToken } from '../middleware/auth-middleware.js';
import { generateFlashcards, enhanceFlashcards, generateTopicSummary } from '../utils/openai-service.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(checkJwt);
router.use(getUserFromToken);

// Generate flashcards from text
router.post('/generate-flashcards', async (req, res, next) => {
  try {
    const { prompt, numberOfCards = 5 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Limit number of cards to prevent abuse
    const limitedCards = Math.min(numberOfCards, 20);
    
    const flashcards = await generateFlashcards(prompt, limitedCards);
    
    res.json({ flashcards });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    next(error);
  }
});

// Enhance existing flashcards with hints
router.post('/enhance-flashcards', async (req, res, next) => {
  try {
    const { flashcards } = req.body;
    
    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(400).json({ error: 'Valid flashcards array is required' });
    }
    
    // Limit number of cards to prevent abuse
    const limitedFlashcards = flashcards.slice(0, 20);
    
    const enhancedFlashcards = await enhanceFlashcards(limitedFlashcards);
    
    res.json({ flashcards: enhancedFlashcards });
  } catch (error) {
    console.error('Error enhancing flashcards:', error);
    next(error);
  }
});

// Generate topic summary for flashcard set
router.post('/generate-summary', async (req, res, next) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const summary = await generateTopicSummary(topic);
    
    res.json(summary);
  } catch (error) {
    console.error('Error generating topic summary:', error);
    next(error);
  }
});

export default router; 