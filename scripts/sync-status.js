#!/usr/bin/env node

/**
 * Zeropoint Protocol - Status Synchronization Script
 * Enhanced with lightweight polling and CI/CD integration
 * 
 * This script synchronizes the DEPLOYMENT_STATUS.md from the main repository
 * to the website's docs/status.md file for real-time status updates.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  mainRepoUrl: 'https://raw.githubusercontent.com/FlynnVIN10/Zeropoint-Protocol/main/DEPLOYMENT_STATUS.md',
  outputFile: path.join(__dirname, '../docs/status.md'),
  pollInterval: 5 * 60 * 1000, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 10000, // 10 seconds
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Logging functions
function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}]${colors.reset} ${message}`);
}

function error(message) {
  log(`ERROR: ${message}`, 'red');
}

function success(message) {
  log(`SUCCESS: ${message}`, 'green');
}

function warning(message) {
  log(`WARNING: ${message}`, 'yellow');
}

function info(message) {
  log(`INFO: ${message}`, 'blue');
}

// HTTP request function with timeout and retry logic
function fetchWithRetry(url, retries = CONFIG.maxRetries) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      req.destroy();
      reject(new Error('Request timeout'));
    }, CONFIG.timeout);

    const req = https.get(url, (res) => {
      clearTimeout(timeout);
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    req.on('timeout', () => {
      clearTimeout(timeout);
      req.destroy();
      reject(new Error('Request timeout'));
    });
  }).catch((err) => {
    if (retries > 0) {
      warning(`Request failed, retrying... (${retries} attempts left)`);
      return new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay))
        .then(() => fetchWithRetry(url, retries - 1));
    }
    throw err;
  });
}

// Function to add Docusaurus frontmatter
function addFrontmatter(content) {
  return `---
id: status
title: System Status
sidebar_label: Status
description: Real-time system status and deployment information for Zeropoint Protocol
keywords: [status, deployment, system, monitoring]
---

${content}

---
*Last updated: ${new Date().toISOString()}*
*Auto-synced from [main repository](https://github.com/FlynnVIN10/Zeropoint-Protocol)*
`;
}

// Function to update status page
async function updateStatusPage(content) {
  try {
    const frontmatterContent = addFrontmatter(content);
    
    // Ensure docs directory exists
    const docsDir = path.dirname(CONFIG.outputFile);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(CONFIG.outputFile, frontmatterContent, 'utf8');
    success(`Status page updated: ${CONFIG.outputFile}`);
    
    // Log the update to soulchain if available
    await logToSoulchain('Status page synchronized');
    
    return true;
  } catch (err) {
    error(`Failed to update status page: ${err.message}`);
    return false;
  }
}

// Function to log to soulchain (optional)
async function logToSoulchain(message) {
  try {
    const logData = {
      action: 'status_sync',
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'website_repo',
        target: 'docs/status.md'
      },
      data: message
    };

    // Try to log to soulchain endpoint (if available)
    const https = require('https');
    const postData = JSON.stringify(logData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/v1/soulchain/persist',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        info('Logged to soulchain successfully');
      }
    });

    req.on('error', () => {
      // Silently fail if soulchain is not available
    });

    req.write(postData);
    req.end();
  } catch (err) {
    // Silently fail if soulchain logging fails
  }
}

// Main sync function
async function syncStatus() {
  try {
    info('Starting status synchronization...');
    
    // Fetch status from main repository
    const content = await fetchWithRetry(CONFIG.mainRepoUrl);
    
    // Update the status page
    const success = await updateStatusPage(content);
    
    if (success) {
      success('Status synchronization completed successfully');
    } else {
      error('Status synchronization failed');
      process.exit(1);
    }
  } catch (err) {
    error(`Status synchronization failed: ${err.message}`);
    process.exit(1);
  }
}

// Polling function
async function startPolling() {
  info(`Starting status polling (interval: ${CONFIG.pollInterval / 1000}s)`);
  
  // Initial sync
  await syncStatus();
  
  // Set up polling
  setInterval(async () => {
    try {
      await syncStatus();
    } catch (err) {
      error(`Polling sync failed: ${err.message}`);
    }
  }, CONFIG.pollInterval);
}

// CI/CD integration function
async function ciSync() {
  info('Running CI/CD status sync...');
  
  try {
    await syncStatus();
    success('CI/CD status sync completed');
    process.exit(0);
  } catch (err) {
    error(`CI/CD status sync failed: ${err.message}`);
    process.exit(1);
  }
}

// Command line interface
function showUsage() {
  console.log(`
Zeropoint Protocol - Status Synchronization Script

Usage:
  node sync-status.js [command]

Commands:
  sync        Run a single synchronization (default)
  poll        Start continuous polling
  ci          Run CI/CD mode (exits with code 0/1)

Options:
  --help      Show this help message

Examples:
  node sync-status.js sync
  node sync-status.js poll
  node sync-status.js ci

Environment Variables:
  POLL_INTERVAL    Polling interval in milliseconds (default: 300000)
  MAX_RETRIES      Maximum retry attempts (default: 3)
  TIMEOUT          Request timeout in milliseconds (default: 10000)
`);
}

// Main execution
async function main() {
  const command = process.argv[2] || 'sync';
  
  // Override config with environment variables
  if (process.env.POLL_INTERVAL) {
    CONFIG.pollInterval = parseInt(process.env.POLL_INTERVAL);
  }
  if (process.env.MAX_RETRIES) {
    CONFIG.maxRetries = parseInt(process.env.MAX_RETRIES);
  }
  if (process.env.TIMEOUT) {
    CONFIG.timeout = parseInt(process.env.TIMEOUT);
  }
  
  switch (command) {
    case 'sync':
      await syncStatus();
      break;
    case 'poll':
      await startPolling();
      break;
    case 'ci':
      await ciSync();
      break;
    case '--help':
    case 'help':
      showUsage();
      break;
    default:
      error(`Unknown command: ${command}`);
      showUsage();
      process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch((err) => {
    error(`Script execution failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  syncStatus,
  updateStatusPage,
  startPolling,
  ciSync
};