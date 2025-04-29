/**
 * Simple rate limiting middleware
 * 
 * @param {Object} options Rate limiting options
 * @param {number} options.windowMs Time window in milliseconds
 * @param {number} options.max Maximum number of requests in the time window
 * @param {Object} options.message Error message to return when rate limit is exceeded
 * @returns {Function} Express middleware function
 */
export const rateLimit = (options) => {
  const { windowMs, max, message } = options;
  const requestTimestamps = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const key = `${ip}:${req.path}`;
    
    const now = Date.now();
    let timestamps = requestTimestamps.get(key) || [];
    
    // Filter out timestamps outside the current window
    timestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
    
    if (timestamps.length >= max) {
      return res.status(429).json(message || { error: 'Too many requests' });
    }
    
    // Add current timestamp and update the map
    timestamps.push(now);
    requestTimestamps.set(key, timestamps);
    
    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up on each request
      for (let [mapKey, times] of requestTimestamps.entries()) {
        requestTimestamps.set(
          mapKey, 
          times.filter(timestamp => now - timestamp < windowMs)
        );
        
        if (requestTimestamps.get(mapKey).length === 0) {
          requestTimestamps.delete(mapKey);
        }
      }
    }
    
    next();
  };
}; 