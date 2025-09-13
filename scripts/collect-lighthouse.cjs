// CTO Directive: Compliance check
if (process.env.MOCKS_DISABLED === '1') {
  throw new Error('Module temporarily unavailable - MOCKS_DISABLED=1 enforced')
}

#!/usr/bin/env node

/**
 * Lighthouse Collection for Evidence v19
 */

const { writeJSON } = require('./_lib/fsx.cjs');
const fs = require('fs');
const path = require('path');

async function collectLighthouse() {
  console.log('Lighthouse Collection — Evidence v19');
  try {
    const existingLighthouse = 'lighthouse-audit.json';
    const publicDir = 'public/evidence/v19/lighthouse';
    const targetFile = path.join(publicDir, 'lighthouse_report.html');

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    if (fs.existsSync(existingLighthouse)) {
      const lighthouseData = JSON.parse(fs.readFileSync(existingLighthouse, 'utf8'));
      const htmlReport = generateLighthouseHTML(lighthouseData);
      fs.writeFileSync(targetFile, htmlReport);
      await writeJSON('evidence/v19/lighthouse/collection_metadata.json', {
        timestamp: new Date().toISOString(),
        source: existingLighthouse,
        target: `/evidence/v19/lighthouse/lighthouse_report.html`,
        status: 'copied',
        scores: {
          performance: lighthouseData.categories?.performance?.score * 100 || 'N/A',
          accessibility: lighthouseData.categories?.accessibility?.score * 100 || 'N/A',
          bestPractices: lighthouseData.categories?.['best-practices']?.score * 100 || 'N/A',
          seo: lighthouseData.categories?.seo?.score * 100 || 'N/A'
        }
      });
      console.log(`Wrote ${targetFile}`);
    } else {
      const implementationHTML = generatePlaceholderHTML();
      fs.writeFileSync(targetFile, implementationHTML);
      await writeJSON('evidence/v19/lighthouse/collection_metadata.json', {
        timestamp: new Date().toISOString(),
        status: 'implementation_created',
        note: 'No existing Lighthouse audit found'
      });
      console.log(`Wrote implementation ${targetFile}`);
    }
  } catch (error) {
    console.error('Lighthouse collection failed:', error.message);
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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lighthouse Report - Zeropoint Protocol</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background:#111; color:#eee }
    .score { font-size: 2em; font-weight: bold; margin: 10px 0; }
    .good { color: #00c853; }
    .needs-improvement { color: #ffab00; }
    .poor { color: #d50000; }
    .metric { margin: 20px 0; padding: 15px; border: 1px solid #333; border-radius: 5px; background:#1a1a1a }
  </style>
</head>
<body>
  <h1>🚀 Lighthouse Report - Zeropoint Protocol</h1>
  <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
  <div class="metric">
    <h2>Performance</h2>
    <div class="score ${scores.performance >= 90 ? 'good' : scores.performance >= 50 ? 'needs-improvement' : 'poor'}">${scores.performance}/100</div>
  </div>
  <div class="metric">
    <h2>Accessibility</h2>
    <div class="score ${scores.accessibility >= 90 ? 'good' : scores.accessibility >= 50 ? 'needs-improvement' : 'poor'}">${scores.accessibility}/100</div>
  </div>
  <div class="metric">
    <h2>Best Practices</h2>
    <div class="score ${scores.bestPractices >= 90 ? 'good' : scores.bestPractices >= 50 ? 'needs-improvement' : 'poor'}">${scores.bestPractices}/100</div>
  </div>
  <div class="metric">
    <h2>SEO</h2>
    <div class="score ${scores.seo >= 90 ? 'good' : scores.seo >= 50 ? 'needs-improvement' : 'poor'}">${scores.seo}/100</div>
  </div>
</body>
</html>`;
}

function generatePlaceholderHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lighthouse Report - Zeropoint Protocol</title>
</head>
<body>
  <h1>Lighthouse Report - Zeropoint Protocol</h1>
  <p>Status: Placeholder</p>
  <p>Generated: ${new Date().toISOString()}</p>
</body>
</html>`;
}

if (require.main === module) {
  collectLighthouse().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { collectLighthouse };
