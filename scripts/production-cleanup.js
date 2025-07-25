#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 CodeContext Pro - Production Cleanup');
console.log('========================================');

// Files and directories to remove for production
const itemsToRemove = [
  // Test directories
  'cli/test-project',
  'execution-engine/sandbox',
  'codecontext-dev',
  
  // Test files
  'test-crud.js',
  'test-db.js',
  'test-db.ts',
  'verify-schema.js',
  'check-schema.js',
  
  // Build artifacts
  'cli/tsconfig.tsbuildinfo',
  'execution-engine/tsconfig.tsbuildinfo',
  
  // Source maps (keep only if needed for debugging)
  'cli/src/services/vscodeManager.js.map',
  'cli/src/commands/init.js.map',
  'cli/src/commands/status.js.map',
  'cli/src/commands/memory.js.map',
  'cli/src/index.js.map',
];

// Additional patterns to search and remove
const patternsToRemove = [
  /.*\.test\.[jt]s$/,
  /.*\.spec\.[jt]s$/,
  /.*\.map$/,
  /.*tsbuildinfo$/
];

function removeItem(itemPath) {
  if (!fs.existsSync(itemPath)) {
    console.log(`○ NOT FOUND: ${itemPath}`);
    return;
  }

  try {
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      fs.rmSync(itemPath, { recursive: true, force: true });
      console.log(`✓ REMOVED DIR: ${itemPath}`);
    } else {
      fs.unlinkSync(itemPath);
      console.log(`✓ REMOVED FILE: ${itemPath}`);
    }
  } catch (error) {
    console.log(`✗ ERROR removing ${itemPath}:`, error.message);
  }
}

function findAndRemoveByPattern(directory, patterns) {
  if (!fs.existsSync(directory)) return;
  
  try {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Skip node_modules and .git
        if (item === 'node_modules' || item === '.git') continue;
        findAndRemoveByPattern(fullPath, patterns);
      } else {
        // Check if file matches any removal pattern
        for (const pattern of patterns) {
          if (pattern.test(item)) {
            removeItem(fullPath);
            break;
          }
        }
      }
    }
  } catch (error) {
    console.log(`Error processing ${directory}:`, error.message);
  }
}

console.log('\n📁 Removing explicit test files and directories...');
itemsToRemove.forEach(removeItem);

console.log('\n🔍 Scanning for additional test files and build artifacts...');
findAndRemoveByPattern('.', patternsToRemove);

console.log('\n🧹 Cleaning node_modules test files...');
// Clean test files from node_modules (optional - saves space)
const nodeModulesDirs = ['cli/node_modules', 'execution-engine/node_modules', 'node_modules'];
nodeModulesDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Cleaning test files from ${dir}...`);
    findAndRemoveByPattern(dir, [/.*\.test\.[jt]s$/, /.*\.spec\.[jt]s$/]);
  }
});

console.log('\n✅ Production cleanup completed!');
console.log('\n📦 Next steps:');
console.log('1. Build the CLI: cd cli && npm run build');
console.log('2. Build the execution engine: cd execution-engine && npm run build');
console.log('3. Test the licensing system: node cli/dist/index.js license trial');
console.log('4. Package for distribution');