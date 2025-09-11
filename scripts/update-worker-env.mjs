import { execSync } from 'node:child_process';
import fs from 'node:fs';

// Get current commit and build time
const commit = execSync('git rev-parse --short HEAD').toString().trim();
const buildTime = new Date().toISOString();

console.log(`Updating Worker environment for commit: ${commit}`);

// Update Worker wrangler.toml
const wranglerPath = 'infra/worker-status/wrangler.toml';
const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');

const updatedContent = wranglerContent.replace(
  /COMMIT_SHA = "[^"]*"/g,
  `COMMIT_SHA = "${commit}"`
).replace(
  /BUILD_TIME = "[^"]*"/g,
  `BUILD_TIME = "${buildTime}"`
);

fs.writeFileSync(wranglerPath, updatedContent);
console.log('Worker environment updated');

// Deploy Worker
console.log('Deploying Worker...');
execSync('cd infra/worker-status && npx wrangler deploy', { stdio: 'inherit' });

console.log('✅ Worker deployed with live environment variables');
