#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

// Complete codebase classification script per CTO directive
const CURRENT_DATE = new Date().toISOString().split('T')[0]
const EVIDENCE_DIR = `public/evidence/compliance/${CURRENT_DATE}`
const CLASSIFICATION_FILE = `${EVIDENCE_DIR}/repo_classification.md`

// Ensure evidence directory exists
fs.mkdirSync(EVIDENCE_DIR, { recursive: true })

// File classification status
const CLASSIFICATION = {
  OPERATIONAL: 'Operational',
  GATED_PROTOTYPE: 'Gated Prototype',
  MOCK: 'Mock',
  DEPRECATED: 'Deprecated',
  UNKNOWN: 'Unknown'
}

// Mock indicators to detect and eliminate
const MOCK_INDICATORS = [
  'Math.random()',
  'in-memory',
  'mock',
  'stub',
  'placeholder',
  'TODO',
  'FIXME',
  'hardcoded',
  'demo',
  'fake',
  'simulate',
  'dummy',
  'test data',
  'sample data',
  'example data'
]

// Files that should be operational
const OPERATIONAL_PATTERNS = [
  'app/api/healthz',
  'app/api/readyz',
  'app/status/version.json',
  'app/status/openapi.json',
  'app/layout.tsx',
  'app/page.tsx',
  'lib/',
  'providers/',
  'components/',
  'services/'
]

// Files that should be gated prototypes
const GATED_PROTOTYPE_PATTERNS = [
  'app/api/training/metrics',
  'app/api/ai/reasoning',
  'app/api/ai/models',
  'app/api/quantum/compute',
  'app/api/ml/pipeline'
]

function analyzeFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        path: filePath,
        exists: false,
        classification: CLASSIFICATION.UNKNOWN,
        issues: ['File not found'],
        action: 'INVESTIGATE'
      }
    }

    const content = fs.readFileSync(filePath, 'utf8')
    const stats = fs.statSync(filePath)
    
    // Check for mock indicators
    const foundMockIndicators = MOCK_INDICATORS.filter(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    )
    
    // Check for compliance enforcement
    const hasComplianceCheck = content.includes('MOCKS_DISABLED') || 
                              content.includes('checkCompliance') ||
                              content.includes('503')
    
    // Check for database connections
    const hasDatabaseConnection = content.includes('dbManager') || 
                                 content.includes('DATABASE_URL') ||
                                 content.includes('prisma') ||
                                 content.includes('postgres')
    
    // Check for external service calls
    const hasExternalCalls = content.includes('fetch(') || 
                            content.includes('axios') ||
                            content.includes('http') ||
                            content.includes('api.')
    
    // Check for proper error handling
    const hasErrorHandling = content.includes('try {') || 
                            content.includes('catch (') ||
                            content.includes('throw new Error')
    
    // Check for input validation
    const hasValidation = content.includes('validate') || 
                         content.includes('required') ||
                         content.includes('missing') ||
                         content.includes('schema')
    
    // Determine classification
    let classification = CLASSIFICATION.UNKNOWN
    let action = 'REVIEW'
    const issues = []
    
    // Check if file should be operational
    const shouldBeOperational = OPERATIONAL_PATTERNS.some(pattern => 
      filePath.includes(pattern)
    )
    
    // Check if file should be gated prototype
    const shouldBeGated = GATED_PROTOTYPE_PATTERNS.some(pattern => 
      filePath.includes(pattern)
    )
    
    if (shouldBeOperational) {
      if (foundMockIndicators.length > 0) {
        classification = CLASSIFICATION.MOCK
        action = 'REMOVE_MOCKS'
        issues.push(`Contains mock indicators: ${foundMockIndicators.join(', ')}`)
      } else if (hasDatabaseConnection || hasExternalCalls) {
        classification = CLASSIFICATION.OPERATIONAL
        action = 'VERIFY'
      } else {
        classification = CLASSIFICATION.UNKNOWN
        action = 'IMPLEMENT'
        issues.push('Missing database connections or external service calls')
      }
    } else if (shouldBeGated) {
      if (hasComplianceCheck && foundMockIndicators.length > 0) {
        classification = CLASSIFICATION.GATED_PROTOTYPE
        action = 'VERIFY'
      } else if (foundMockIndicators.length > 0 && !hasComplianceCheck) {
        classification = CLASSIFICATION.MOCK
        action = 'ADD_COMPLIANCE'
        issues.push('Contains mock data without compliance gating')
      } else {
        classification = CLASSIFICATION.UNKNOWN
        action = 'REVIEW'
      }
    } else {
      // Generic classification logic
      if (foundMockIndicators.length > 0) {
        if (hasComplianceCheck) {
          classification = CLASSIFICATION.GATED_PROTOTYPE
          action = 'VERIFY'
        } else {
          classification = CLASSIFICATION.MOCK
          action = 'ADD_COMPLIANCE'
          issues.push('Contains mock data without compliance gating')
        }
      } else if (hasDatabaseConnection || hasExternalCalls) {
        classification = CLASSIFICATION.OPERATIONAL
        action = 'VERIFY'
      } else if (filePath.includes('deprecated') || filePath.includes('old')) {
        classification = CLASSIFICATION.DEPRECATED
        action = 'REMOVE'
      } else {
        classification = CLASSIFICATION.UNKNOWN
        action = 'REVIEW'
      }
    }
    
    // Additional issue detection
    if (!hasErrorHandling && classification !== CLASSIFICATION.DEPRECATED) {
      issues.push('Missing error handling')
    }
    
    if (!hasValidation && classification !== CLASSIFICATION.DEPRECATED) {
      issues.push('Missing input validation')
    }
    
    if (foundMockIndicators.length > 0 && !hasComplianceCheck) {
      issues.push('Mock data not properly gated')
    }
    
    return {
      path: filePath,
      exists: true,
      classification,
      action,
      size: stats.size,
      lines: content.split('\n').length,
      foundMockIndicators,
      hasComplianceCheck,
      hasDatabaseConnection,
      hasExternalCalls,
      hasErrorHandling,
      hasValidation,
      issues,
      modified: stats.mtime.toISOString()
    }
  } catch (error) {
    return {
      path: filePath,
      exists: false,
      classification: CLASSIFICATION.UNKNOWN,
      issues: [`Analysis error: ${error.message}`],
      action: 'INVESTIGATE'
    }
  }
}

function generateClassificationReport(files) {
  console.log('📋 Generating complete classification report...')
  
  let markdown = `# Complete Repository Classification Report\n\n`
  markdown += `**Date:** ${new Date().toISOString()}\n`
  markdown += `**Total Files:** ${files.length}\n`
  markdown += `**Classification Coverage:** 100%\n\n`
  
  // Summary statistics
  const classificationCounts = {}
  const actionCounts = {}
  
  files.forEach(file => {
    classificationCounts[file.classification] = (classificationCounts[file.classification] || 0) + 1
    actionCounts[file.action] = (actionCounts[file.action] || 0) + 1
  })
  
  markdown += `## Classification Summary\n\n`
  markdown += `| Classification | Count | Percentage |\n`
  markdown += `|----------------|-------|------------|\n`
  Object.entries(classificationCounts).forEach(([classification, count]) => {
    const percentage = ((count / files.length) * 100).toFixed(1)
    markdown += `| ${classification} | ${count} | ${percentage}% |\n`
  })
  
  markdown += `\n## Action Required Summary\n\n`
  markdown += `| Action | Count |\n`
  markdown += `|--------|-------|\n`
  Object.entries(actionCounts).forEach(([action, count]) => {
    markdown += `| ${action} | ${count} |\n`
  })
  
  markdown += `\n## Detailed File Analysis\n\n`
  markdown += `| File | Classification | Action | Issues | Mock Indicators | Compliance | DB | External |\n`
  markdown += `|------|----------------|--------|--------|-----------------|------------|----|----------|\n`
  
  files.forEach(file => {
    const mockIndicators = file.foundMockIndicators ? file.foundMockIndicators.length : 0
    const compliance = file.hasComplianceCheck ? '✅' : '❌'
    const db = file.hasDatabaseConnection ? '✅' : '❌'
    const external = file.hasExternalCalls ? '✅' : '❌'
    const issues = file.issues.length > 0 ? file.issues.join('; ') : 'None'
    
    markdown += `| ${file.path} | ${file.classification} | ${file.action} | ${issues} | ${mockIndicators} | ${compliance} | ${db} | ${external} |\n`
  })
  
  // Critical issues section
  markdown += `\n## Critical Issues Requiring Immediate Action\n\n`
  
  const mockFiles = files.filter(f => f.classification === CLASSIFICATION.MOCK)
  const unknownFiles = files.filter(f => f.classification === CLASSIFICATION.UNKNOWN)
  const filesNeedingCompliance = files.filter(f => f.action === 'ADD_COMPLIANCE')
  
  if (mockFiles.length > 0) {
    markdown += `### Mock Files (${mockFiles.length})\n`
    markdown += `These files contain mock data and must be remediated:\n\n`
    mockFiles.forEach(file => {
      markdown += `- **${file.path}**: ${file.issues.join(', ')}\n`
    })
    markdown += `\n`
  }
  
  if (filesNeedingCompliance.length > 0) {
    markdown += `### Files Needing Compliance Gating (${filesNeedingCompliance.length})\n`
    markdown += `These files need MOCKS_DISABLED compliance checks:\n\n`
    filesNeedingCompliance.forEach(file => {
      markdown += `- **${file.path}**: ${file.issues.join(', ')}\n`
    })
    markdown += `\n`
  }
  
  if (unknownFiles.length > 0) {
    markdown += `### Unknown Status Files (${unknownFiles.length})\n`
    markdown += `These files need manual review:\n\n`
    unknownFiles.forEach(file => {
      markdown += `- **${file.path}**: ${file.issues.join(', ')}\n`
    })
    markdown += `\n`
  }
  
  // Remediation plan
  markdown += `## Remediation Plan\n\n`
  markdown += `### Phase 1: Remove Mock Data (Priority: CRITICAL)\n`
  markdown += `1. Remove all mock indicators from operational files\n`
  markdown += `2. Add compliance gating to prototype files\n`
  markdown += `3. Implement proper 503 responses for gated endpoints\n\n`
  
  markdown += `### Phase 2: Implement Missing Functionality (Priority: HIGH)\n`
  markdown += `1. Add database connections to files missing them\n`
  markdown += `2. Implement external service calls where needed\n`
  markdown += `3. Add proper error handling and validation\n\n`
  
  markdown += `### Phase 3: Clean Up Unknown Files (Priority: MEDIUM)\n`
  markdown += `1. Review and classify unknown status files\n`
  markdown += `2. Remove deprecated files\n`
  markdown += `3. Implement missing functionality\n\n`
  
  // Write report
  fs.writeFileSync(CLASSIFICATION_FILE, markdown)
  console.log(`📁 Classification report saved: ${CLASSIFICATION_FILE}`)
  
  return {
    totalFiles: files.length,
    mockFiles: mockFiles.length,
    unknownFiles: unknownFiles.length,
    filesNeedingCompliance: filesNeedingCompliance.length,
    classificationCounts,
    actionCounts
  }
}

async function main() {
  console.log('🔍 CTO Directive: Complete Codebase Classification & Cleanup')
  console.log('=' .repeat(70))
  
  // Get all source files
  const sourceFiles = execSync('find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.mjs" -o -name "*.cjs" \\) | grep -v node_modules | grep -v .git | grep -v .next', { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.trim())
    .map(file => file.replace('./', ''))
  
  console.log(`📊 Analyzing ${sourceFiles.length} source files...`)
  
  // Analyze each file
  const analyzedFiles = sourceFiles.map(analyzeFile)
  
  // Generate classification report
  const report = generateClassificationReport(analyzedFiles)
  
  console.log('\n📊 CLASSIFICATION SUMMARY')
  console.log('=' .repeat(70))
  console.log(`Total Files: ${report.totalFiles}`)
  console.log(`Operational: ${report.classificationCounts[CLASSIFICATION.OPERATIONAL] || 0}`)
  console.log(`Gated Prototypes: ${report.classificationCounts[CLASSIFICATION.GATED_PROTOTYPE] || 0}`)
  console.log(`Mock Files: ${report.mockFiles}`)
  console.log(`Unknown Files: ${report.unknownFiles}`)
  console.log(`Files Needing Compliance: ${report.filesNeedingCompliance}`)
  
  if (report.mockFiles > 0) {
    console.log('\n🚨 CRITICAL: Mock files found that must be remediated!')
    console.log('Action required: Remove mock data or add compliance gating')
  }
  
  if (report.unknownFiles > 0) {
    console.log('\n⚠️  WARNING: Unknown status files need manual review')
  }
  
  if (report.mockFiles === 0 && report.unknownFiles === 0) {
    console.log('\n✅ All files properly classified! Repository cleanup complete.')
  } else {
    console.log('\n📋 Next steps: Execute remediation plan to achieve 100% compliance')
  }
}

main().catch(console.error)
