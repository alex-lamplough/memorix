/**
 * Environment variable validation utility
 * Checks that all required environment variables are present
 */

// List of required environment variables
const REQUIRED_ENV_VARS = [
  'VITE_AUTH0_DOMAIN',
  'VITE_AUTH0_CLIENT_ID'
];

// List of optional but recommended environment variables
const RECOMMENDED_ENV_VARS = [
  'VITE_AUTH0_AUDIENCE',
  'VITE_ENV'
];

/**
 * Validates that all required environment variables are present
 * Warns about recommended variables that are missing
 * @returns {boolean} True if all required variables are present
 */
export const validateEnvironment = () => {
  const missing = [];
  const warnings = [];

  // Check for required variables
  REQUIRED_ENV_VARS.forEach(varName => {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    }
  });

  // Check for recommended variables
  RECOMMENDED_ENV_VARS.forEach(varName => {
    if (!import.meta.env[varName]) {
      warnings.push(varName);
    }
  });

  // Log any missing required variables
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('');
    console.error('Please run "npm run setup" to configure these variables.');
  }

  // Log any missing recommended variables
  if (warnings.length > 0) {
    console.warn('⚠️ Missing recommended environment variables:');
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
  }

  // If all required variables are present, log success
  if (missing.length === 0) {
    console.log('✅ Environment validation passed');
    return true;
  }

  return false;
};

/**
 * Utility to use at application startup to ensure 
 * environment is properly configured
 */
export const validateEnvironmentOnStartup = () => {
  // Only validate in development mode
  if (import.meta.env.DEV) {
    return validateEnvironment();
  }
  return true;
}; 