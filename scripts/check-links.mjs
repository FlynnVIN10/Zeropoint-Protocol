#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://zeropointprotocol.ai';

const routes = [
  '/',
  '/status',
  '/metrics',
  '/consensus',
  '/audits',
  '/library',
  '/governance',
  '/legal/terms',
  '/legal/privacy',
  '/legal/cookies'
];

async function checkLinks() {
  console.log('🔍 Checking internal links...');
  
  let failed = 0;
  
  for (const route of routes) {
    try {
      const response = await fetch(`${BASE_URL}${route}`);
      if (response.ok) {
        console.log(`✅ ${route} - ${response.status}`);
      } else {
        console.log(`❌ ${route} - ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${route} - Error: ${error.message}`);
      failed++;
    }
  }
  
  if (failed > 0) {
    console.log(`\n❌ ${failed} routes failed`);
    process.exit(1);
  } else {
    console.log('\n✅ All internal routes accessible');
  }
}

checkLinks().catch(console.error);
