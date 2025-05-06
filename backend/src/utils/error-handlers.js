/**
 * Error handling utilities for API responses
 */

import mongoose from 'mongoose';

/**
 * Standard error handler for API responses
 * @param {Object} res - Express response object
 * @param {Error} error - The error that occurred
 */
export const handleError = (res, error) => {
  console.error('API Error:', error);
  
  // Mongoose validation error
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'The request contains invalid data',
      details: formatValidationError(error)
    });
  }
  
  // Mongoose CastError (invalid ID format)
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error: 'Invalid ID Format',
      message: 'The provided ID is not in a valid format',
      details: error.message
    });
  }
  
  // MongoDB duplicate key error
  if (error.name === 'MongoServerError' && error.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Resource',
      message: 'A resource with this unique identifier already exists',
      details: formatDuplicateKeyError(error)
    });
  }
  
  // JWT/Auth errors
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired token',
      details: error.message
    });
  }
  
  // Custom API error with status code
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      error: error.name || 'API Error',
      message: error.message,
      details: error.details || null
    });
  }
  
  // Default fallback for unhandled errors
  return res.status(500).json({
    error: 'Server Error',
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? error.message : null
  });
};

/**
 * Wrapper for async route handlers to catch errors and pass them to the error middleware
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
export const handleAsyncErrors = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      handleError(res, error);
    });
  };
};

/**
 * Format mongoose validation errors into a more usable structure
 * @param {ValidationError} error - Mongoose validation error
 * @returns {Object} Formatted error object
 */
const formatValidationError = (error) => {
  const formattedErrors = {};
  
  // Loop through each validation error
  Object.keys(error.errors).forEach(field => {
    formattedErrors[field] = error.errors[field].message;
  });
  
  return formattedErrors;
};

/**
 * Format MongoDB duplicate key errors
 * @param {Error} error - MongoDB duplicate key error
 * @returns {Object} Formatted error with the duplicate field
 */
const formatDuplicateKeyError = (error) => {
  const keyPattern = error.keyPattern;
  const keyValue = error.keyValue;
  
  const fields = Object.keys(keyPattern).join(', ');
  return {
    fields,
    values: keyValue
  };
};

/**
 * Create a custom API error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} name - Error name
 * @param {Object} details - Additional error details
 * @returns {Error} Custom error object
 */
export const createApiError = (message, statusCode = 500, name = 'API Error', details = null) => {
  const error = new Error(message);
  error.name = name;
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

export default {
  handleError,
  createApiError,
  handleAsyncErrors
}; 