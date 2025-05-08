# Secure Logging in Memorix

This directory contains utilities for secure logging in the Memorix application.

## Logger Utility

The `logger.js` utility provides a secure logging mechanism that prevents sensitive information from being exposed in production environments while allowing detailed logs during development.

### Features

- **Environment-aware logging**: Different log levels for production vs. development
- **Sanitized data**: Automatically redacts sensitive information in production logs
- **Consistent format**: All logs follow a consistent format with timestamps
- **Log levels**: Supports ERROR, WARN, INFO, and DEBUG levels

## Usage

```javascript
import logger from '../utils/logger';

// Different log levels
logger.error('This is an error message', error);
logger.warn('This is a warning message', { details: 'additional info' });
logger.info('This is an info message', { userId: '123' });
logger.debug('This is a debug message', { data: someData });
```

## Log Levels and Production Behavior

| Log Level | Development | Production |
|-----------|-------------|------------|
| ERROR     | Shown       | Shown      |
| WARN      | Shown       | Shown      |
| INFO      | Shown       | Hidden     |
| DEBUG     | Shown       | Hidden     |

## Converting Console.log to Logger

A utility script is available to automatically convert all `console.log` statements to use the secure logger:

```bash
# Dry run to see what would be changed
node scripts/convert-logs.js --dry-run

# Apply changes
node scripts/convert-logs.js
```

## Security Benefits

Using this logging approach provides several security benefits:

1. Prevents sensitive data exposure in production browser consoles
2. Automatically sanitizes values that might contain credentials
3. Maintains useful logs for debugging in development
4. Provides consistent structured logging across the application

## Implementation Details

The logger utility internally uses `console.log`, `console.warn`, etc., but provides:

1. Log level filtering
2. Consistent formatting
3. Data sanitization in production
4. Conditional visibility based on environment 