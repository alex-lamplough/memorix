import OpenAI from 'openai';

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
      console.error('Failed to parse JSON response:', error);
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
    console.error('Error generating flashcards:', error);
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
    console.error('Error generating flashcard set title:', error);
    throw error;
  }
}

export default {
  generateFlashcards,
  generateFlashcardSetTitle
}; 