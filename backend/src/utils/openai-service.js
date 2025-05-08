import OpenAI from 'openai';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate flashcards from a text prompt
 * @param {string} prompt - The text prompt to generate flashcards from
 * @param {number} numberOfCards - Number of cards to generate (default: 5)
 * @returns {Array} An array of flashcard objects with front and back
 */
export const generateFlashcards = async (prompt, numberOfCards = 5) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant that creates flashcards for learning. 
          Extract key concepts and create ${numberOfCards} effective flashcards from the provided text.
          Each flashcard should have a clear question/concept on the front and a concise, accurate answer on the back.
          Format your response as a valid JSON array of objects with "front" and "back" properties.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    return parsedContent.flashcards || [];
  } catch (error) {
    logger.error('Error generating flashcards with OpenAI:', error);
    throw new Error('Failed to generate flashcards');
  }
};

/**
 * Enhance existing flashcards with hints or additional information
 * @param {Array} flashcards - Array of existing flashcards
 * @returns {Array} Enhanced flashcards with hints
 */
export const enhanceFlashcards = async (flashcards) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant that enhances flashcards for learning.
          For each flashcard, add a helpful hint that doesn't give away the answer but guides the learner.
          Format your response as a valid JSON array of objects with "front", "back", and "hint" properties.`
        },
        {
          role: "user",
          content: JSON.stringify(flashcards)
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    return parsedContent.flashcards || [];
  } catch (error) {
    logger.error('Error enhancing flashcards with OpenAI:', error);
    throw new Error('Failed to enhance flashcards');
  }
};

/**
 * Generate a summary of a topic for a flashcard set
 * @param {string} topic - The topic to summarize
 * @returns {Object} Summary object with title, description, and suggested tags
 */
export const generateTopicSummary = async (topic) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant that creates concise topic summaries.
          Create a brief summary of the provided topic along with a relevant title and suggested tags.
          Format your response as a valid JSON object with "title", "description", and "tags" properties.`
        },
        {
          role: "user",
          content: topic
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    return {
      title: parsedContent.title || topic,
      description: parsedContent.description || '',
      tags: parsedContent.tags || []
    };
  } catch (error) {
    logger.error('Error generating topic summary with OpenAI:', error);
    throw new Error('Failed to generate topic summary');
  }
}; 