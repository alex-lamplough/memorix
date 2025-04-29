import { getOpenAIClient, DEFAULT_MODEL, FLASHCARD_SYSTEM_PROMPT } from '../config/openaiConfig.js';
import { validateFlashcardRequest, sanitizeInput } from '../utils/validation.js';
import logger from '../utils/logger.js';

/**
 * Generates flashcards based on the provided content or subject
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateFlashcards = async (req, res) => {
  try {
    // Validate the request
    const { isValid, error } = validateFlashcardRequest(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, error });
    }

    const { content, subject, count = 5, difficulty = 'medium' } = req.body;
    
    // Sanitize inputs to prevent injection attacks
    const sanitizedContent = content ? sanitizeInput(content) : null;
    const sanitizedSubject = subject ? sanitizeInput(subject) : null;
    
    // Construct user prompt based on available inputs
    let userPrompt = '';
    if (sanitizedContent) {
      userPrompt = `Generate ${count} flashcards about the following content: ${sanitizedContent}`;
    } else {
      userPrompt = `Generate ${count} flashcards about ${sanitizedSubject}`;
    }
    
    // Add difficulty to the prompt
    userPrompt += ` at a ${difficulty} difficulty level.`;
    
    // Call OpenAI API
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: FLASHCARD_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
    });
    
    // Extract and parse the response
    const rawOutput = response.choices[0].message.content.trim();
    let flashcards;
    
    try {
      // Parse the JSON response
      flashcards = JSON.parse(rawOutput);
      
      // Ensure the response is an array
      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each flashcard has question and answer
      for (const card of flashcards) {
        if (!card.question || !card.answer) {
          throw new Error('Invalid flashcard format');
        }
      }
    } catch (error) {
      logger.error('Failed to parse flashcards:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate valid flashcards' 
      });
    }
    
    // Return the flashcards
    return res.status(200).json({
      success: true,
      data: {
        flashcards,
        count: flashcards.length,
        difficulty
      }
    });
    
  } catch (error) {
    logger.error('Flashcard generation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate flashcards',
      message: error.message
    });
  }
};

/**
 * Saves generated flashcards to user's collection
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const saveFlashcards = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    // Validate flashcards array
    const { flashcards, deckName } = req.body;
    
    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flashcards data'
      });
    }
    
    if (!deckName || typeof deckName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Deck name is required'
      });
    }
    
    // Here you would typically save to database
    // This is a placeholder for the database operation
    // db.saveFlashcards(userId, deckName, flashcards);
    
    return res.status(201).json({
      success: true,
      message: 'Flashcards saved successfully',
      data: {
        deckName,
        count: flashcards.length
      }
    });
    
  } catch (error) {
    logger.error('Save flashcards error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save flashcards',
      message: error.message
    });
  }
};

export default {
  generateFlashcards,
  saveFlashcards
}; 