/**
 * Environment variable validation utility
 * Checks that all required environment variables are present
 */
import { isProduction, isDevelopment, getEnvironmentName } from './env-utils';

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

// Production-specific required variables
const PROD_REQUIRED_ENV_VARS = [
  // Add any production-only required variables here
];

// Development-specific required variables 
const DEV_REQUIRED_ENV_VARS = [
  // Add any development-only required variables here
];

/**
 * Validates that all required environment variables are present
 * Warns about recommended variables that are missing
 * @returns {boolean} True if all required variables are present
 */
export const validateEnvironment = () => {
  const missing = [];
  const warnings = [];
  const currentEnv = getEnvironmentName();
  const isProd = isProduction();
  const isDev = isDevelopment();

  // Check for required variables
  REQUIRED_ENV_VARS.forEach(varName => {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    }
  });

  // Check for environment-specific required variables
  if (isProd) {
    PROD_REQUIRED_ENV_VARS.forEach(varName => {
      if (!import.meta.env[varName]) {
        missing.push(varName);
      }
    });
  } else if (isDev) {
    DEV_REQUIRED_ENV_VARS.forEach(varName => {
      if (!import.meta.env[varName]) {
        missing.push(varName);
      }
    });
  }

  // Check for recommended variables
  RECOMMENDED_ENV_VARS.forEach(varName => {
    if (!import.meta.env[varName]) {
      warnings.push(varName);
    }
  });

  console.log(`🌎 Running in ${currentEnv} environment (${isProd ? 'production' : 'development'} mode)`);

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
  // In production, only log errors for missing critical variables
  if (isProduction()) {
    return validateEnvironment();
  }
  // Full validation in development
  return validateEnvironment();
}; 