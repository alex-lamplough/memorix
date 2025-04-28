/**
 * Environment variable utilities
 * Provides helpers for working with environment variables safely
 */

/**
 * Get an environment variable value with a fallback
 * @param {string} key - The environment variable key (without the VITE_ prefix)
 * @param {*} defaultValue - The default value to use if the env var is not set
 * @returns {string} The environment variable value or default
 */
export const getEnvVariable = (key, defaultValue = '') => {
  const fullKey = `VITE_${key}`;
  return import.meta.env[fullKey] || defaultValue;
};

/**
 * Check if running in production environment
 * @returns {boolean} True if in production mode
 */
export const isProduction = () => {
  return import.meta.env.PROD === true;
};

/**
 * Check if running in development environment
 * @returns {boolean} True if in development mode
 */
export const isDevelopment = () => {
  return import.meta.env.DEV === true;
};

/**
 * Get the current environment name
 * @returns {string} The environment name (development, production, etc.)
 */
export const getEnvironmentName = () => {
  return getEnvVariable('ENV', 'development');
};

/**
 * Mask a sensitive string (e.g., for logging)
 * @param {string} value - The string to mask
 * @param {number} visibleChars - Number of characters to show at beginning/end
 * @returns {string} The masked string
 */
export const maskSensitiveValue = (value, visibleChars = 4) => {
  if (!value || value.length <= visibleChars * 2) return value;
  
  const start = value.slice(0, visibleChars);
  const end = value.slice(-visibleChars);
  const masked = '*'.repeat(Math.min(value.length - (visibleChars * 2), 10));
  
  return `${start}${masked}${end}`;
}; 