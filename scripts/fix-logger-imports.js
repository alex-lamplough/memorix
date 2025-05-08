/**
 * Script to fix logger import paths in the frontend code
 * 
 * This script fixes the following patterns:
 * - ../../utils/logger -> ../utils/logger (adjusts paths depending on file depth)
 * - Adds .js extension if missing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');

// Skip these directories
const SKIP_DIRS = ['node_modules', 'dist', 'build', '.git'];

// Function to calculate the correct relative path to utils/logger.js
function getCorrectLoggerImportPath(filePath) {
  // Get the relative path from src directory
  const relativePath = path.relative(SRC_DIR, filePath);
  const dirDepth = relativePath.split(path.sep).length - 1;
  
  // Calculate the correct number of ../ needed
  let prefix = '';
  for (let i = 0; i < dirDepth; i++) {
    prefix += '../';
  }
  
  // If file is directly in src, use ./
  if (dirDepth === 0) {
    prefix = './';
  }
  
  return `${prefix}utils/logger`;
}

// Process a file to fix logger imports
function processFile(filePath) {
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Skip files without logger imports
    if (!content.includes('utils/logger')) {
      return;
    }
    
    // Calculate the correct import path for this file
    const correctPath = getCorrectLoggerImportPath(filePath);
    
    // Fix import statements
    content = content.replace(
      /import\s+logger\s+from\s+['"]([\.\/]+)utils\/logger(?:\.js)?['"]/g,
      `import logger from '${correctPath}'`
    );
    
    // Fix JSON.stringify syntax errors
    content = content.replace(
      /JSON\.stringify\(([^)]+)\s*\}\)/g,
      'JSON.stringify($1)'
    );
    
    // Fix string concatenation errors in the value property
    content = content.replace(
      /\{\s*value:\s*([^}]+)\s*\}\s*\+\s*['"]([^'"]+)['"]/g,
      '{ value: $1 + "$2" }'
    );
    
    // Write changes if content was modified
    if (content !== originalContent) {
      console.log(`Fixing imports in ${filePath}`);
      fs.writeFileSync(filePath, content, 'utf8');
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

// Process all JavaScript and JSX files in the src directory
function processDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      // Skip directories in the exclude list
      if (entry.isDirectory()) {
        if (SKIP_DIRS.includes(entry.name)) continue;
        processDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
        processFile(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error processing directory ${dirPath}:`, err);
  }
}

// Main execution
console.log('Starting import fix process...');
processDirectory(SRC_DIR);
console.log('Import fix process complete!'); 