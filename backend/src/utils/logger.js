/**
 * Simple logging utility for the application
 * Provides consistent logging format and handles different log levels
 */

// Log levels in order of severity
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level, defaulting to INFO in production and DEBUG in development
const currentLogLevel = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.INFO 
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
    metaString = JSON.stringify(meta, null, 2);
  }
  
  return `[${timestamp}] [${level}] ${message} ${metaString}`.trim();
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
    console.debug(formatLogMessage('DEBUG', message, meta));
  }
};

export default {
  error,
  warn,
  info,
  debug
}; 