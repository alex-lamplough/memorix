/**
 * Secure logging utility for the frontend application
 * Provides consistent logging format and handles different log levels
 * Ensures logs don't expose sensitive information to browser console in production
 */

// Log levels in order of severity
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level based on environment
// In production, default to WARN to minimize console output
// In development, show all logs
const currentLogLevel = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.WARN 
  : LOG_LEVELS.DEBUG;

/**
 * Format the log message with timestamp and additional metadata
 * 
 * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG)
 * @param {string} message - The log message
 * @param {Object} meta - Additional metadata to include
 * @returns {string} Formatted log message
 */
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  let metaString = '';
  
  if (Object.keys(meta).length > 0) {
    // In production, sanitize potentially sensitive data
    const sanitizedMeta = process.env.NODE_ENV === 'production'
      ? sanitizeData(meta)
      : meta;
    
    metaString = JSON.stringify(sanitizedMeta, null, 2);
  }
  
  return `[${timestamp}] [${level}] ${message} ${metaString}`.trim();
};

/**
 * Sanitize potentially sensitive data for production logging
 * 
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = ['password', 'token', 'secret', 'auth', 'key', 'credential', 'ssn', 'email'];
  const result = {...data};
  
  Object.keys(result).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitiveKey => lowerKey.includes(sensitiveKey))) {
      result[key] = '[REDACTED]';
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = sanitizeData(result[key]);
    }
  });
  
  return result;
};

/**
 * Log error messages
 * 
 * @param {string} message - Error message
 * @param {Object|Error} error - Error object or metadata
 */
const error = (message, error = {}) => {
  if (currentLogLevel >= LOG_LEVELS.ERROR) {
    let meta = {};
    
    if (error instanceof Error) {
      meta = {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        ...error
      };
    } else {
      meta = error;
    }
    
    console.error(formatLogMessage('ERROR', message, meta));
  }
};

/**
 * Log warning messages
 * 
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
const warn = (message, meta = {}) => {
  if (currentLogLevel >= LOG_LEVELS.WARN) {
    console.warn(formatLogMessage('WARN', message, meta));
  }
};

/**
 * Log info messages
 * 
 * @param {string} message - Info message
 * @param {Object} meta - Additional metadata
 */
const info = (message, meta = {}) => {
  if (currentLogLevel >= LOG_LEVELS.INFO) {
    if (process.env.NODE_ENV === 'production') {
      // In production, info logs are not output to console by default
      // This prevents information disclosure to browser dev tools
      return;
    }
    console.info(formatLogMessage('INFO', message, meta));
  }
};

/**
 * Log debug messages
 * 
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
const debug = (message, meta = {}) => {
  if (currentLogLevel >= LOG_LEVELS.DEBUG) {
    if (process.env.NODE_ENV === 'production') {
      // Debug logs are never shown in production
      return;
    }
    console.debug(formatLogMessage('DEBUG', message, meta));
  }
};

// Export the logger functions
const logger = {
  error,
  warn,
  info,
  debug,
  // Allow programmatic log level setting for testing
  setLogLevel: (level) => {
    if (LOG_LEVELS[level] !== undefined) {
      currentLogLevel = LOG_LEVELS[level];
    }
  }
};

export default logger; 