#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 CodeContext Pro - Production Build');
console.log('=====================================');

function runCommand(command, cwd = '.') {
  console.log(`\n📍 Running: ${command} (in ${cwd})`);
  try {
    execSync(command, { stdio: 'inherit', cwd });
    console.log('✅ Success!');
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function updatePackageJson() {
  console.log('\n📦 Updating package.json for production...');
  
  // Update CLI package.json
  const cliPackagePath = 'cli/package.json';
  if (fs.existsSync(cliPackagePath)) {
    const cliPackage = JSON.parse(fs.readFileSync(cliPackagePath, 'utf8'));
    cliPackage.name = 'codecontext-pro';
    cliPackage.version = '1.0.0';
    cliPackage.description = 'AI Coding Assistant Amplifier with Memory and Execution Engine';
    cliPackage.keywords = ['ai', 'coding', 'assistant', 'memory', 'execution', 'productivity'];
    cliPackage.homepage = 'https://codecontext.pro';
    cliPackage.bugs = { url: 'https://github.com/codecontext/codecontext-pro/issues' };
    
    // Remove dev dependencies that aren't needed in production
    if (cliPackage.devDependencies) {
      delete cliPackage.devDependencies['@types/jest'];
      delete cliPackage.devDependencies['jest'];
    }
    
    fs.writeFileSync(cliPackagePath, JSON.stringify(cliPackage, null, 2));
    console.log('✅ Updated CLI package.json');
  }
  
  // Update execution engine package.json
  const execPackagePath = 'execution-engine/package.json';
  if (fs.existsSync(execPackagePath)) {
    const execPackage = JSON.parse(fs.readFileSync(execPackagePath, 'utf8'));
    execPackage.version = '1.0.0';
    execPackage.description = 'CodeContext Pro Execution Engine';
    
    fs.writeFileSync(execPackagePath, JSON.stringify(execPackage, null, 2));
    console.log('✅ Updated execution engine package.json');
  }
}

function createProductionConfig() {
  console.log('\n⚙️ Creating production configuration...');
  
  const prodConfig = {
    name: 'CodeContext Pro',
    version: '1.0.0',
    mode: 'production',
    licenseRequired: true,
    features: {
      memory: true,
      execution: true,
      vscodeIntegration: true,
      trialPeriod: 7
    },
    support: {
      website: 'https://codecontext.pro',
      docs: 'https://docs.codecontext.pro',
      support: 'https://support.codecontext.pro'
    }
  };
  
  fs.writeFileSync('production-config.json', JSON.stringify(prodConfig, null, 2));
  console.log('✅ Created production-config.json');
}

// Step 1: Clean up development files
console.log('\n🧹 Step 1: Cleaning up development files...');
runCommand('node scripts/production-cleanup.js');

// Step 2: Update package.json files
updatePackageJson();

// Step 3: Install production dependencies
console.log('\n📦 Step 2: Installing production dependencies...');
runCommand('npm ci --production', 'cli');
runCommand('npm ci --production', 'execution-engine');

// Step 4: Build TypeScript
console.log('\n🔨 Step 3: Building TypeScript...');
runCommand('npm run build', 'cli');
runCommand('npm run build', 'execution-engine');

// Step 5: Create production configuration
createProductionConfig();

// Step 6: Test the build
console.log('\n🧪 Step 4: Testing the production build...');
try {
  runCommand('node cli/dist/index.js --version');
  runCommand('node cli/dist/index.js license status');
  console.log('✅ Production build test passed!');
} catch (error) {
  console.log('⚠️ Build test had issues, but continuing...');
}

console.log('\n🎉 Production build completed!');
console.log('\n📦 Deliverables:');
console.log('• cli/dist/ - Built CLI application');
console.log('• execution-engine/dist/ - Built execution engine');
console.log('• production-config.json - Production configuration');
console.log('\n🚀 Ready for distribution!');
console.log('\n💡 Next steps:');
console.log('1. Test licensing: node cli/dist/index.js license trial');
console.log('2. Test functionality: node cli/dist/index.js init --force');
console.log('3. Package for npm: npm pack (in cli directory)');
console.log('4. Create installer packages');