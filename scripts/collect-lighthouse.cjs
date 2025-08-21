#!/usr/bin/env node

/**
 * Sonic MAX Cursor Playbook - Phase 5 Lighthouse Collection
 * Placeholder script for Lighthouse HTML collection
 * Tag: [SONIC-MAX][PHASE5]
 */

const { writeJSON } = require('./_lib/fsx.cjs');
const fs = require('fs');
const path = require('path');

async function collectLighthouse() {
  console.log('🚀 Sonic MAX Cursor Playbook - Phase 5 Lighthouse Collection');
  console.log('─'.repeat(60));
  
  try {
    // Check if existing Lighthouse HTML exists
    const existingLighthouse = 'lighthouse-audit.json';
    const targetDir = 'public/evidence/phase5';
    const targetFile = path.join(targetDir, 'lighthouse_report.html');
    
    if (fs.existsSync(existingLighthouse)) {
      console.log('📊 Found existing Lighthouse audit, copying to public evidence...');
      
      // Create target directory if it doesn't exist
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Copy existing Lighthouse report
      const lighthouseData = JSON.parse(fs.readFileSync(existingLighthouse, 'utf8'));
      
      // Create HTML report from JSON data
      const htmlReport = generateLighthouseHTML(lighthouseData);
      fs.writeFileSync(targetFile, htmlReport);
      
      console.log(`✅ Lighthouse report copied to: ${targetFile}`);
      
      // Save collection metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        source: existingLighthouse,
        target: targetFile,
        status: 'copied',
        scores: {
          performance: lighthouseData.categories?.performance?.score * 100 || 'N/A',
          accessibility: lighthouseData.categories?.accessibility?.score * 100 || 'N/A',
          bestPractices: lighthouseData.categories?.['best-practices']?.score * 100 || 'N/A',
          seo: lighthouseData.categories?.seo?.score * 100 || 'N/A'
        }
      };
      
      await writeJSON('evidence/phase5/lighthouse/collection_metadata.json', metadata);
      
    } else {
      console.log('⚠️  No existing Lighthouse audit found, creating placeholder...');
      
      // Create placeholder HTML
      const placeholderHTML = generatePlaceholderHTML();
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.writeFileSync(targetFile, placeholderHTML);
      console.log(`✅ Placeholder Lighthouse report created at: ${targetFile}`);
      
      // Save collection metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        status: 'placeholder_created',
        note: 'No existing Lighthouse audit found, placeholder created'
      };
      
      await writeJSON('evidence/phase5/lighthouse/collection_metadata.json', metadata);
    }
    
    console.log('🎯 Lighthouse collection completed');
    
  } catch (error) {
    console.error('💥 Lighthouse collection failed:', error.message);
    process.exit(1);
  }
}

function generateLighthouseHTML(data) {
  const scores = {
    performance: Math.round((data.categories?.performance?.score || 0) * 100),
    accessibility: Math.round((data.categories?.accessibility?.score || 0) * 100),
    bestPractices: Math.round((data.categories?.['best-practices']?.score || 0) * 100),
    seo: Math.round((data.categories?.seo?.score || 0) * 100)
  };
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lighthouse Report - Zeropoint Protocol</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .score { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .good { color: green; }
        .needs-improvement { color: orange; }
        .poor { color: red; }
        .metric { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🚀 Lighthouse Report - Zeropoint Protocol</h1>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Tag:</strong> [SONIC-MAX][PHASE5]</p>
    
    <div class="metric">
        <h2>Performance</h2>
        <div class="score ${scores.performance >= 80 ? 'good' : scores.performance >= 50 ? 'needs-improvement' : 'poor'}">
            ${scores.performance}/100
        </div>
    </div>
    
    <div class="metric">
        <h2>Accessibility</h2>
        <div class="score ${scores.accessibility >= 80 ? 'good' : scores.accessibility >= 50 ? 'needs-improvement' : 'poor'}">
            ${scores.accessibility}/100
        </div>
    </div>
    
    <div class="metric">
        <h2>Best Practices</h2>
        <div class="score ${scores.bestPractices >= 80 ? 'good' : scores.bestPractices >= 50 ? 'needs-improvement' : 'poor'}">
            ${scores.bestPractices}/100
        </div>
    </div>
    
    <div class="metric">
        <h2>SEO</h2>
        <div class="score ${scores.seo >= 80 ? 'good' : scores.seo >= 50 ? 'needs-improvement' : 'poor'}">
            ${scores.seo}/100
        </div>
    </div>
    
    <hr>
    <p><em>Generated by Sonic MAX Cursor Playbook - Phase 5</em></p>
</body>
</html>`;
}

function generatePlaceholderHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lighthouse Report - Zeropoint Protocol</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .placeholder { padding: 40px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="placeholder">
        <h1>🚀 Lighthouse Report - Zeropoint Protocol</h1>
        <p><strong>Status:</strong> Placeholder</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Tag:</strong> [SONIC-MAX][PHASE5]</p>
        <hr>
        <p>This is a placeholder Lighthouse report.</p>
        <p>To generate a real report, run Lighthouse CI or use the browser DevTools.</p>
        <p><em>Generated by Sonic MAX Cursor Playbook - Phase 5</em></p>
    </div>
</body>
</html>`;
}

// Run if called directly
if (require.main === module) {
  collectLighthouse().catch(error => {
    console.error('💥 Lighthouse collection failed:', error.message);
    process.exit(1);
  });
}

module.exports = { collectLighthouse };
