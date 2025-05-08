import logger from '../utils/logger.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', { value: err });

  // Check if error is an Auth0 error
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized access',
      message: 'Valid authentication credentials are required'
    });
  }

  // Check if it's a Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      message: err.message,
      details: err.errors
    });
  }

  // Check if it's a MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({ 
      error: 'Duplicate Error', 
      message: 'A resource with that information already exists',
      details: err.keyValue
    });
  }

  // Check if it's a custom API error
  if (err.statusCode) {
    return res.status(err.statusCode).json({ 
      error: err.name || 'API Error',
      message: err.message
    });
  }

  // If this is a development environment, include the stack trace
  const isDev = process.env.NODE_ENV === 'development';
  
  // Default to 500 server error
  return res.status(500).json({
    error: 'Server Error',
    message: 'An unexpected error occurred on the server',
    ...(isDev && { stack: err.stack })
  });
}; 