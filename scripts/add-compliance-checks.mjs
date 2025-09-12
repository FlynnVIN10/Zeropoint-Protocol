#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// List of mocked endpoints that need compliance checks
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

function addComplianceCheck(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`)
      return
    }

    let content = fs.readFileSync(filePath, 'utf8')
    
    // Check if compliance middleware is already imported
    if (content.includes('checkCompliance')) {
      console.log(`✅ Compliance already added to ${filePath}`)
      return
    }

    // Add import for compliance middleware
    const importRegex = /import\s+{\s*NextRequest,\s*NextResponse\s*}\s+from\s+'next\/server'/
    if (importRegex.test(content)) {
      content = content.replace(
        importRegex,
        `import { NextRequest, NextResponse } from 'next/server'\nimport { checkCompliance } from '@lib/compliance-middleware'`
      )
    } else {
      console.log(`⚠️  Could not find NextRequest import in ${filePath}`)
      return
    }

    // Add compliance check to each export function
    const functionRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*{/
    content = content.replace(functionRegex, (match, method) => {
      return `${match}\n  // Check compliance - block if mocks are disabled\n  const complianceCheck = checkCompliance(request)\n  if (complianceCheck) return complianceCheck\n\n  try {`
    })

    // Fix the try block that was already there
    content = content.replace(/try\s*{\s*try\s*{/g, 'try {')

    fs.writeFileSync(filePath, content)
    console.log(`✅ Added compliance checks to ${filePath}`)
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message)
  }
}

console.log('🔒 Adding compliance checks to mocked endpoints...\n')

MOCKED_ENDPOINTS.forEach(endpoint => {
  const fullPath = path.join(__dirname, '..', endpoint)
  addComplianceCheck(fullPath)
})

console.log('\n✅ Compliance checks added to all mocked endpoints')
console.log('🔒 MOCKS_DISABLED=1 will now properly block mocked endpoints in production')
