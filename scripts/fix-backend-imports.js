#!/usr/bin/env node

/**
 * Script to fix logger import paths in backend files
 * Changes imports like: import logger from './utils/logger' 
 * To the correct: import logger from '../utils/logger.js'
 * 
 * Usage: node scripts/fix-backend-imports.js [--dry-run]
 * 
 * Options:
 *   --dry-run    Only print what would be changed without making changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BACKEND_DIR = path.resolve(__dirname, '../backend');
const IGNORE_DIRS = [
  'node_modules', 
  '.git', 
  'dist', 
  'build',
  '.cache',
  'coverage'
];

// Extension whitelist - only process these file types
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Check for dry run flag
const isDryRun = process.argv.includes('--dry-run');

// Main function to walk directory and process files
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(BACKEND_DIR, fullPath);
    
    // Skip ignored directories
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.some(ignore => entry.name === ignore || entry.name.startsWith(ignore + '/'))) {
        continue;
      }
      
      processDirectory(fullPath);
      continue;
    }
    
    // Skip non-matching extensions
    if (!entry.isFile() || !EXTENSIONS.includes(path.extname(entry.name))) {
      continue;
    }
    
    // Process the file
    processFile(fullPath, relativePath);
  }
}

// Process a single file
function processFile(filePath, relativePath) {
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't import logger
    if (!content.includes('logger') || !content.includes('import')) {
      return;
    }
    
    const original = content;
    
    // Determine the correct path to the logger module
    const relativeDirPath = path.dirname(relativePath);
    const pathToUtils = getRelativePathToUtils(relativeDirPath);
    
    // Fix import paths - use a more flexible regex to match more import patterns
    content = content.replace(
      /import\s+logger\s+from\s+['"](?:\.{0,2}\/)?(?:.*?\/)?utils\/logger(?:\.js)?['"];?/g, 
      `import logger from '${pathToUtils}/utils/logger.js';`
    );
    
    // Check if changes were made
    if (content !== original) {
      console.log(`${relativePath}: Fixed logger import path`);
      
      if (!isDryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  } catch (error) {
    console.error(`Error processing ${relativePath}:`, error.message);
  }
}

/**
 * Calculate the relative path from a file to the utils directory
 * @param {string} relativeDirPath - Directory path relative to backend dir
 * @returns {string} Relative path to utils directory
 */
function getRelativePathToUtils(relativeDirPath) {
  // Count the directory levels to determine how many '../' needed
  const dirDepth = relativeDirPath.split('/').length;
  
  // Special case for files directly in src folder
  if (relativeDirPath === 'src') {
    return '.';
  }
  
  // For files in routes, controllers, etc. folders that are inside src
  if (relativeDirPath.startsWith('src/')) {
    // Go back to src level
    return '..';
  }
  
  // For files in subdirectories
  let pathBack = '';
  for (let i = 0; i < dirDepth; i++) {
    pathBack += '../';
  }
  
  return pathBack + 'src';
}

// Main execution
console.log(`Starting backend import path fix ${isDryRun ? '(DRY RUN)' : ''}`);
console.log(`Looking in ${BACKEND_DIR} for files to process`);

processDirectory(BACKEND_DIR);

console.log('\nImport path fix complete!');
console.log(isDryRun 
  ? 'This was a dry run. Run without --dry-run to apply changes.' 
  : 'All logger import paths have been fixed.');
console.log('\nRecommendation: Review the changes and run your tests to ensure everything works properly.'); 