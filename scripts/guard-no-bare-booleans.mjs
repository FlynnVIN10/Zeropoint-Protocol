#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const bad = [];

(function walk(p) {
  for (const f of readdirSync(p, { withFileTypes: true })) {
    const fp = join(p, f.name);
    if (f.isDirectory()) {
      walk(fp);
    } else if (f.name.endsWith('.html')) {
      const s = readFileSync(fp, 'utf8');
      if (/>true<|>false</i.test(s)) {
        bad.push(fp);
      }
    }
  }
})('dist');

if (bad.length) {
  console.error('Boolean leaked:', bad);
  process.exit(1);
}

console.log('OK: no bare booleans.');
