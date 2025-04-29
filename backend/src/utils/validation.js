/**
 * Validation utilities for API requests
 */

/**
 * Validates a flashcard generation request
 * @param {Object} requestBody - The request body to validate
 * @returns {Object} Validation result with isValid flag and error message if invalid
 */
export const validateFlashcardRequest = (requestBody) => {
  // Check if request body exists
  if (!requestBody) {
    return {
      isValid: false,
      error: 'Request body is required'
    };
  }

  // Check if either content or subject is provided
  const { content, subject } = requestBody;
  if (!content && !subject) {
    return {
      isValid: false,
      error: 'Either content or subject is required'
    };
  }

  // Validate count if provided
  const count = requestBody.count;
  if (count !== undefined) {
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      return {
        isValid: false,
        error: 'Count must be an integer between 1 and 20'
      };
    }
  }

  // Validate difficulty if provided
  const difficulty = requestBody.difficulty;
  if (difficulty !== undefined) {
    const validDifficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    if (!validDifficulties.includes(difficulty.toLowerCase())) {
      return {
        isValid: false,
        error: `Difficulty must be one of: ${validDifficulties.join(', ')}`
      };
    }
  }

  return {
    isValid: true
  };
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