#!/usr/bin/env node

// CI validation script for environment and feature flags
import { execSync } from 'child_process'

const REQUIRED_ENV_VARS = {
  'MOCKS_DISABLED': '1',
  'TRAINING_ENABLED': '1',
  'SYNTHIENTS_ACTIVE': '1',
  'GOVERNANCE_MODE': 'dual-consensus',
  'PHASE': 'stage2',
  'CI_STATUS': 'green'
}

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...')
  
  const issues = []
  
  // Check wrangler.toml
  try {
    const wranglerContent = require('fs').readFileSync('wrangler.toml', 'utf8')
    
    Object.entries(REQUIRED_ENV_VARS).forEach(([varName, expectedValue]) => {
      if (!wranglerContent.includes(`${varName} = "${expectedValue}"`)) {
        issues.push(`Missing or incorrect ${varName} in wrangler.toml`)
      }
    })
    
    if (!wranglerContent.includes('[env.production.vars]')) {
      issues.push('Missing [env.production.vars] section in wrangler.toml')
    }
    
  } catch (error) {
    issues.push(`Error reading wrangler.toml: ${error.message}`)
  }
  
  // Check for mock code
  try {
    const mockCheck = execSync('grep -r "Math.random()" app/ --include="*.ts" --include="*.tsx" || true', { encoding: 'utf8' })
    if (mockCheck.trim()) {
      issues.push('Mock code detected in app directory')
    }
  } catch (error) {
    // grep returns non-zero when no matches found, which is expected
  }
  
  // Check service endpoints
  try {
    const healthCheck = execSync('curl -f https://zeropointprotocol.ai/api/readyz', { encoding: 'utf8' })
    const healthData = JSON.parse(healthCheck)
    
    if (healthData.mocks !== false) {
      issues.push('MOCKS_DISABLED not properly enforced in production')
    }
    
  } catch (error) {
    issues.push('Health check failed - service may be down')
  }
  
  if (issues.length > 0) {
    console.error('❌ Validation failed:')
    issues.forEach(issue => console.error(`  - ${issue}`))
    process.exit(1)
  } else {
    console.log('✅ Environment validation passed')
  }
}

validateEnvironment()
