import { OpenAI } from 'openai';
import { config } from '../config/config.js';
import { validateFlashcardRequest } from '../utils/validation.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Generate flashcards from user content
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const generateFlashcards = async (req, res) => {
  try {
    const { content, subject, count = 5, difficulty = 'medium' } = req.body;
    
    // Validate request data
    const validationError = validateFlashcardRequest(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    // Prepare the prompt for OpenAI
    const prompt = `
Generate ${count} high-quality flashcards about "${subject}" based on the following content:
"""
${content}
"""

Difficulty level: ${difficulty}

Format each flashcard as a JSON object with "question" and "answer" fields.
Return an array of these objects.
    `.trim();
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: "system", content: "You are a helpful AI flashcard generator. You create concise, educational flashcards." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });
    
    // Parse the response
    const generatedText = response.choices[0].message.content;
    let flashcards;
    
    try {
      // Attempt to parse JSON from the response
      flashcards = extractJsonFromResponse(generatedText);
    } catch (err) {
      console.error('Error parsing OpenAI response:', err);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: generatedText
      });
    }
    
    // Return the flashcards
    return res.status(200).json({
      flashcards,
      subject,
      count: flashcards.length,
      difficulty
    });
    
  } catch (error) {
    console.error('Flashcard generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate flashcards',
      message: error.message
    });
  }
};

/**
 * Generate a title for a flashcard deck
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const generateTitle = async (req, res) => {
  try {
    const { content, subject } = req.body;
    
    if (!content && !subject) {
      return res.status(400).json({ 
        error: 'Either content or subject is required to generate a title'
      });
    }
    
    // Prepare the prompt
    const prompt = `
Generate a concise, engaging title for a flashcard deck about ${subject || 'the following content'}:
${!subject ? `"""
${content}
"""` : ''}

The title should be memorable and accurately represent the subject matter.
Respond with just the title text, no additional formatting or explanation.
    `.trim();
    
    // Call OpenAI API with a small model for cost efficiency
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful title generator. Create concise, catchy titles." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 50
    });
    
    const title = response.choices[0].message.content.trim();
    
    return res.status(200).json({ title });
    
  } catch (error) {
    console.error('Title generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate title',
      message: error.message
    });
  }
};

/**
 * Extract JSON from the OpenAI response text
 * @param {string} text - The raw text response from OpenAI
 * @returns {Array} The parsed JSON array of flashcards
 */
function extractJsonFromResponse(text) {
  // Try to find JSON array in the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  // If no array is found, try to parse the entire response as JSON
  try {
    return JSON.parse(text);
  } catch (err) {
    // If both attempts fail, throw an error
    throw new Error('Could not extract valid JSON from the AI response');
  }
}

export default {
  generateFlashcards,
  generateTitle
}; 