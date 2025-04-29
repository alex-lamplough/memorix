/**
 * Validation utilities for API requests
 */

/**
 * Validates a flashcard generation request
 * @param {Object} requestBody - The request body to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateFlashcardRequest = (requestBody) => {
  // Check if request body exists
  if (!requestBody) {
    return 'Request body is required';
  }

  // Check if either content or subject is provided
  const { content, subject } = requestBody;
  
  // Content is required for generation
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return 'Content is required and must be a non-empty string';
  }
  
  // If content is too long, it might cause issues with the API
  if (content.length > 10000) {
    return 'Content is too long (maximum 10,000 characters)';
  }

  // Validate count if provided
  const count = requestBody.count;
  if (count !== undefined) {
    const parsedCount = parseInt(count, 10);
    if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 20) {
      return 'Count must be an integer between 1 and 20';
    }
  }

  // Validate difficulty if provided
  const difficulty = requestBody.difficulty;
  if (difficulty !== undefined) {
    const validDifficulties = ['beginner', 'intermediate', 'advanced', 'expert', 'easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty.toLowerCase())) {
      return `Difficulty must be one of: ${validDifficulties.join(', ')}`;
    }
  }

  // If we got here, validation passed
  return null;
};

/**
 * Sanitizes input string to prevent injection attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML/JS tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Prevent command injection
  sanitized = sanitized.replace(/[;&|`$]/g, '');
  
  // Trim whitespace and limit length
  sanitized = sanitized.trim();
  if (sanitized.length > 5000) {
    sanitized = sanitized.substring(0, 5000);
  }
  
  return sanitized;
};

/**
 * Validates user registration data
 * @param {Object} userData - User registration data
 * @returns {Object} Validation result
 */
export const validateUserRegistration = (userData) => {
  const { email, password, username } = userData;
  
  if (!email || !password || !username) {
    return {
      isValid: false,
      error: 'Email, password, and username are required'
    };
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }
  
  // Validate password strength
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long'
    };
  }
  
  // Validate username
  if (username.length < 3 || username.length > 20) {
    return {
      isValid: false,
      error: 'Username must be between 3 and 20 characters'
    };
  }
  
  return {
    isValid: true
  };
};

/**
 * Validates user login data
 * @param {Object} loginData - User login data
 * @returns {Object} Validation result
 */
export const validateUserLogin = (loginData) => {
  const { email, password } = loginData;
  
  if (!email || !password) {
    return {
      isValid: false,
      error: 'Email and password are required'
    };
  }
  
  return {
    isValid: true
  };
};

export default {
  validateFlashcardRequest,
  validateUserRegistration,
  sanitizeInput,
  validateUserLogin
}; 