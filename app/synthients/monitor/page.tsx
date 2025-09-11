'use client'

import { useState, useEffect } from 'react'

interface SynthientLogEntry {
  id: string
  timestamp: string
  synthient_id: string
  synthient_type: 'petals' | 'wondercraft' | 'tinygrad' | 'consensus' | 'training'
  action: string
  status: 'success' | 'error' | 'warning' | 'info'
  details: Record<string, any>
  resource_affected?: string
  performance_metrics?: {
    duration_ms: number
    memory_usage_mb: number
    cpu_usage_percent: number
  }
  consensus_required?: boolean
  human_approval?: boolean
  error_code?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface SyslogResponse {
  total_entries: number
  total_available: number
  generated_at: string
  filters: Record<string, any>
  logs: SynthientLogEntry[]
}

export default function SynthientMonitor() {
  const [logs, setLogs] = useState<SynthientLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    severity: '',
    type: '',
    limit: '50'
  })
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.type) params.append('type', filters.type)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await fetch(`/api/synthients/syslog?${params}`)
      const data: SyslogResponse = await response.json()
      setLogs(data.logs)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [filters, autoRefresh])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'petals': return '🌸'
      case 'wondercraft': return '🎨'
      case 'tinygrad': return '⚡'
      case 'consensus': return '🤝'
      case 'training': return '🧠'
      default: return '🤖'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Synthient Activity Monitor</h1>
              <p className="text-gray-600 mt-2">Real-time oversight of Synthient activities and system logs</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                Auto-refresh (5s)
              </label>
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({...filters, severity: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Synthient Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Types</option>
                <option value="petals">Petals</option>
                <option value="wondercraft">Wondercraft</option>
                <option value="tinygrad">Tinygrad</option>
                <option value="consensus">Consensus</option>
                <option value="training">Training</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({...filters, limit: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="25">25 entries</option>
                <option value="50">50 entries</option>
                <option value="100">100 entries</option>
                <option value="250">250 entries</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({severity: '', type: '', limit: '50'})}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Activity Logs</h2>
            <p className="text-sm text-gray-600">Showing {logs.length} recent entries</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Synthient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getTypeIcon(log.synthient_type)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.synthient_id}</div>
                          <div className="text-sm text-gray-500">{log.synthient_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.action}</div>
                      {log.resource_affected && (
                        <div className="text-sm text-gray-500">→ {log.resource_affected}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                      {log.error_code && (
                        <div className="text-xs text-red-500">{log.error_code}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {Object.keys(log.details).length > 0 ? (
                          <details className="cursor-pointer">
                            <summary className="hover:text-blue-600">View Details</summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-gray-400">No details</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.performance_metrics ? (
                        <div className="text-xs">
                          <div>{log.performance_metrics.duration_ms}ms</div>
                          <div>{log.performance_metrics.memory_usage_mb.toFixed(1)}MB</div>
                          <div>{log.performance_metrics.cpu_usage_percent.toFixed(1)}% CPU</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-blue-600">
              {logs.filter(log => log.synthient_type === 'petals').length}
            </div>
            <div className="text-sm text-gray-600">Petals Activities</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-purple-600">
              {logs.filter(log => log.synthient_type === 'wondercraft').length}
            </div>
            <div className="text-sm text-gray-600">Wondercraft Activities</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter(log => log.synthient_type === 'tinygrad').length}
            </div>
            <div className="text-sm text-gray-600">Tinygrad Activities</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter(log => log.status === 'error').length}
            </div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
        </div>
      </div>
    </div>
  )
}
