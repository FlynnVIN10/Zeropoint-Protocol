#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildStaticSite() {
  const sourceDir = 'docs';
  const buildDir = 'build';
  
  try {
    // Clean build directory
    await fs.remove(buildDir);
    await fs.ensureDir(buildDir);
    
    // Copy docs directory
    await fs.copy(sourceDir, path.join(buildDir, 'docs'));
    
    // Copy static assets
    if (await fs.pathExists('static')) {
      await fs.copy('static', buildDir);
    }
    
    // Create index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zeropoint Protocol Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #333; }
        .nav { margin: 20px 0; }
        .nav a { margin-right: 20px; color: #0066cc; text-decoration: none; }
        .nav a:hover { text-decoration: underline; }
        .content { line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Zeropoint Protocol Documentation</h1>
        <div class="nav">
            <a href="docs/">Documentation</a>
            <a href="docs/api/">API Reference</a>
            <a href="docs/design/">Design</a>
            <a href="docs/compliance/">Compliance</a>
        </div>
        <div class="content">
            <p>Welcome to the Zeropoint Protocol documentation. This site contains comprehensive information about the protocol, APIs, design specifications, and compliance requirements.</p>
            <p><a href="docs/">Browse Documentation</a></p>
        </div>
    </div>
</body>
</html>`;
    
    await fs.writeFile(path.join(buildDir, 'index.html'), indexHtml);
    
    console.log('✅ Static site built successfully in', buildDir);
    
  } catch (error) {
    console.error('❌ Error building static site:', error);
    process.exit(1);
  }
}

buildStaticSite();
