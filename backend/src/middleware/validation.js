/**
 * Request validation middleware
 * Validates request body, query, and params against a schema
 */

// Simple type validation helper functions
const typeValidators = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value))),
  boolean: (value) => typeof value === 'boolean' || value === 'true' || value === 'false',
  object: (value) => typeof value === 'object' && value !== null,
  array: (value) => Array.isArray(value),
  date: (value) => !isNaN(new Date(value).getTime())
};

// Enum validator
const validateEnum = (value, enumValues) => {
  return enumValues.includes(value);
};

// Validate a single field against a schema
const validateField = (value, schema) => {
  // Skip validation if value is undefined and not required
  if (value === undefined) {
    return { valid: !schema.required, error: schema.required ? 'Field is required' : null };
  }
  
  // Check type
  if (schema.type && !typeValidators[schema.type](value)) {
    return { valid: false, error: `Expected type ${schema.type}` };
  }
  
  // Check enum if specified
  if (schema.enum && value !== undefined) {
    if (!validateEnum(value, schema.enum)) {
      return { valid: false, error: `Value must be one of: ${schema.enum.join(', ')}` };
    }
  }
  
  // Custom validation function
  if (schema.validate && typeof schema.validate === 'function') {
    try {
      const isValid = schema.validate(value);
      if (!isValid) {
        return { valid: false, error: schema.errorMessage || 'Validation failed' };
      }
    } catch (error) {
      return { valid: false, error: error.message || 'Validation failed' };
    }
  }
  
  return { valid: true, error: null };
};

// Validate each field in an object against a schema
const validateObject = (obj, schema) => {
  const errors = {};
  let hasErrors = false;
  
  // Check each field in the schema
  Object.keys(schema).forEach(field => {
    const { valid, error } = validateField(obj[field], schema[field]);
    if (!valid) {
      errors[field] = error;
      hasErrors = true;
    }
  });
  
  return { valid: !hasErrors, errors };
};

/**
 * Creates a validation middleware based on schema
 * @param {Object} schema - Validation schema with body, query, and params sections
 * @returns {Function} Express middleware function
 */
export const validateRequest = (schema = {}) => {
  return (req, res, next) => {
    const validationErrors = {};
    let hasErrors = false;
    
    // Validate request body if schema.body exists
    if (schema.body && Object.keys(schema.body).length > 0) {
      const { valid, errors } = validateObject(req.body || {}, schema.body);
      if (!valid) {
        validationErrors.body = errors;
        hasErrors = true;
      }
    }
    
    // Validate query params if schema.query exists
    if (schema.query && Object.keys(schema.query).length > 0) {
      const { valid, errors } = validateObject(req.query || {}, schema.query);
      if (!valid) {
        validationErrors.query = errors;
        hasErrors = true;
      }
    }
    
    // Validate URL params if schema.params exists
    if (schema.params && Object.keys(schema.params).length > 0) {
      const { valid, errors } = validateObject(req.params || {}, schema.params);
      if (!valid) {
        validationErrors.params = errors;
        hasErrors = true;
      }
    }
    
    // If validation errors, return 400 with error details
    if (hasErrors) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validationErrors
      });
    }
    
    // Validation passed, continue to the next middleware
    next();
  };
};

export default { validateRequest }; 