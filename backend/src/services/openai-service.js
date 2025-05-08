import OpenAI from 'openai';
import logger from '../utils/logger.js';

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate flashcards from content using OpenAI
 * @param {string} content - The text content to generate flashcards from
 * @param {number} count - Number of flashcards to generate (default: 5)
 * @param {string} complexity - Complexity level: 'beginner', 'intermediate', 'advanced' (default: 'intermediate')
 * @returns {Promise<Array>} - Array of flashcard objects with front (question) and back (answer)
 */
export async function generateFlashcards(content, count = 5, complexity = 'intermediate') {
  try {
    // Input validation
    if (!content || typeof content !== 'string') {
      throw new Error('Content must be a non-empty string');
    }
    
    count = Math.min(Math.max(parseInt(count) || 5, 1), 20); // Limit between 1-20 cards
    
    const validComplexities = ['beginner', 'intermediate', 'advanced'];
    if (!validComplexities.includes(complexity)) {
      complexity = 'intermediate';
    }
    
    // Define the system prompt for flashcard generation
    const systemPrompt = `You are an expert educator specializing in creating effective educational flashcards.
Your task is to generate ${count} high-quality flashcards from the provided content.
Each flashcard should have:
1. A concise question/prompt (front)
2. A clear, comprehensive answer (back)

The flashcards should be at ${complexity} level.
- Beginner: Focus on fundamental concepts, definitions, and basic relationships.
- Intermediate: Cover moderate complexity, relationships between concepts, and practical applications.
- Advanced: Include complex details, edge cases, and deeper analysis.

Format your response as a valid JSON with a structure like this:
{
  "cards": [
    {
      "front": "Question or prompt",
      "back": "Answer or explanation"
    },
    ...
  ]
}
IMPORTANT: Make sure to wrap the array in a JSON object with the "cards" key.`;

    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Extract and parse the response
    const responseText = completion.choices[0].message.content;
    let parsedResponse;
    
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (error) {
      logger.error('Failed to parse JSON response:', error);
      throw new Error('Invalid JSON response from OpenAI');
    }
    
    // Handle both possible formats - array directly or wrapped in cards property
    let cards;
    if (Array.isArray(parsedResponse)) {
      // If the response is an array directly
      cards = parsedResponse;
    } else if (parsedResponse.cards && Array.isArray(parsedResponse.cards)) {
      // If the response has a cards property with an array
      cards = parsedResponse.cards;
    } else {
      // Try to find an array property if neither format matches
      const arrayProps = Object.keys(parsedResponse).filter(key => 
        Array.isArray(parsedResponse[key]) && parsedResponse[key].length > 0
      );
      
      if (arrayProps.length > 0) {
        cards = parsedResponse[arrayProps[0]];
      } else {
        throw new Error('Could not find flashcards array in OpenAI response');
      }
    }
    
    // Validate flashcards
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      throw new Error('No valid flashcards found in OpenAI response');
    }
    
    // Map the response to our flashcard model format
    return cards.map(card => ({
      front: card.front || card.question || '',
      back: card.back || card.answer || '',
      difficulty: 3, // Default difficulty level
      lastReviewed: null,
      nextReviewDate: null,
      reviewHistory: []
    }));
  } catch (error) {
    logger.error('Error generating flashcards:', error);
    throw error;
  }
}

/**
 * Generate a title for a flashcard set based on its content
 * @param {string} content - The text content the flashcards are based on
 * @returns {Promise<string>} - Generated title
 */
export async function generateFlashcardSetTitle(content) {
  try {
    // Input validation
    if (!content || typeof content !== 'string') {
      throw new Error('Content must be a non-empty string');
    }
    
    // Generate a concise title
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Generate a concise, descriptive title (maximum 60 characters) for a flashcard set based on the following content. Return only the title, nothing else." 
        },
        { role: "user", content: content.slice(0, 1000) } // Limit to first 1000 chars
      ],
      temperature: 0.7,
      max_tokens: 20
    });
    
    return completion.choices[0].message.content.trim();
  } catch (error) {
    logger.error('Error generating flashcard set title:', error);
    throw error;
  }
}

/**
 * Generate quiz questions using OpenAI
 * @param {string} content - The text content to generate quiz questions from
 * @param {number} count - Number of questions to generate (default: 5)
 * @param {string} difficulty - Difficulty level: 'easy', 'medium', 'hard' (default: 'medium')
 * @returns {Promise<Array>} - Array of question objects with question, options, and correctAnswer
 */
export async function generateQuizQuestions(content, count = 5, difficulty = 'medium') {
  try {
    // Input validation
    if (!content || typeof content !== 'string') {
      throw new Error('Content must be a non-empty string');
    }
    
    count = Math.min(Math.max(parseInt(count) || 5, 1), 15); // Limit between 1-15 questions
    
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      difficulty = 'medium';
    }
    
    // Define the system prompt for quiz question generation
    const systemPrompt = `You are an expert educator specializing in creating engaging educational quizzes.
Your task is to generate ${count} high-quality multiple-choice quiz questions from the provided content.
Each question should have:
1. A clear and concise question
2. 4 possible options (for multiple-choice questions)
3. An indicator of which option is correct (as the index: 0, 1, 2, or 3)

The questions should be at ${difficulty} difficulty level.
- Easy: Focus on direct facts and straightforward information from the content.
- Medium: Require some analysis, connections between concepts, and moderate critical thinking.
- Hard: Challenge students with complex relationships, deeper analysis, and critical reasoning.

Format your response as a valid JSON with a structure like this:
{
  "questions": [
    {
      "type": "multiple",
      "question": "The clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2
    },
    ...
  ]
}
IMPORTANT: Make sure to wrap the array in a JSON object with the "questions" key.
The correctAnswer should be the index (0-3) of the correct option.`;

    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Extract and parse the response
    const responseText = completion.choices[0].message.content;
    let parsedResponse;
    
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (error) {
      logger.error('Failed to parse JSON response:', error);
      throw new Error('Invalid JSON response from OpenAI');
    }
    
    // Handle both possible formats - array directly or wrapped in questions property
    let questions;
    if (Array.isArray(parsedResponse)) {
      // If the response is an array directly
      questions = parsedResponse;
    } else if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
      // If the response has a questions property with an array
      questions = parsedResponse.questions;
    } else {
      // Try to find an array property if neither format matches
      const arrayProps = Object.keys(parsedResponse).filter(key => 
        Array.isArray(parsedResponse[key]) && parsedResponse[key].length > 0
      );
      
      if (arrayProps.length > 0) {
        questions = parsedResponse[arrayProps[0]];
      } else {
        throw new Error('Could not find questions array in OpenAI response');
      }
    }
    
    // Validate questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new Error('No valid questions found in OpenAI response');
    }
    
    // Map the response to our quiz question format
    return questions.map(question => ({
      type: question.type || 'multiple',
      question: question.question || '',
      options: question.options || [],
      correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : 0
    }));
  } catch (error) {
    logger.error('Error generating quiz questions:', error);
    throw error;
  }
}

/**
 * Generate a title for a quiz based on its content
 * @param {string} content - The text content the quiz is based on
 * @returns {Promise<string>} - Generated title
 */
export async function generateQuizTitle(content) {
  try {
    // Input validation
    if (!content || typeof content !== 'string') {
      throw new Error('Content must be a non-empty string');
    }
    
    // Generate a concise title
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Generate a concise, engaging title (maximum 60 characters) for a quiz based on the following content. Return only the title, nothing else." 
        },
        { role: "user", content: content.slice(0, 1000) } // Limit to first 1000 chars
      ],
      temperature: 0.7,
      max_tokens: 20
    });
    
    return completion.choices[0].message.content.trim();
  } catch (error) {
    logger.error('Error generating quiz title:', error);
    throw error;
  }
}

export default {
  generateFlashcards,
  generateFlashcardSetTitle,
  generateQuizQuestions,
  generateQuizTitle
}; 