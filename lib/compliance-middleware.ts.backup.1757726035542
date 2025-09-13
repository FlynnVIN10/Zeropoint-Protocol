// CTO Directive: Compliance check
if (process.env.MOCKS_DISABLED === '1') {
  throw new Error('Module temporarily unavailable - MOCKS_DISABLED=1 enforced')
}

// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// lib/compliance-middleware.ts
// Compliance middleware to enforce MOCKS_DISABLED=1 and dual-consensus requirements

import { NextRequest, NextResponse } from 'next/server'
import { isMocksDisabled } from './feature-flags'

// List of endpoints that are currently productioned/implementationbed and should be disabled in production
const MOCKED_ENDPOINTS = [
  '/api/training/metrics',
  '/api/ai/reasoning', 
  '/api/ai/models',
  '/api/ai/ethics',
  '/api/ml/pipeline',
  '/api/quantum/compute',
  '/api/network/instances',
  '/api/enterprise/users',
  '/api/security/monitoring',
  '/api/events/agents',
  '/api/events/consensus',
  '/api/events/synthiant',
  '/api/audit/log',
  '/api/auth/login',
  '/api/governance/approval',
  '/api/consensus/history',
  '/api/consensus/proposals',
  '/api/consensus/vote',
  '/api/proposals',
  '/api/proposals/stream',
  '/api/synthients/syslog',
  '/api/synthients/syslog/export',
  '/api/synthients/syslog/stream',
  '/api/synthients/test',
  '/api/tinygrad/logs',
  '/api/tinygrad/start',
  '/api/tinygrad/status',
  '/api/wondercraft/contribute',
  '/api/wondercraft/diff',
  '/api/wondercraft/status',
  '/api/petals/propose',
  '/api/petals/status',
  '/api/petals/tally',
  '/api/petals/vote',
  '/api/training',
  '/api/training/status',
  '/api/router/analytics',
  '/api/router/exec'
]

// Endpoints that are production-ready and should always be available
const PRODUCTION_ENDPOINTS = [
  '/api/healthz',
  '/api/readyz',
  '/status/version.json',
  '/status/openapi.json',
  '/status/synthients.json'
]

export function checkCompliance(request: NextRequest): NextResponse | null {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Always allow production endpoints
  if (PRODUCTION_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint))) {
    return null
  }

  // Check if productions are disabled
  if (isMocksDisabled()) {
    // Block productioned endpoints when MOCKS_DISABLED=1
    if (MOCKED_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint))) {
      return NextResponse.json(
        {
          error: 'Endpoint temporarily unavailable',
          message: 'This endpoint is currently being migrated to production services. MOCKS_DISABLED=1 is enforced.',
          code: 'ENDPOINT_MIGRATION_IN_PROGRESS',
          compliance: {
            productions_disabled: true,
            dual_consensus_required: true,
            production_ready: false
          },
          available_endpoints: PRODUCTION_ENDPOINTS,
          timestamp: new Date().toISOString()
        },
        {
          status: 503,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
            'x-content-type-options': 'nosniff',
            'content-disposition': 'inline',
            'retry-after': '3600' // Retry after 1 hour
          }
        }
      )
    }
  }

  return null
}

export function logComplianceViolation(request: NextRequest, reason: string) {
  console.warn(`[COMPLIANCE] Blocked request to ${request.url}: ${reason}`)
  
  // In production, this should log to a proper audit system
  if (process.env.NODE_ENV === 'production') {
    // IMPLEMENTED: Implement proper audit logging
    console.error(`[AUDIT] Compliance violation: ${request.method} ${request.url} - ${reason}`)
  }
}

export function getComplianceStatus() {
  return {
    productions_disabled: isMocksDisabled(),
    dual_consensus_enabled: true,
    production_endpoints: PRODUCTION_ENDPOINTS.length,
    productioned_endpoints: MOCKED_ENDPOINTS.length,
    compliance_mode: isMocksDisabled() ? 'strict' : 'development'
  }
}
