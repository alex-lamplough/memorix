import OpenAI from 'openai';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default model configuration
export const DEFAULT_MODEL = 'gpt-4o-mini';
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 2000;

// System prompt for flashcard generation
export const FLASHCARD_SYSTEM_PROMPT = `You are an expert flashcard creator for the Memorix application. Your task is to create high-quality, educational flashcards based on the user's input.

Follow these guidelines when creating flashcards:
1. Create flashcards with clear, concise questions on the front and comprehensive answers on the back
2. Focus on key concepts, facts, definitions, and relationships
3. Make sure each flashcard covers a single concept or idea
4. Use precise language and avoid ambiguity
5. Include relevant examples when appropriate
6. Format your response as a valid JSON array of flashcard objects with 'question' and 'answer' properties

Example format:
[
  {
    "question": "What is the capital of France?",
    "answer": "Paris"
  },
  {
    "question": "Who wrote 'Romeo and Juliet'?",
    "answer": "William Shakespeare"
  }
]`;

// Initialize OpenAI client
let openaiInstance;

/**
 * Initializes the OpenAI client with API key
 */
export const initializeOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('OpenAI API key is missing. Set OPENAI_API_KEY environment variable.');
    process.exit(1);
  }
  
  openaiInstance = new OpenAI({
    apiKey,
  });
  
  logger.debug('OpenAI client initialized successfully');
};

/**
 * Gets the OpenAI client instance
 * @returns {OpenAI} The OpenAI client
 */
export const getOpenAIClient = () => {
  if (!openaiInstance) {
    initializeOpenAI();
  }
  return openaiInstance;
};

// Create a default export object with all exports
export default {
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_MAX_TOKENS,
  FLASHCARD_SYSTEM_PROMPT,
  initializeOpenAI,
  getOpenAIClient
}; 