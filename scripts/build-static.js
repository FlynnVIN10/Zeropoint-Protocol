#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building static site...');

// Create build directory
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// Create phase directories
const phases = ['09', '10', '11', '12'];
phases.forEach(phase => {
    const phaseDir = path.join(buildDir, 'phases', phase);
    if (!fs.existsSync(phaseDir)) {
        fs.mkdirSync(phaseDir, { recursive: true });
    }
});

// Create status directory
const statusDir = path.join(buildDir, 'status');
if (!fs.existsSync(statusDir)) {
    fs.mkdirSync(statusDir, { recursive: true });
}

// Create robots.txt
const robotsContent = `User-agent: *
Allow: /

Sitemap: https://zeropointprotocol.ai/sitemap.xml`;

fs.writeFileSync(path.join(buildDir, 'robots.txt'), robotsContent);

// Create sitemap.xml
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://zeropointprotocol.ai/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://zeropointprotocol.ai/status/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://zeropointprotocol.ai/phases/09/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://zeropointprotocol.ai/phases/10/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://zeropointprotocol.ai/phases/11/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://zeropointprotocol.ai/phases/12/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

fs.writeFileSync(path.join(buildDir, 'sitemap.xml'), sitemapContent);

// Create main index.html
const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zeropoint Protocol - Ethical Agentic AI Platform</title>
    <meta name="description" content="Zeropoint Protocol - Ethical Agentic AI Platform">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #ffffff; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #00ff88; }
        .phase-links { margin: 20px 0; }
        .phase-links a { display: inline-block; margin: 10px; padding: 10px 20px; background: #333; color: #00ff88; text-decoration: none; border-radius: 5px; }
        .phase-links a:hover { background: #00ff88; color: #000; }
        .status { background: #333; padding: 20px; border-radius: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Zeropoint Protocol</h1>
        <p>Ethical Agentic AI Platform</p>

        <div class="status">
            <h2>🚀 Status: Operational</h2>
            <p>All systems are functioning normally. CI/CD pipeline is stable and secure.</p>
        </div>

        <div class="phase-links">
            <h2>Development Phases</h2>
            <a href="/phases/09/">Phase 09</a>
            <a href="/phases/10/">Phase 10</a>
            <a href="/phases/11/">Phase 11</a>
            <a href="/phases/12/">Phase 12</a>
        </div>

        <div class="phase-links">
            <h2>Resources</h2>
            <a href="/status/">Status</a>
            <a href="/docs/">Documentation</a>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(buildDir, 'index.html'), indexContent);

// Create phase pages
phases.forEach(phase => {
    const phaseContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phase ${phase} - Zeropoint Protocol</title>
    <meta name="description" content="Phase ${phase} of Zeropoint Protocol development">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #ffffff; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #00ff88; }
        .back-link { margin: 20px 0; }
        .back-link a { color: #00ff88; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Phase ${phase}</h1>
        <p>Phase ${phase} content will be available here.</p>
        <div class="back-link">
            <a href="/">← Back to Home</a>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(buildDir, 'phases', phase, 'index.html'), phaseContent);
});

// Create status page
const statusContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status - Zeropoint Protocol</title>
    <meta name="description" content="System status for Zeropoint Protocol">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #ffffff; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #00ff88; }
        .status-item { background: #333; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .status-ok { border-left: 5px solid #00ff88; }
        .back-link { margin: 20px 0; }
        .back-link a { color: #00ff88; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>System Status</h1>

        <div class="status-item status-ok">
            <h3>✅ Website</h3>
            <p>Operational - All systems functioning normally</p>
        </div>

        <div class="status-item status-ok">
            <h3>✅ CI/CD Pipeline</h3>
            <p>Operational - Automated deployments working</p>
        </div>

        <div class="status-item status-ok">
            <h3>✅ Security</h3>
            <p>Operational - All security measures active</p>
        </div>

        <div class="back-link">
            <a href="/">← Back to Home</a>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(buildDir, 'status', 'index.html'), statusContent);

console.log('✅ Static site built successfully!');
console.log('📁 Build directory:', buildDir);
console.log('🌐 Ready for deployment');
