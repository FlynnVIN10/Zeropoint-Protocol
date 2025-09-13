#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

// Service reconciliation script per CTO directive
const EVIDENCE_DIR = 'public/evidence/research/service_status'
const CURRENT_DATE = new Date().toISOString().split('T')[0]

// Ensure evidence directory exists
fs.mkdirSync(EVIDENCE_DIR, { recursive: true })

// Service definitions and their expected functionality
const SERVICES = {
  'tinygrad': {
    name: 'Tinygrad Training Service',
    description: 'Handles Synthient training jobs using Tinygrad backend',
    endpoints: [
      'app/api/tinygrad/start/route.ts',
      'app/api/tinygrad/status/[jobId]/route.ts', 
      'app/api/tinygrad/logs/[jobId]/route.ts',
      'app/api/training/route.ts',
      'app/api/training/status/route.ts',
      'app/api/training/metrics/route.ts'
    ],
    components: [
      'components/tinygrad/JobStartForm.tsx',
      'components/tinygrad/JobStatusViewer.tsx',
      'components/tinygrad/JobLogsViewer.tsx'
    ],
    providers: [
      'providers/tinygrad.ts'
    ],
    expectedStatus: 'OPERATIONAL'
  },
  'petals': {
    name: 'Petals Consensus Service', 
    description: 'Manages consensus proposals and voting through Petals network',
    endpoints: [
      'app/api/petals/propose/route.ts',
      'app/api/petals/status/[proposalId]/route.ts',
      'app/api/petals/tally/[proposalId]/route.ts',
      'app/api/petals/vote/[proposalId]/route.ts',
      'app/api/consensus/proposals/route.ts',
      'app/api/consensus/vote/route.ts',
      'app/api/consensus/history/route.ts'
    ],
    components: [
      'components/petals/ProposalForm.tsx',
      'components/petals/VoteForm.tsx'
    ],
    providers: [
      'providers/petals.ts'
    ],
    expectedStatus: 'OPERATIONAL'
  },
  'wondercraft': {
    name: 'Wondercraft Contribution Service',
    description: 'Handles Synthient contributions and asset management',
    endpoints: [
      'app/api/wondercraft/contribute/route.ts',
      'app/api/wondercraft/diff/route.ts',
      'app/api/wondercraft/diff/[assetId]/route.ts',
      'app/api/wondercraft/status/[contributionId]/route.ts'
    ],
    components: [
      'components/wondercraft/ContributionForm.tsx',
      'components/wondercraft/DiffForm.tsx'
    ],
    providers: [
      'providers/wondercraft.ts'
    ],
    expectedStatus: 'OPERATIONAL'
  },
  'ml_pipeline': {
    name: 'ML Pipeline Service',
    description: 'Manages machine learning pipeline execution and monitoring',
    endpoints: [
      'app/api/ml/pipeline/route.ts'
    ],
    expectedStatus: 'GATED_PROTOTYPE'
  },
  'quantum': {
    name: 'Quantum Compute Service',
    description: 'Provides quantum computing capabilities for advanced Synthient operations',
    endpoints: [
      'app/api/quantum/compute/route.ts'
    ],
    expectedStatus: 'GATED_PROTOTYPE'
  }
}

function analyzeServiceFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        path: filePath,
        exists: false,
        status: 'MISSING',
        issues: ['File not found']
      }
    }

    const content = fs.readFileSync(filePath, 'utf8')
    const stats = fs.statSync(filePath)
    
    // Analyze file characteristics
    const hasMockIndicators = /Math\.random\(\)|in-memory|mock|stub|placeholder|TODO|FIXME|hardcoded|demo|fake/i.test(content)
    const hasComplianceCheck = /MOCKS_DISABLED|checkCompliance/.test(content)
    const hasDatabaseConnection = /dbManager|DATABASE_URL|prisma/i.test(content)
    const hasExternalCalls = /fetch\(|axios|http/i.test(content)
    const hasErrorHandling = /try\s*\{|catch\s*\(|throw\s+new\s+Error/i.test(content)
    const hasValidation = /validate|required|missing/i.test(content)
    
    // Determine operational status
    let status = 'UNKNOWN'
    const issues = []
    
    if (hasComplianceCheck && hasMockIndicators) {
      status = 'GATED_PROTOTYPE'
    } else if (hasMockIndicators && !hasComplianceCheck) {
      status = 'MOCK'
      issues.push('Contains mock data without compliance gating')
    } else if (hasDatabaseConnection || hasExternalCalls) {
      status = 'OPERATIONAL'
    } else if (hasErrorHandling && hasValidation) {
      status = 'OPERATIONAL'
    } else {
      status = 'INCOMPLETE'
      issues.push('Missing database connections or external service calls')
    }
    
    if (!hasErrorHandling) {
      issues.push('Missing error handling')
    }
    
    if (!hasValidation) {
      issues.push('Missing input validation')
    }
    
    return {
      path: filePath,
      exists: true,
      status,
      size: stats.size,
      lines: content.split('\n').length,
      hasMockIndicators,
      hasComplianceCheck,
      hasDatabaseConnection,
      hasExternalCalls,
      hasErrorHandling,
      hasValidation,
      issues
    }
  } catch (error) {
    return {
      path: filePath,
      exists: false,
      status: 'ERROR',
      issues: [`Analysis error: ${error.message}`]
    }
  }
}

function generateServiceStatusReport(serviceName, serviceDef) {
  console.log(`\n🔍 Analyzing ${serviceName} service...`)
  
  const report = {
    service: serviceName,
    name: serviceDef.name,
    description: serviceDef.description,
    analysisDate: new Date().toISOString(),
    expectedStatus: serviceDef.expectedStatus,
    files: {},
    overallStatus: 'UNKNOWN',
    readiness: 0,
    gaps: [],
    recommendations: [],
    nextSteps: []
  }
  
  // Analyze all service files
  const allFiles = [
    ...serviceDef.endpoints,
    ...(serviceDef.components || []),
    ...(serviceDef.providers || [])
  ]
  
  let operationalCount = 0
  let totalFiles = 0
  
  allFiles.forEach(filePath => {
    const analysis = analyzeServiceFile(filePath)
    report.files[filePath] = analysis
    totalFiles++
    
    if (analysis.status === 'OPERATIONAL') {
      operationalCount++
    } else if (analysis.status === 'MOCK') {
      report.gaps.push(`Mock implementation in ${filePath}`)
    } else if (analysis.status === 'MISSING') {
      report.gaps.push(`Missing file: ${filePath}`)
    }
  })
  
  // Calculate readiness percentage
  report.readiness = totalFiles > 0 ? Math.round((operationalCount / totalFiles) * 100) : 0
  
  // Determine overall status
  if (report.readiness >= 80) {
    report.overallStatus = 'OPERATIONAL'
  } else if (report.readiness >= 50) {
    report.overallStatus = 'PARTIAL'
  } else if (report.readiness >= 20) {
    report.overallStatus = 'PROTOTYPE'
  } else {
    report.overallStatus = 'NON_FUNCTIONAL'
  }
  
  // Generate recommendations
  if (report.gaps.length > 0) {
    report.recommendations.push('Address identified gaps before production deployment')
  }
  
  if (report.readiness < 80) {
    report.recommendations.push('Improve implementation completeness to reach operational status')
  }
  
  if (report.overallStatus === 'NON_FUNCTIONAL') {
    report.recommendations.push('Service requires complete reimplementation')
  }
  
  // Generate next steps
  if (report.overallStatus !== 'OPERATIONAL') {
    report.nextSteps.push('Implement missing functionality')
    report.nextSteps.push('Add proper error handling and validation')
    report.nextSteps.push('Connect to real backend services')
  }
  
  if (report.gaps.some(gap => gap.includes('Mock'))) {
    report.nextSteps.push('Replace mock implementations with real functionality')
  }
  
  // Write service status document
  const serviceReportPath = `${EVIDENCE_DIR}/${serviceName}.md`
  let markdown = `# ${serviceDef.name} Status Report\n\n`
  markdown += `**Service:** ${serviceName}\n`
  markdown += `**Analysis Date:** ${report.analysisDate}\n`
  markdown += `**Overall Status:** ${report.overallStatus}\n`
  markdown += `**Readiness:** ${report.readiness}%\n\n`
  
  markdown += `## Description\n\n${serviceDef.description}\n\n`
  
  markdown += `## File Analysis\n\n`
  markdown += `| File | Status | Issues |\n`
  markdown += `|------|--------|--------|\n`
  
  Object.entries(report.files).forEach(([filePath, analysis]) => {
    const issues = analysis.issues.length > 0 ? analysis.issues.join(', ') : 'None'
    markdown += `| ${filePath} | ${analysis.status} | ${issues} |\n`
  })
  
  markdown += `\n## Gaps Identified\n\n`
  if (report.gaps.length > 0) {
    report.gaps.forEach(gap => {
      markdown += `- ${gap}\n`
    })
  } else {
    markdown += `No gaps identified.\n`
  }
  
  markdown += `\n## Recommendations\n\n`
  report.recommendations.forEach(rec => {
    markdown += `- ${rec}\n`
  })
  
  markdown += `\n## Next Steps\n\n`
  report.nextSteps.forEach(step => {
    markdown += `- ${step}\n`
  })
  
  fs.writeFileSync(serviceReportPath, markdown)
  console.log(`📁 Service report saved: ${serviceReportPath}`)
  
  return report
}

function generateOverallReconciliationReport(serviceReports) {
  const reportPath = `${EVIDENCE_DIR}/overall_reconciliation.md`
  
  let markdown = `# Service Functionality Reconciliation Report\n\n`
  markdown += `**Analysis Date:** ${new Date().toISOString()}\n`
  markdown += `**Total Services:** ${Object.keys(serviceReports).length}\n\n`
  
  markdown += `## Executive Summary\n\n`
  
  const statusCounts = {}
  Object.values(serviceReports).forEach(report => {
    statusCounts[report.overallStatus] = (statusCounts[report.overallStatus] || 0) + 1
  })
  
  markdown += `| Status | Count |\n`
  markdown += `|--------|-------|\n`
  Object.entries(statusCounts).forEach(([status, count]) => {
    markdown += `| ${status} | ${count} |\n`
  })
  
  markdown += `\n## Service Status Overview\n\n`
  
  Object.entries(serviceReports).forEach(([serviceName, report]) => {
    markdown += `### ${report.name}\n\n`
    markdown += `- **Status:** ${report.overallStatus}\n`
    markdown += `- **Readiness:** ${report.readiness}%\n`
    markdown += `- **Gaps:** ${report.gaps.length}\n\n`
  })
  
  markdown += `## Critical Issues\n\n`
  
  const criticalIssues = []
  Object.entries(serviceReports).forEach(([serviceName, report]) => {
    if (report.overallStatus === 'NON_FUNCTIONAL') {
      criticalIssues.push(`${serviceName}: Service is non-functional`)
    }
    if (report.gaps.some(gap => gap.includes('Mock'))) {
      criticalIssues.push(`${serviceName}: Contains mock implementations`)
    }
  })
  
  if (criticalIssues.length > 0) {
    criticalIssues.forEach(issue => {
      markdown += `- ${issue}\n`
    })
  } else {
    markdown += `No critical issues identified.\n`
  }
  
  fs.writeFileSync(reportPath, markdown)
  console.log(`📁 Overall reconciliation report saved: ${reportPath}`)
}

async function main() {
  console.log('🔍 CTO Directive: Service Functionality Reconciliation')
  console.log('=' .repeat(60))
  
  const serviceReports = {}
  
  // Analyze each service
  Object.entries(SERVICES).forEach(([serviceName, serviceDef]) => {
    const report = generateServiceStatusReport(serviceName, serviceDef)
    serviceReports[serviceName] = report
  })
  
  // Generate overall reconciliation report
  generateOverallReconciliationReport(serviceReports)
  
  console.log('\n📊 RECONCILIATION SUMMARY')
  console.log('=' .repeat(60))
  
  Object.entries(serviceReports).forEach(([serviceName, report]) => {
    console.log(`${serviceName}: ${report.overallStatus} (${report.readiness}%)`)
  })
  
  const criticalServices = Object.values(serviceReports).filter(r => r.overallStatus === 'NON_FUNCTIONAL')
  if (criticalServices.length > 0) {
    console.log(`\n🚨 CRITICAL: ${criticalServices.length} services are non-functional!`)
    process.exit(1)
  } else {
    console.log('\n✅ Service reconciliation complete!')
  }
}

main().catch(console.error)
