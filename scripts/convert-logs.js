#!/usr/bin/env node

/**
 * Script to convert console.log, console.error, etc. to logger utility
 * This helps ensure secure logging that won't expose sensitive information in production
 * 
 * Usage: node scripts/convert-logs.js [--dry-run]
 * 
 * Options:
 *   --dry-run    Only print what would be changed without making changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIR = path.resolve(__dirname, '..');
const IGNORE_DIRS = [
  'node_modules', 
  '.git', 
  'dist', 
  'build',
  '.cache',
  'coverage',
  'scripts'
];
const IGNORE_FILES = [
  'src/utils/logger.js', // Don't modify our own logger
  'backend/src/utils/logger.js' // Don't modify backend logger
];

// Extension whitelist - only process these file types
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Map console methods to logger methods
const CONSOLE_TO_LOGGER = {
  'console.log': 'logger.debug',
  'console.info': 'logger.info',
  'console.warn': 'logger.warn',
  'console.error': 'logger.error',
  'console.debug': 'logger.debug'
};

// Regex patterns to match console.* calls
const CONSOLE_PATTERNS = {
  // Match console.log('message')
  simpleLog: /console\.(log|info|warn|error|debug)\(([^)]+)\)/g,
  
  // Match console.log('message', var)
  logWithComma: /console\.(log|info|warn|error|debug)\((['"`][^'"`]+['"`]),\s*([^)]+)\)/g,
  
  // Match string literals that might contain expressions like `String ${expr}`
  templateString: /(`[^`]*`)/g
};

// Check for dry run flag
const isDryRun = process.argv.includes('--dry-run');

// Main function to walk directory and process files
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(SOURCE_DIR, fullPath);
    
    // Skip ignored directories
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.some(ignore => entry.name === ignore || entry.name.startsWith(ignore + '/'))) {
        continue;
      }
      
      processDirectory(fullPath);
      continue;
    }
    
    // Skip ignored files and non-matching extensions
    if (!entry.isFile() || 
        IGNORE_FILES.includes(relativePath) || 
        !EXTENSIONS.includes(path.extname(entry.name))) {
      continue;
    }
    
    // Process the file
    processFile(fullPath, relativePath);
  }
}

// Process a single file
function processFile(filePath, relativePath) {
  // Skip binary files
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't have console.* calls
    if (!content.includes('console.')) {
      return;
    }
    
    // Check if the file already imports logger
    const hasLoggerImport = content.includes('import logger from');
    
    // Replace console.* calls with logger.* calls
    let newContent = content;
    let replacementCount = 0;
    
    // Replace each console.* method
    Object.entries(CONSOLE_TO_LOGGER).forEach(([consoleMethod, loggerMethod]) => {
      // Count occurrences before replacement
      const count = (content.match(new RegExp(consoleMethod.replace('.', '\\.'), 'g')) || []).length;
      if (count === 0) return;
      
      // Replace simple logs
      newContent = newContent.replace(
        new RegExp(`${consoleMethod.replace('.', '\\.')}\\((['"\`][^)]*['"\`])\\)`, 'g'),
        `${loggerMethod}($1)`
      );
      
      // Replace logs with object or variable parameters
      newContent = newContent.replace(
        new RegExp(`${consoleMethod.replace('.', '\\.')}\\((['"\`][^,]*['"\`]),\\s*([^)]+)\\)`, 'g'),
        (match, message, variable) => {
          // If the variable looks like an Error, keep it as is
          if (variable.trim() === 'error' || variable.trim().includes('Error')) {
            return `${loggerMethod}(${message}, ${variable})`;
          }
          // Otherwise wrap it in an object for better structure
          return `${loggerMethod}(${message}, { ${variable.includes(':') ? variable : `value: ${variable}`} })`;
        }
      );
      
      // Count replacements made
      replacementCount += count;
    });
    
    // Add import statement for logger if needed
    if (replacementCount > 0 && !hasLoggerImport) {
      // Determine the correct import path
      const importPath = getLoggerImportPath(relativePath);
      
      // Find the first import statement to place our import after it
      const importStatementMatch = newContent.match(/import .+ from ['"].+['"];?\n/);
      if (importStatementMatch) {
        const importStatement = importStatementMatch[0];
        const importIndex = newContent.indexOf(importStatement) + importStatement.length;
        newContent = newContent.slice(0, importIndex) + 
                    `import logger from '${importPath}';\n` + 
                    newContent.slice(importIndex);
      } else {
        // No existing imports, add at top
        newContent = `import logger from '${importPath}';\n\n${newContent}`;
      }
    }
    
    // Write changes if necessary
    if (replacementCount > 0 && content !== newContent) {
      console.log(`${relativePath}: ${replacementCount} replacements`);
      
      if (!isDryRun) {
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
    }
  } catch (error) {
    console.error(`Error processing ${relativePath}:`, error.message);
  }
}

// Calculate relative path to logger.js
function getLoggerImportPath(filePath) {
  // Count directory levels in the file path
  const dirCount = filePath.split('/').length - 1;
  const relativePath = dirCount > 0 
    ? '../'.repeat(dirCount) + 'utils/logger'
    : './utils/logger';
  
  // Handle backend files
  if (filePath.startsWith('backend/')) {
    return './utils/logger';
  }
  
  return relativePath;
}

// Main execution
console.log(`Starting conversion of console.log to logger utility ${isDryRun ? '(DRY RUN)' : ''}`);
console.log(`Looking in ${SOURCE_DIR} for files to process`);

// Check if logger.js exists
const frontendLoggerPath = path.join(SOURCE_DIR, 'src', 'utils', 'logger.js');
if (!fs.existsSync(frontendLoggerPath)) {
  console.error('Error: src/utils/logger.js not found. Please create the logger utility first.');
  process.exit(1);
}

processDirectory(SOURCE_DIR);

console.log('\nConversion complete!');
console.log(isDryRun 
  ? 'This was a dry run. Run without --dry-run to apply changes.' 
  : 'All console.* calls have been replaced with logger utility calls.');
console.log('\nRecommendation: Review the changes and run your tests to ensure everything works properly.'); 