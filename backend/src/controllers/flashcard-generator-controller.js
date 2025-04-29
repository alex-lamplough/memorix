import { OpenAI } from 'openai';
import { config } from '../config/config.js';
import { validateFlashcardRequest } from '../utils/validation.js';

// Initialize OpenAI client with better error handling
let openai;
try {
  // Check if API key is available
  if (!config.openai.apiKey) {
    console.error('⚠️ OpenAI API key is not set. Flashcard generation will fail.');
    console.error('Please set the OPENAI_API_KEY environment variable.');
  } else {
    console.log('🤖 Initializing OpenAI client with API key:', 
      config.openai.apiKey.substring(0, 3) + '...' + config.openai.apiKey.substring(config.openai.apiKey.length - 3));
  }
  
  openai = new OpenAI({
    apiKey: config.openai.apiKey,
  });
} catch (error) {
  console.error('❌ Failed to initialize OpenAI client:', error);
}

/**
 * Generate flashcards from user content
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const generateFlashcards = async (req, res) => {
  try {
    // Check if OpenAI client is properly initialized
    if (!openai || !config.openai.apiKey) {
      console.error('❌ OpenAI client not initialized or API key missing');
      return res.status(500).json({ 
        error: 'OpenAI client not available. Please check server configuration.'
      });
    }
    
    const { content, subject, count = 5, difficulty = 'medium' } = req.body;
    
    // Validate request data
    const validationError = validateFlashcardRequest(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    console.log(`📝 Generating flashcards for: "${content.substring(0, 30)}..."`);
    console.log(`🔢 Count: ${count}, Difficulty: ${difficulty}`);
    
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
    console.log(`🚀 Calling OpenAI API with model: ${config.openai.model}`);
    let response;
    try {
      response = await openai.chat.completions.create({
        model: config.openai.model || "gpt-3.5-turbo", // Fallback model
        messages: [
          { role: "system", content: "You are a helpful AI flashcard generator. You create concise, educational flashcards." },
          { role: "user", content: prompt }
        ],
        temperature: config.openai.temperature || 0.7,
      });
      console.log('✅ OpenAI API response received');
    } catch (apiError) {
      console.error('❌ OpenAI API error:', apiError);
      // Check for common OpenAI errors
      if (apiError.status === 401) {
        return res.status(500).json({ 
          error: 'API authentication error - invalid API key',
          message: 'The server is not properly configured to use OpenAI API'
        });
      } else if (apiError.status === 429) {
        return res.status(429).json({ 
          error: 'API rate limit exceeded',
          message: 'Too many requests to the AI service. Please try again later.'
        });
      } else {
        return res.status(500).json({ 
          error: 'OpenAI API error',
          message: apiError.message || 'An error occurred while calling the AI service'
        });
      }
    }
    
    // Parse the response
    const generatedText = response.choices[0].message.content;
    let flashcards;
    
    try {
      // Attempt to parse JSON from the response
      flashcards = extractJsonFromResponse(generatedText);
      console.log(`✅ Successfully parsed ${flashcards.length} flashcards`);
    } catch (err) {
      console.error('❌ Error parsing OpenAI response:', err);
      console.error('Raw response:', generatedText);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: generatedText
      });
    }
    
    // Return the flashcards
    return res.status(200).json({
      cards: flashcards, // Use 'cards' key for consistency with frontend
      title: subject || `Flashcards: ${content.substring(0, 20)}...`,
      count: flashcards.length,
      difficulty
    });
    
  } catch (error) {
    console.error('❌ Flashcard generation error:', error);
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
    // Check if OpenAI client is properly initialized
    if (!openai || !config.openai.apiKey) {
      console.error('❌ OpenAI client not initialized or API key missing');
      return res.status(500).json({ 
        error: 'OpenAI client not available. Please check server configuration.'
      });
    }
    
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
    console.error('❌ Title generation error:', error);
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
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('Failed to parse JSON array match:', err);
    }
  }
  
  // Try to parse the entire response as JSON
  try {
    return JSON.parse(text);
  } catch (err) {
    // One more attempt: Sometimes the model adds extra text before/after the JSON
    try {
      // Look for anything that looks like a JSON object or array
      const possibleJson = text.match(/(\{.*\}|\[.*\])/s);
      if (possibleJson) {
        return JSON.parse(possibleJson[0]);
      }
    } catch (innerErr) {
      console.error('Failed all JSON parsing attempts');
    }
    
    // If all attempts fail, throw an error
    throw new Error('Could not extract valid JSON from the AI response');
  }
}

export default {
  generateFlashcards,
  generateTitle
}; 