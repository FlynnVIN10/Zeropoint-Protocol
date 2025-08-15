#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple link checker for internal routes
function checkInternalLinks() {
  console.log('🔍 Checking internal links...');
  
  const expectedRoutes = [
    '/',
    '/legal',
    '/legal/whitelabel', 
    '/docs',
    '/library',
    '/status'
  ];
  
  const missingRoutes = [];
  
  for (const route of expectedRoutes) {
    const routePath = path.join('src/app', route, 'page.tsx');
    if (!fs.existsSync(routePath)) {
      missingRoutes.push(route);
    }
  }
  
  if (missingRoutes.length > 0) {
    console.error('❌ Missing routes:', missingRoutes);
    process.exit(1);
  }
  
  console.log('✅ All internal routes present');
}

// Check for placeholder content
function checkForPlaceholders() {
  console.log('🔍 Checking for placeholder content...');
  
  const srcDir = 'src';
  const placeholderPatterns = [
    /TODO:/i,
    /FIXME:/i,
    /HACK:/i,
    /placeholder/i,
    /mock/i,
    /stub/i
  ];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        for (const pattern of placeholderPatterns) {
          if (pattern.test(content)) {
            console.error(`❌ Placeholder content found in ${filePath}`);
            process.exit(1);
          }
        }
      }
    }
  }
  
  scanDirectory(srcDir);
  console.log('✅ No placeholder content found');
}

// Check file structure
function checkFileStructure() {
  console.log('🔍 Checking file structure...');
  
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'tailwind.config.js',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/app/globals.css'
  ];
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required files:', missingFiles);
    process.exit(1);
  }
  
  console.log('✅ All required files present');
}

// Main execution
function main() {
  try {
    checkFileStructure();
    checkInternalLinks();
    checkForPlaceholders();
    console.log('🎉 All link checks passed!');
  } catch (error) {
    console.error('❌ Link check failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
