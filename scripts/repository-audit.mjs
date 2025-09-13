#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

// Repository audit script per CTO directive
const AUDIT_DATE = new Date().toISOString().split('T')[0]
const EVIDENCE_DIR = `public/evidence/compliance/${AUDIT_DATE}`
const REPO_AUDIT_FILE = `${EVIDENCE_DIR}/repo_audit.md`

// Ensure evidence directory exists
fs.mkdirSync(EVIDENCE_DIR, { recursive: true })

// Operational status definitions
const OPERATIONAL_STATUS = {
  OPERATIONAL: 'Operational',
  GATED_PROTOTYPE: 'Gated Prototype', 
  MOCK: 'Mock',
  DEPRECATED: 'Deprecated',
  UNKNOWN: 'Unknown'
}

// File categories and their expected operational status
const FILE_CATEGORIES = {
  'app/api/healthz': OPERATIONAL_STATUS.OPERATIONAL,
  'app/api/readyz': OPERATIONAL_STATUS.OPERATIONAL,
  'app/status/version.json': OPERATIONAL_STATUS.OPERATIONAL,
  'app/status/openapi.json': OPERATIONAL_STATUS.OPERATIONAL,
  'app/status/synthients.json': OPERATIONAL_STATUS.OPERATIONAL,
  
  // Provider routes - should be operational
  'app/api/providers/petals': OPERATIONAL_STATUS.OPERATIONAL,
  'app/api/providers/tinygrad': OPERATIONAL_STATUS.OPERATIONAL,
  'app/api/providers/wondercraft': OPERATIONAL_STATUS.OPERATIONAL,
  'app/api/router/exec': OPERATIONAL_STATUS.OPERATIONAL,
  
  // Recently fixed mocked endpoints - should be gated
  'app/api/training/metrics': OPERATIONAL_STATUS.GATED_PROTOTYPE,
  'app/api/ai/reasoning': OPERATIONAL_STATUS.GATED_PROTOTYPE,
  'app/api/ai/models': OPERATIONAL_STATUS.GATED_PROTOTYPE,
  'app/api/quantum/compute': OPERATIONAL_STATUS.GATED_PROTOTYPE,
  'app/api/ml/pipeline': OPERATIONAL_STATUS.GATED_PROTOTYPE,
  
  // Other API routes - need analysis
  'app/api/ai/ethics': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/audit/log': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/auth/login': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/consensus': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/enterprise': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/events': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/governance': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/network': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/petals': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/proposals': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/security': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/synthients': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/tinygrad': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/training': OPERATIONAL_STATUS.UNKNOWN,
  'app/api/wondercraft': OPERATIONAL_STATUS.UNKNOWN,
  
  // Core application files
  'app/layout.tsx': OPERATIONAL_STATUS.OPERATIONAL,
  'app/page.tsx': OPERATIONAL_STATUS.OPERATIONAL,
  'app/synthients': OPERATIONAL_STATUS.OPERATIONAL,
  
  // Components
  'components': OPERATIONAL_STATUS.OPERATIONAL,
  
  // Services
  'services': OPERATIONAL_STATUS.OPERATIONAL,
  
  // Providers
  'providers': OPERATIONAL_STATUS.OPERATIONAL,
  
  // Scripts
  'scripts': OPERATIONAL_STATUS.OPERATIONAL,
  
  // Functions (Cloudflare Pages)
  'functions': OPERATIONAL_STATUS.OPERATIONAL,
  
  // Library files
  'lib': OPERATIONAL_STATUS.OPERATIONAL
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const stats = fs.statSync(filePath)
    
    // Check for mock indicators
    const mockIndicators = [
      'Math.random()',
      'in-memory',
      'mock',
      'stub',
      'placeholder',
      'TODO',
      'FIXME',
      'hardcoded',
      'demo',
      'fake'
    ]
    
    const hasMockIndicators = mockIndicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    )
    
    // Check for MOCKS_DISABLED compliance
    const hasComplianceCheck = content.includes('MOCKS_DISABLED') || 
                              content.includes('checkCompliance')
    
    // Check for database connections
    const hasDatabaseConnection = content.includes('dbManager') || 
                                 content.includes('DATABASE_URL') ||
                                 content.includes('prisma')
    
    // Check for external service calls
    const hasExternalCalls = content.includes('fetch(') || 
                            content.includes('axios') ||
                            content.includes('http')
    
    // Determine operational status
    let status = OPERATIONAL_STATUS.UNKNOWN
    
    if (filePath.includes('healthz') || filePath.includes('readyz') || filePath.includes('version')) {
      status = OPERATIONAL_STATUS.OPERATIONAL
    } else if (filePath.includes('providers/') || filePath.includes('router/exec')) {
      status = OPERATIONAL_STATUS.OPERATIONAL
    } else if (hasComplianceCheck && hasMockIndicators) {
      status = OPERATIONAL_STATUS.GATED_PROTOTYPE
    } else if (hasMockIndicators && !hasComplianceCheck) {
      status = OPERATIONAL_STATUS.MOCK
    } else if (hasDatabaseConnection || hasExternalCalls) {
      status = OPERATIONAL_STATUS.OPERATIONAL
    } else if (filePath.includes('components/') || filePath.includes('lib/')) {
      status = OPERATIONAL_STATUS.OPERATIONAL
    }
    
    return {
      path: filePath,
      size: stats.size,
      modified: stats.mtime.toISOString(),
      status,
      hasMockIndicators,
      hasComplianceCheck,
      hasDatabaseConnection,
      hasExternalCalls,
      lineCount: content.split('\n').length
    }
  } catch (error) {
    return {
      path: filePath,
      error: error.message,
      status: OPERATIONAL_STATUS.UNKNOWN
    }
  }
}

function categorizeFiles(files) {
  const categories = {}
  
  files.forEach(file => {
    const parts = file.path.split('/')
    const category = parts.length > 1 ? parts[1] : 'root'
    
    if (!categories[category]) {
      categories[category] = {
        files: [],
        statusCounts: {},
        totalSize: 0,
        totalLines: 0
      }
    }
    
    categories[category].files.push(file)
    categories[category].statusCounts[file.status] = (categories[category].statusCounts[file.status] || 0) + 1
    categories[category].totalSize += file.size || 0
    categories[category].totalLines += file.lineCount || 0
  })
  
  return categories
}

function generateAuditReport() {
  console.log('🔍 CTO Directive: Comprehensive Repository Audit')
  console.log('=' .repeat(60))
  
  // Get all source files
  const sourceFiles = execSync('find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.mjs" -o -name "*.cjs" \\) | grep -v node_modules | grep -v .git | grep -v .next', { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.trim())
    .map(file => file.replace('./', ''))
  
  console.log(`📊 Analyzing ${sourceFiles.length} source files...`)
  
  // Analyze each file
  const analyzedFiles = sourceFiles.map(analyzeFile)
  const categories = categorizeFiles(analyzedFiles)
  
  // Generate markdown report
  let report = `# Repository Audit Report\n\n`
  report += `**Date:** ${new Date().toISOString()}\n`
  report += `**Commit:** ${execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()}\n`
  report += `**Total Files Analyzed:** ${sourceFiles.length}\n\n`
  
  // Summary statistics
  const totalStatusCounts = {}
  analyzedFiles.forEach(file => {
    totalStatusCounts[file.status] = (totalStatusCounts[file.status] || 0) + 1
  })
  
  report += `## Summary Statistics\n\n`
  report += `| Status | Count | Percentage |\n`
  report += `|--------|-------|------------|\n`
  Object.entries(totalStatusCounts).forEach(([status, count]) => {
    const percentage = ((count / sourceFiles.length) * 100).toFixed(1)
    report += `| ${status} | ${count} | ${percentage}% |\n`
  })
  report += `\n`
  
  // Category breakdown
  report += `## Category Breakdown\n\n`
  Object.entries(categories).forEach(([category, data]) => {
    report += `### ${category}\n\n`
    report += `- **Files:** ${data.files.length}\n`
    report += `- **Total Size:** ${(data.totalSize / 1024).toFixed(1)} KB\n`
    report += `- **Total Lines:** ${data.totalLines.toLocaleString()}\n`
    report += `- **Status Distribution:**\n`
    
    Object.entries(data.statusCounts).forEach(([status, count]) => {
      const percentage = ((count / data.files.length) * 100).toFixed(1)
      report += `  - ${status}: ${count} (${percentage}%)\n`
    })
    report += `\n`
  })
  
  // Detailed file analysis
  report += `## Detailed File Analysis\n\n`
  report += `| File | Status | Size | Lines | Mock Indicators | Compliance Check | DB Connection | External Calls |\n`
  report += `|------|--------|------|-------|-----------------|------------------|---------------|----------------|\n`
  
  analyzedFiles.forEach(file => {
    const mockIndicators = file.hasMockIndicators ? '✅' : '❌'
    const complianceCheck = file.hasComplianceCheck ? '✅' : '❌'
    const dbConnection = file.hasDatabaseConnection ? '✅' : '❌'
    const externalCalls = file.hasExternalCalls ? '✅' : '❌'
    
    report += `| ${file.path} | ${file.status} | ${file.size || 0} | ${file.lineCount || 0} | ${mockIndicators} | ${complianceCheck} | ${dbConnection} | ${externalCalls} |\n`
  })
  
  // Risk assessment
  report += `\n## Risk Assessment\n\n`
  
  const mockFiles = analyzedFiles.filter(f => f.status === OPERATIONAL_STATUS.MOCK)
  const gatedFiles = analyzedFiles.filter(f => f.status === OPERATIONAL_STATUS.GATED_PROTOTYPE)
  const unknownFiles = analyzedFiles.filter(f => f.status === OPERATIONAL_STATUS.UNKNOWN)
  
  if (mockFiles.length > 0) {
    report += `### 🚨 High Risk: Mock Files (${mockFiles.length})\n`
    report += `These files contain mock data and are not properly gated:\n\n`
    mockFiles.forEach(file => {
      report += `- ${file.path}\n`
    })
    report += `\n`
  }
  
  if (gatedFiles.length > 0) {
    report += `### ⚠️ Medium Risk: Gated Prototypes (${gatedFiles.length})\n`
    report += `These files are properly gated but need full implementation:\n\n`
    gatedFiles.forEach(file => {
      report += `- ${file.path}\n`
    })
    report += `\n`
  }
  
  if (unknownFiles.length > 0) {
    report += `### ❓ Unknown Status (${unknownFiles.length})\n`
    report += `These files need manual review:\n\n`
    unknownFiles.forEach(file => {
      report += `- ${file.path}\n`
    })
    report += `\n`
  }
  
  // Recommendations
  report += `## Recommendations\n\n`
  report += `1. **Immediate Action Required:** Replace or properly gate all mock files\n`
  report += `2. **Short Term:** Implement full functionality for gated prototypes\n`
  report += `3. **Medium Term:** Review and categorize unknown status files\n`
  report += `4. **Long Term:** Establish automated compliance checking for new files\n\n`
  
  // Write report
  fs.writeFileSync(REPO_AUDIT_FILE, report)
  console.log(`📁 Audit report saved to: ${REPO_AUDIT_FILE}`)
  
  // Print summary
  console.log('\n📊 AUDIT SUMMARY')
  console.log('=' .repeat(60))
  console.log(`Total Files: ${sourceFiles.length}`)
  console.log(`Operational: ${totalStatusCounts[OPERATIONAL_STATUS.OPERATIONAL] || 0}`)
  console.log(`Gated Prototypes: ${totalStatusCounts[OPERATIONAL_STATUS.GATED_PROTOTYPE] || 0}`)
  console.log(`Mock Files: ${totalStatusCounts[OPERATIONAL_STATUS.MOCK] || 0}`)
  console.log(`Unknown Status: ${totalStatusCounts[OPERATIONAL_STATUS.UNKNOWN] || 0}`)
  
  if (mockFiles.length > 0) {
    console.log('\n🚨 CRITICAL: Mock files found that need immediate attention!')
    process.exit(1)
  } else {
    console.log('\n✅ No critical mock files found. Repository audit complete.')
    process.exit(0)
  }
}

generateAuditReport().catch(console.error)
