#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const MOCKED_ENDPOINTS = [
  'app/api/ai/ethics/route.ts',
  'app/api/ai/models/route.ts', 
  'app/api/ai/reasoning/route.ts',
  'app/api/ml/pipeline/route.ts',
  'app/api/quantum/compute/route.ts',
  'app/api/network/instances/route.ts',
  'app/api/enterprise/users/route.ts',
  'app/api/security/monitoring/route.ts',
  'app/api/events/agents/route.ts',
  'app/api/events/consensus/route.ts',
  'app/api/events/synthiant/route.ts',
  'app/api/audit/log/route.ts',
  'app/api/auth/login/route.ts',
  'app/api/governance/approval/route.ts',
  'app/api/consensus/history/route.ts',
  'app/api/consensus/proposals/route.ts',
  'app/api/consensus/vote/route.ts',
  'app/api/proposals/route.ts',
  'app/api/proposals/[id]/route.ts',
  'app/api/proposals/stream/route.ts',
  'app/api/synthients/syslog/route.ts',
  'app/api/synthients/syslog/export/route.ts',
  'app/api/synthients/syslog/stream/route.ts',
  'app/api/synthients/test/route.ts',
  'app/api/tinygrad/logs/[jobId]/route.ts',
  'app/api/tinygrad/start/route.ts',
  'app/api/tinygrad/status/[jobId]/route.ts',
  'app/api/wondercraft/contribute/route.ts',
  'app/api/wondercraft/diff/route.ts',
  'app/api/wondercraft/diff/[assetId]/route.ts',
  'app/api/wondercraft/status/[contributionId]/route.ts',
  'app/api/petals/propose/route.ts',
  'app/api/petals/status/[proposalId]/route.ts',
  'app/api/petals/tally/[proposalId]/route.ts',
  'app/api/petals/vote/[proposalId]/route.ts',
  'app/api/training/route.ts',
  'app/api/training/status/route.ts',
  'app/api/router/analytics/route.ts',
  'app/api/router/exec/route.ts'
]

const COMPLIANCE_BLOCK = `
  // CTO Directive: Block mocked endpoints when MOCKS_DISABLED=1
  if (process.env.MOCKS_DISABLED === '1') {
    return NextResponse.json(
      {
        error: 'Endpoint temporarily unavailable',
        message: 'This endpoint is currently being migrated to production services. MOCKS_DISABLED=1 is enforced.',
        code: 'ENDPOINT_MIGRATION_IN_PROGRESS',
        compliance: {
          mocks_disabled: true,
          dual_consensus_required: true,
          production_ready: false
        },
        timestamp: new Date().toISOString()
      },
      {
        status: 503,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
          'content-disposition': 'inline',
          'retry-after': '3600'
        }
      }
    )
  }`

function applyComplianceFix(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`)
      return
    }

    let content = fs.readFileSync(filePath, 'utf8')
    
    // Check if compliance block is already added
    if (content.includes('CTO Directive: Block mocked endpoints')) {
      console.log(`✅ Compliance already applied to ${filePath}`)
      return
    }

    // Add compliance block to each export function
    const functionRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*{/
    content = content.replace(functionRegex, (match) => {
      return `${match}${COMPLIANCE_BLOCK}\n\n  try {`
    })

    // Fix double try blocks
    content = content.replace(/try\s*{\s*try\s*{/g, 'try {')

    fs.writeFileSync(filePath, content)
    console.log(`✅ Applied compliance fix to ${filePath}`)
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message)
  }
}

console.log('🔒 Applying CTO Directive compliance fixes...\n')

MOCKED_ENDPOINTS.forEach(endpoint => {
  const fullPath = path.join(process.cwd(), endpoint)
  applyComplianceFix(fullPath)
})

console.log('\n✅ Compliance fixes applied to all mocked endpoints')
console.log('🔒 MOCKS_DISABLED=1 will now properly block mocked endpoints in production')
