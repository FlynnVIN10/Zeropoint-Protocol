#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

function findPlaceholderLinks(content) {
  const placeholderPatterns = [
    /href="[^"]*placeholder[^"]*"/gi,
    /href="[^"]*TODO[^"]*"/gi,
    /href="[^"]*FIXME[^"]*"/gi,
    /href="[^"]*example[^"]*"/gi,
    /href="[^"]*demo[^"]*"/gi,
    /href="[^"]*test[^"]*"/gi,
    /href="[^"]*sample[^"]*"/gi,
    /href="[^"]*coming-soon[^"]*"/gi,
    /href="[^"]*under-construction[^"]*"/gi,
    /href="[^"]*#"[^"]*"/gi, // Empty hash links
  ];
  
  const violations = [];
  
  placeholderPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      violations.push(...matches);
    }
  });
  
  return violations;
}

function checkFileForPlaceholders(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const violations = findPlaceholderLinks(content);
    
    if (violations.length > 0) {
      console.error(`❌ Placeholder links found in ${filePath}:`);
      violations.forEach(violation => console.error(`   ${violation}`));
      return violations;
    }
    
    return [];
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return ['ERROR_READING_FILE'];
  }
}

function scanDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const violations = [];
  
  try {
    const items = readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(dirPath, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        violations.push(...scanDirectory(fullPath, extensions));
      } else if (item.isFile() && extensions.some(ext => item.name.endsWith(ext))) {
        violations.push(...checkFileForPlaceholders(fullPath));
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dirPath}:`, error.message);
  }
  
  return violations;
}

function main() {
  console.log('🔍 Checking public routes for placeholder links...');
  
  const publicDirs = ['app', 'components'];
  let allViolations = [];
  
  publicDirs.forEach(dir => {
    if (readdirSync('.').includes(dir)) {
      console.log(`📁 Scanning ${dir}/...`);
      const violations = scanDirectory(dir);
      allViolations.push(...violations);
    }
  });
  
  if (allViolations.length > 0) {
    console.error(`❌ Found ${allViolations.length} placeholder link violations`);
    process.exit(1);
  }
  
  console.log('✅ No placeholder links found in public routes');
}

main();
