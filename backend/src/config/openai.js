/**
 * OpenAI configuration settings
 */
export const openaiConfig = {
  /**
   * OpenAI API key, pulled from environment variables
   */
  apiKey: process.env.OPENAI_API_KEY,
  
  /**
   * Default model to use for flashcard generation
   */
  flashcardModel: 'gpt-4-turbo',
  
  /**
   * Default temperature for flashcard generation
   * Higher values mean more creative/varied outputs
   */
  flashcardTemperature: 0.7,
  
  /**
   * Default model to use for title generation
   */
  titleModel: 'gpt-3.5-turbo',
  
  /**
   * Default temperature for title generation
   */
  titleTemperature: 0.6,
  
  /**
   * Maximum tokens to generate for flashcards
   */
  maxFlashcardTokens: 2048,
  
  /**
   * Maximum tokens to generate for titles
   */
  maxTitleTokens: 256,
  
  /**
   * Timeout for API requests in milliseconds
   */
  timeout: 60000,
  
  /**
   * Default flashcards to generate if count not specified
   */
  defaultFlashcardCount: 10
};

/**
 * Builds system message for flashcard generation
 * @param {Object} options - Options for prompt construction
 * @returns {string} Formatted system message
 */
export const buildFlashcardSystemMessage = ({ subject, difficulty = 'medium', count = 10 }) => {
  return `You are an educational assistant that creates high-quality flashcards for studying.
Generate ${count} flashcards about ${subject} at a ${difficulty} difficulty level.
Format your response as a valid JSON array of objects, each with 'question' and 'answer' properties.
Each flashcard should be concise and focus on a single concept.
Questions should be clear and specific.
Answers should be comprehensive but concise.`;
};

/**
 * Builds system message for title generation
 * @param {Object} options - Options for prompt construction
 * @returns {string} Formatted system message
 */
export const buildTitleSystemMessage = () => {
  return `You are an educational assistant that creates concise, descriptive titles.
Generate a short, catchy title for a set of flashcards based on the provided subject or content.
The title should be clear, specific to the topic, and under 60 characters.
Respond with ONLY the title text, nothing more.`;
};

export default {
  openaiConfig,
  buildFlashcardSystemMessage,
  buildTitleSystemMessage
}; 