#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing PWA Deployment Configuration...\n');

// Test 1: Check if all required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'public/app-icon.svg',
  'public/404.html',
  'dist/index.html',
  'dist/manifest.json',
  'dist/sw.js',
  'dist/app-icon.svg'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Run the build process first.');
  process.exit(1);
}

// Test 2: Validate manifest.json
console.log('\n📋 Validating manifest.json...');
try {
  const manifestPath = path.join(__dirname, '..', 'dist', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Check required fields
  const requiredFields = ['name', 'short_name', 'start_url', 'display', 'scope'];
  requiredFields.forEach(field => {
    if (manifest[field]) {
      console.log(`✅ ${field}: ${manifest[field]}`);
    } else {
      console.log(`❌ ${field} - MISSING`);
      allFilesExist = false;
    }
  });
  
  // Check GitHub Pages paths
  if (manifest.start_url.includes('/Focus-Hub/')) {
    console.log('✅ GitHub Pages base path in start_url');
  } else {
    console.log('❌ Missing GitHub Pages base path in start_url');
  }
  
  if (manifest.scope.includes('/Focus-Hub/')) {
    console.log('✅ GitHub Pages base path in scope');
  } else {
    console.log('❌ Missing GitHub Pages base path in scope');
  }
  
} catch (error) {
  console.log('❌ Invalid manifest.json:', error.message);
  allFilesExist = false;
}

// Test 3: Validate service worker
console.log('\n🔧 Validating service worker...');
try {
  const swPath = path.join(__dirname, '..', 'dist', 'sw.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  if (swContent.includes("BASE_PATH = '/Focus-Hub'")) {
    console.log('✅ Service worker has correct base path');
  } else {
    console.log('❌ Service worker missing correct base path');
    allFilesExist = false;
  }
  
  if (swContent.includes('urlsToCache')) {
    console.log('✅ Service worker has cache configuration');
  } else {
    console.log('❌ Service worker missing cache configuration');
    allFilesExist = false;
  }
  
  if (swContent.includes('background-sync')) {
    console.log('✅ Service worker has background sync');
  } else {
    console.log('❌ Service worker missing background sync');
  }
  
} catch (error) {
  console.log('❌ Invalid service worker:', error.message);
  allFilesExist = false;
}

// Test 4: Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
try {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredScripts = ['build', 'generate-pwa:prod', 'deploy'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`❌ ${script} - MISSING`);
    }
  });
  
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Final result
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 All tests passed! PWA is ready for deployment.');
  console.log('\n🚀 To deploy:');
  console.log('   1. git add .');
  console.log('   2. git commit -m "Update PWA configuration"');
  console.log('   3. git push origin main');
  console.log('\n📱 After deployment, visit:');
  console.log('   https://pranjalyadav33.github.io/Focus-Hub/');
} else {
  console.log('❌ Some tests failed. Please fix the issues above.');
  process.exit(1);
}
