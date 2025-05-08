#!/usr/bin/env node

/**
 * Script to fix logger syntax errors in the codebase
 * Fixes common patterns that cause syntax errors:
 * 1. Double-braces: logger.xxx('message', { ... })
 * 2. JSON.stringify misuse: logger.xxx('message', { value: JSON.stringify(...) })
 * 3. Missing closing parentheses in template literals
 * 4. Fixes import paths for logger (adds .js extension for ESM)
 * 
 * Usage: node scripts/fix-logger-syntax.js [--dry-run]
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
const SOURCE_DIR = path.resolve(__dirname, '..');
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
    const relativePath = path.relative(SOURCE_DIR, fullPath);
    
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
    
    // Skip files that don't have logger calls
    if (!content.includes('logger.')) {
      return;
    }
    
    let original = content;
    
    // Fix import paths - ensure logger is imported with .js extension in ESM
    if (content.includes('import logger from') && !content.includes('.js')) {
      content = content.replace(/import logger from ['"](.+?)['"];?/g, (match, p1) => {
        if (p1.endsWith('.js')) return match;
        return `import logger from '${p1}.js';`;
      });
    }
    
    // Fix 1: Double-braces pattern in logger calls
    // Matches: logger.xxx('message', { ... })
    content = content.replace(/(logger\.[a-z]+\([^,]+,\s*)\{\s*\{([^}]+)\}\s*\}/g, '$1{$2}');
    
    // Fix 2: JSON.stringify misuse in object literals
    // Matches: logger.xxx('message', { value: JSON.stringify(...) })
    content = content.replace(/(logger\.[a-z]+\([^,]+,\s*\{)\s*JSON\.stringify\(([^)]+)\)([^}]*)\}/g, 
      (match, prefix, jsonContent, suffix) => {
        // Simple case: replace with direct value if possible
        return `${prefix} value: JSON.stringify(${jsonContent})${suffix}}`;
      });
    
    // Fix 3: Broken template literals in logger calls
    // Matches missing closing parentheses in `${}` expressions
    content = content.replace(/(\$\{[^}]+)\.substring\((\d+),\s*(\d+)\s*\}([^`]+)/g, 
      '$1.substring($2, $3)}$4');
    
    // Fix 4: Object literals with trailing parentheses
    content = content.replace(/(\{\s*[^{}]*)\)\s*\}/g, (match, p1) => {
      // Only fix if there's no matching opening parenthesis
      const openCount = (p1.match(/\(/g) || []).length;
      const closeCount = (p1.match(/\)/g) || []).length;
      
      if (closeCount > openCount) {
        return p1.replace(/\)\s*$/, '') + '}';
      }
      return match;
    });
    
    // Fix 5: Missing parentheses in function calls within logger
    content = content.replace(/\.toString\(\s*\)/g, '.toString()');
    
    // Check if changes were made
    if (content !== original) {
      console.log(`${relativePath}: Fixed logger syntax issues`);
      
      if (!isDryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  } catch (error) {
    console.error(`Error processing ${relativePath}:`, error.message);
  }
}

// Main execution
console.log(`Starting logger syntax fix ${isDryRun ? '(DRY RUN)' : ''}`);
console.log(`Looking in ${SOURCE_DIR} for files to process`);

processDirectory(SOURCE_DIR);

console.log('\nSyntax fix complete!');
console.log(isDryRun 
  ? 'This was a dry run. Run without --dry-run to apply changes.' 
  : 'All logger syntax issues have been fixed.');
console.log('\nRecommendation: Review the changes and run your tests to ensure everything works properly.'); 