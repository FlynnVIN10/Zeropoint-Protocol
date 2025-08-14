#!/usr/bin/env node

// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

const https = require('https');

// CTO Directive: Manual cache purge for static files
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error('   CLOUDFLARE_ZONE_ID: Cloudflare Zone ID');
  console.error('   CLOUDFLARE_API_TOKEN: Cloudflare API Token with Zone:Cache Purge permissions');
  console.error('');
  console.error('🔧 To fix this:');
  console.error('   1. Get Zone ID from Cloudflare Dashboard > Domain > Overview');
  console.error('   2. Create API Token with Zone:Cache Purge permissions');
  console.error('   3. Set environment variables:');
  console.error('      export CLOUDFLARE_ZONE_ID="your-zone-id"');
  console.error('      export CLOUDFLARE_API_TOKEN="your-api-token"');
  process.exit(1);
}

function purgeCache() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      purge_everything: true
    });

    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.success) {
            console.log('✅ Cache purge successful');
            console.log('📊 Response:', response);
            resolve(response);
          } else {
            console.error('❌ Cache purge failed:', response.errors);
            reject(new Error('Cache purge failed'));
          }
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    console.log('🧹 Purging Cloudflare cache...');
    console.log('🌐 Zone ID:', CLOUDFLARE_ZONE_ID);
    console.log('🔑 Using API token with Zone:Cache Purge permissions');
    
    await purgeCache();
    
    console.log('✅ Cache purge completed successfully');
    console.log('🔄 Static files should now be accessible');
    console.log('📝 Test with: curl -I https://zeropointprotocol.ai/robots.txt');
    
  } catch (error) {
    console.error('❌ Cache purge failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { purgeCache };
