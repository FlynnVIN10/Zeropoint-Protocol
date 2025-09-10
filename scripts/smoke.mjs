import assert from 'node:assert';
import fs from 'node:fs';

const v = JSON.parse(fs.readFileSync('public/status/version.json', 'utf8'));
for (const k of ['phase','commit','ciStatus','buildTime']) assert(v[k], `missing ${k}`);
console.log('smoke ok');
