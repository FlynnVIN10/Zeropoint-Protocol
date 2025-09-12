#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

// Compliance verification script per CTO directive
const BASE_URL = 'https://zeropointprotocol.ai'
const EVIDENCE_DIR = 'public/evidence/phase2/verify'

async function makeRequest(url) {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries())
    }
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      data: null
    }
  }
}

async function verifyCompliance() {
  console.log('🔒 CTO Directive: Zeropoint Protocol Compliance Verification')
  console.log('=' .repeat(60))
  
  const results = {
    timestamp: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || 'unknown',
    compliance: {
      environment_flags: {},
      endpoint_health: {},
      mock_scan: {},
      ci_status: {},
      governance: {}
    },
    violations: [],
    recommendations: []
  }

  // Milestone 1: Environment Verification
  console.log('\n📋 MILESTONE 1: Environment Verification')
  console.log('-'.repeat(40))
  
  const healthz = await makeRequest(`${BASE_URL}/api/healthz`)
  const readyz = await makeRequest(`${BASE_URL}/api/readyz`)
  const version = await makeRequest(`${BASE_URL}/status/version.json`)
  
  results.compliance.environment_flags = {
    healthz_mocks: healthz.data?.mocks,
    readyz_mocks: readyz.data?.mocks,
    mocks_disabled_expected: true,
    mocks_disabled_actual: healthz.data?.mocks === false && readyz.data?.mocks === false
  }
  
  if (results.compliance.environment_flags.mocks_disabled_actual) {
    console.log('✅ MOCKS_DISABLED=1 properly enforced')
  } else {
    console.log('❌ MOCKS_DISABLED not properly enforced')
    results.violations.push('MOCKS_DISABLED not properly set - mocks may be enabled')
  }

  // Milestone 2: Endpoint Health Validation
  console.log('\n📋 MILESTONE 2: Endpoint Health Validation')
  console.log('-'.repeat(40))
  
  const requiredEndpoints = [
    { name: 'healthz', url: '/api/healthz', required: ['status', 'commit', 'buildTime', 'phase'] },
    { name: 'readyz', url: '/api/readyz', required: ['ready', 'commit', 'buildTime', 'phase'] },
    { name: 'version', url: '/status/version.json', required: ['commit', 'buildTime', 'env', 'phase'] }
  ]
  
  for (const endpoint of requiredEndpoints) {
    const response = await makeRequest(`${BASE_URL}${endpoint.url}`)
    const isHealthy = response.status === 200 && 
                     endpoint.required.every(field => response.data?.[field] !== undefined)
    
    results.compliance.endpoint_health[endpoint.name] = {
      status: response.status,
      healthy: isHealthy,
      has_required_fields: endpoint.required.every(field => response.data?.[field] !== undefined),
      data: response.data
    }
    
    if (isHealthy) {
      console.log(`✅ ${endpoint.name}: HTTP ${response.status}, all required fields present`)
    } else {
      console.log(`❌ ${endpoint.name}: HTTP ${response.status}, missing fields: ${endpoint.required.filter(f => !response.data?.[f])}`)
      results.violations.push(`${endpoint.name} endpoint not compliant`)
    }
  }

  // Milestone 3: Mock Scan and Removal
  console.log('\n📋 MILESTONE 3: Mock Scan and Removal')
  console.log('-'.repeat(40))
  
  const mockedEndpoints = [
    '/api/training/metrics',
    '/api/ai/reasoning',
    '/api/ai/models',
    '/api/quantum/compute',
    '/api/ml/pipeline'
  ]
  
  let blockedCount = 0
  for (const endpoint of mockedEndpoints) {
    const response = await makeRequest(`${BASE_URL}${endpoint}`)
    const isBlocked = response.status === 503 || response.data?.code === 'ENDPOINT_MIGRATION_IN_PROGRESS'
    
    if (isBlocked) {
      console.log(`✅ ${endpoint}: Properly blocked (HTTP ${response.status})`)
      blockedCount++
    } else {
      console.log(`❌ ${endpoint}: Not properly blocked (HTTP ${response.status})`)
      results.violations.push(`${endpoint} not properly blocked`)
    }
  }
  
  results.compliance.mock_scan = {
    total_checked: mockedEndpoints.length,
    properly_blocked: blockedCount,
    compliance_rate: (blockedCount / mockedEndpoints.length) * 100
  }

  // Milestone 4: CI & Evidence Checks
  console.log('\n📋 MILESTONE 4: CI & Evidence Checks')
  console.log('-'.repeat(40))
  
  const ciStatus = version.data?.ciStatus === 'green'
  results.compliance.ci_status = {
    status: version.data?.ciStatus,
    is_green: ciStatus
  }
  
  if (ciStatus) {
    console.log('✅ CI Status: Green')
  } else {
    console.log('❌ CI Status: Not green')
    results.violations.push('CI status not green')
  }

  // Generate evidence file
  const evidenceDir = path.join(process.cwd(), EVIDENCE_DIR, results.commit)
  fs.mkdirSync(evidenceDir, { recursive: true })
  
  const evidenceFile = path.join(evidenceDir, 'compliance-verification.json')
  fs.writeFileSync(evidenceFile, JSON.stringify(results, null, 2))
  
  console.log(`\n📁 Evidence saved to: ${evidenceFile}`)

  // Summary
  console.log('\n📊 COMPLIANCE SUMMARY')
  console.log('=' .repeat(60))
  console.log(`Total Violations: ${results.violations.length}`)
  console.log(`Mock Endpoints Blocked: ${blockedCount}/${mockedEndpoints.length}`)
  console.log(`CI Status: ${ciStatus ? 'Green' : 'Not Green'}`)
  
  if (results.violations.length === 0) {
    console.log('\n🎉 ALL MILESTONES PASSED - PRODUCTION READY')
    process.exit(0)
  } else {
    console.log('\n⚠️  COMPLIANCE VIOLATIONS DETECTED')
    results.violations.forEach((violation, i) => {
      console.log(`${i + 1}. ${violation}`)
    })
    process.exit(1)
  }
}

verifyCompliance().catch(console.error)
