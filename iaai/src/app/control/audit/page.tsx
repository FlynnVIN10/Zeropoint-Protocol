'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle, CheckCircle, Info, Shield, User, Database, Server } from 'lucide-react'

interface AuditEvent {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'critical'
  category: 'security' | 'governance' | 'system' | 'user' | 'data' | 'deployment'
  title: string
  description: string
  actor: string
  target: string
  metadata: Record<string, any>
  hash: string
}

export default function AuditPage() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    {
      id: '1',
      timestamp: '2025-08-12 14:30:00',
      level: 'info',
      category: 'deployment',
      title: 'Phase P0-1 Scope Controls Deployed',
      description: 'Successfully deployed scope enforcement and mock detection to production',
      actor: 'PM',
      target: 'Production Environment',
      metadata: {
        commit: 'a1b2c3d',
        environment: 'production',
        duration: '3m 24s',
        status: 'success'
      },
      hash: 'sha256:abc123...'
    },
    {
      id: '2',
      timestamp: '2025-08-12 14:25:00',
      level: 'info',
      category: 'governance',
      title: 'Data Governance Policy Updated',
      description: 'Updated data governance policy with new PII scanning requirements',
      actor: 'Security Team',
      target: 'Data Governance Policy',
      metadata: {
        policyVersion: '2.1.0',
        changes: ['PII scanning', 'License validation', 'Checksum verification'],
        approvalStatus: 'approved'
      },
      hash: 'sha256:def456...'
    },
    {
      id: '3',
      timestamp: '2025-08-12 14:20:00',
      level: 'warning',
      category: 'security',
      title: 'Mock Implementation Detected',
      description: 'CI pipeline detected mock implementation in scope-controlled component',
      actor: 'CI/CD Pipeline',
      target: 'Scope Enforcement',
      metadata: {
        component: 'data-governance',
        file: 'src/tinygrad/data-governance.ts',
        line: 45,
        mockType: 'synthetic_data'
      },
      hash: 'sha256:ghi789...'
    },
    {
      id: '4',
      timestamp: '2025-08-12 14:15:00',
      level: 'info',
      category: 'system',
      title: 'tinygrad Integration Started',
      description: 'Initiated tinygrad integration with ROCm on tinybox hardware',
      actor: 'DevOps',
      target: 'tinybox Hardware',
      metadata: {
        tinygradVersion: '0.8.0',
        rocmVersion: '5.7.0',
        hardware: 'tinybox-v1'
      },
      hash: 'sha256:jkl012...'
    },
    {
      id: '5',
      timestamp: '2025-08-12 14:10:00',
      level: 'error',
      category: 'data',
      title: 'PII Scan Failed',
      description: 'PII scanning process failed due to dataset corruption',
      actor: 'Data Governance Service',
      target: 'Dataset: wikipedia-2024',
      metadata: {
        dataset: 'wikipedia-2024',
        error: 'checksum_mismatch',
        expectedHash: 'sha256:expected...',
        actualHash: 'sha256:actual...'
      },
      hash: 'sha256:mno345...'
    },
    {
      id: '6',
      timestamp: '2025-08-12 14:05:00',
      level: 'info',
      category: 'user',
      title: 'User Authentication Success',
      description: 'User successfully authenticated via OAuth2',
      actor: 'user@zeropointprotocol.ai',
      target: 'Authentication Service',
      metadata: {
        method: 'oauth2',
        provider: 'google',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0...'
      },
      hash: 'sha256:pqr678...'
    }
  ])

  const [filters, setFilters] = useState({
    level: 'all',
    category: 'all',
    timeRange: '24h',
    search: ''
  })

  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null)

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'bg-blue-100 text-blue-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="h-5 w-5 text-blue-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />
      default: return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="h-5 w-5 text-red-500" />
      case 'governance': return <Database className="h-5 w-5 text-blue-500" />
      case 'system': return <Server className="h-5 w-5 text-green-500" />
      case 'user': return <User className="h-5 w-5 text-purple-500" />
      case 'data': return <Database className="h-5 w-5 text-orange-500" />
      case 'deployment': return <Server className="h-5 w-5 text-indigo-500" />
      default: return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const filteredEvents = auditEvents.filter(event => {
    if (filters.level !== 'all' && event.level !== filters.level) return false
    if (filters.category !== 'all' && event.category !== filters.category) return false
    if (filters.search && !event.title.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const auditStats = {
    total: auditEvents.length,
    info: auditEvents.filter(e => e.level === 'info').length,
    warning: auditEvents.filter(e => e.level === 'warning').length,
    error: auditEvents.filter(e => e.level === 'error').length,
    critical: auditEvents.filter(e => e.level === 'critical').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Timeline</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive audit trail of system events, security incidents, and governance activities
          </p>
        </div>

        {/* Audit Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-gray-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{auditStats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Info className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Info</dt>
                    <dd className="text-2xl font-semibold text-blue-600">{auditStats.info}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Warnings</dt>
                    <dd className="text-2xl font-semibold text-yellow-600">{auditStats.warning}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Errors</dt>
                    <dd className="text-2xl font-semibold text-red-600">{auditStats.error}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Critical</dt>
                    <dd className="text-2xl font-semibold text-red-600">{auditStats.critical}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="security">Security</option>
                  <option value="governance">Governance</option>
                  <option value="system">System</option>
                  <option value="user">User</option>
                  <option value="data">Data</option>
                  <option value="deployment">Deployment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Events</h3>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`border-l-4 p-4 cursor-pointer transition-colors ${
                    event.level === 'critical' ? 'border-red-400 bg-red-50' :
                    event.level === 'error' ? 'border-red-400 bg-red-50' :
                    event.level === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                    'border-blue-400 bg-blue-50'
                  } hover:bg-gray-50`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getLevelIcon(event.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(event.level)}`}>
                            {event.level}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {event.category}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.timestamp}
                        </span>
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {event.actor}
                        </span>
                        <span className="flex items-center">
                          <Server className="h-4 w-4 mr-1" />
                          {event.target}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{selectedEvent.title}</h3>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Description</h4>
                    <p className="mt-1 text-sm text-gray-600">{selectedEvent.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Actor</h4>
                      <p className="mt-1 text-sm text-gray-600">{selectedEvent.actor}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Target</h4>
                      <p className="mt-1 text-sm text-gray-600">{selectedEvent.target}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Timestamp</h4>
                      <p className="mt-1 text-sm text-gray-600">{selectedEvent.timestamp}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Hash</h4>
                      <p className="mt-1 text-sm text-gray-600 font-mono">{selectedEvent.hash}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Metadata</h4>
                    <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(selectedEvent.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
