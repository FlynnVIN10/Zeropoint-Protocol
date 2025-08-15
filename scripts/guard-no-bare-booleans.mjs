#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const root = 'dist';
let bad = [];

function walk(p) {
  for (const f of readdirSync(p, { withFileTypes: true })) {
    const fp = join(p, f.name);
    if (f.isDirectory()) walk(fp);
    else if (f.name.endsWith('.html')) {
      const s = readFileSync(fp, 'utf8');
      if (/>true</i.test(s) || />false</i.test(s)) bad.push(fp);
    }
  }
}

walk(root);
if (bad.length) {
  console.error('Bare boolean leaked in:', bad);
  process.exit(1);
}
console.log('No bare booleans detected.');
