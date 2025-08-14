'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, DollarSign, TrendingUp, Clock, Zap } from 'lucide-react'

interface MetricData {
  timestamp: string
  value: number
  label: string
}

interface PerformanceMetrics {
  latency: {
    p50: number
    p95: number
    p99: number
    average: number
  }
  throughput: {
    requests: number
    tokens: number
    gpuUtilization: number
  }
  errors: {
    total: number
    rate: number
    byType: Record<string, number>
  }
  costs: {
    gpu: number
    compute: number
    storage: number
    total: number
  }
  rag: {
    retrievalAccuracy: number
    responseRelevance: number
    contextUtilization: number
    queryLatency: number
  }
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    latency: {
      p50: 45,
      p95: 120,
      p99: 250,
      average: 78
    },
    throughput: {
      requests: 1250,
      tokens: 45000,
      gpuUtilization: 78
    },
    errors: {
      total: 23,
      rate: 1.8,
      byType: {
        'timeout': 8,
        'validation': 6,
        'gpu_oom': 5,
        'network': 4
      }
    },
    costs: {
      gpu: 45.20,
      compute: 23.50,
      storage: 12.80,
      total: 81.50
    },
    rag: {
      retrievalAccuracy: 87.3,
      responseRelevance: 92.1,
      contextUtilization: 78.5,
      queryLatency: 156
    }
  })

  const [timeRange, setTimeRange] = useState('24h')
  const [refreshInterval, setRefreshInterval] = useState(30)

  // Mock data for charts
  const latencyData: MetricData[] = [
    { timestamp: '00:00', value: 45, label: 'P50' },
    { timestamp: '04:00', value: 52, label: 'P50' },
    { timestamp: '08:00', value: 78, label: 'P50' },
    { timestamp: '12:00', value: 95, label: 'P50' },
    { timestamp: '16:00', value: 67, label: 'P50' },
    { timestamp: '20:00', value: 58, label: 'P50' }
  ]

  const throughputData: MetricData[] = [
    { timestamp: '00:00', value: 1200, label: 'Requests/min' },
    { timestamp: '04:00', value: 800, label: 'Requests/min' },
    { timestamp: '08:00', value: 1800, label: 'Requests/min' },
    { timestamp: '12:00', value: 2200, label: 'Requests/min' },
    { timestamp: '16:00', value: 1600, label: 'Requests/min' },
    { timestamp: '20:00', value: 1400, label: 'Requests/min' }
  ]

  const errorData: MetricData[] = [
    { timestamp: '00:00', value: 2, label: 'Errors/min' },
    { timestamp: '04:00', value: 1, label: 'Errors/min' },
    { timestamp: '08:00', value: 3, label: 'Errors/min' },
    { timestamp: '12:00', value: 5, label: 'Errors/min' },
    { timestamp: '16:00', value: 4, label: 'Errors/min' },
    { timestamp: '20:00', value: 2, label: 'Errors/min' }
  ]

  const getStatusColor = (value: number, threshold: number, type: 'good' | 'warning' | 'critical') => {
    if (type === 'good') {
      return value <= threshold ? 'text-green-600' : 'text-red-600'
    } else if (type === 'warning') {
      return value >= threshold ? 'text-yellow-600' : 'text-green-600'
    } else {
      return value >= threshold ? 'text-red-600' : 'text-green-600'
    }
  }

  const getStatusIcon = (value: number, threshold: number, type: 'good' | 'warning' | 'critical') => {
    if (type === 'good') {
      return value <= threshold ? 'text-green-500' : 'text-red-500'
    } else if (type === 'warning') {
      return value >= threshold ? 'text-yellow-500' : 'text-green-500'
    } else {
      return value >= threshold ? 'text-red-500' : 'text-green-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Metrics</h1>
              <p className="mt-2 text-gray-600">
                Real-time monitoring of system performance, costs, and RAG metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Latency P95 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className={`h-8 w-8 ${getStatusIcon(metrics.latency.p95, 200, 'good')}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Latency P95</dt>
                    <dd className={`text-2xl font-semibold ${getStatusColor(metrics.latency.p95, 200, 'good')}`}>
                      {metrics.latency.p95}ms
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Throughput */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Requests/min</dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {metrics.throughput.requests.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Error Rate */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className={`h-8 w-8 ${getStatusIcon(metrics.errors.rate, 2.0, 'critical')}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Error Rate</dt>
                    <dd className={`text-2xl font-semibold ${getStatusColor(metrics.errors.rate, 2.0, 'critical')}`}>
                      {metrics.errors.rate}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Cost</dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      ${metrics.costs.total.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Latency Metrics */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Latency Distribution</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">P50 (Median)</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.latency.p50}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">P95</span>
                  <span className={`text-sm font-medium ${getStatusColor(metrics.latency.p95, 200, 'good')}`}>
                    {metrics.latency.p95}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">P99</span>
                  <span className={`text-sm font-medium ${getStatusColor(metrics.latency.p99, 500, 'good')}`}>
                    {metrics.latency.p99}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Average</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.latency.average}ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Throughput Metrics */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Throughput & Utilization</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Requests/min</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics.throughput.requests.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tokens/min</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics.throughput.tokens.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">GPU Utilization</span>
                  <span className={`text-sm font-medium ${getStatusColor(metrics.throughput.gpuUtilization, 90, 'warning')}`}>
                    {metrics.throughput.gpuUtilization}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Analysis */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Error Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Error Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Errors:</span>
                    <span className="font-medium text-gray-900">{metrics.errors.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Error Rate:</span>
                    <span className={`font-medium ${getStatusColor(metrics.errors.rate, 2.0, 'critical')}`}>
                      {metrics.errors.rate}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Errors by Type</h4>
                <div className="space-y-2">
                  {Object.entries(metrics.errors.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-gray-500 capitalize">{type.replace('_', ' ')}:</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">${metrics.costs.gpu.toFixed(2)}</div>
                <div className="text-sm text-gray-500">GPU Compute</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">${metrics.costs.compute.toFixed(2)}</div>
                <div className="text-sm text-gray-500">CPU Compute</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-purple-600">${metrics.costs.storage.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Storage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">${metrics.costs.total.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* RAG Metrics */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">RAG Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getStatusColor(metrics.rag.retrievalAccuracy, 85, 'good')}`}>
                  {metrics.rag.retrievalAccuracy}%
                </div>
                <div className="text-sm text-gray-500">Retrieval Accuracy</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getStatusColor(metrics.rag.responseRelevance, 90, 'good')}`}>
                  {metrics.rag.responseRelevance}%
                </div>
                <div className="text-sm text-gray-500">Response Relevance</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getStatusColor(metrics.rag.contextUtilization, 80, 'good')}`}>
                  {metrics.rag.contextUtilization}%
                </div>
                <div className="text-sm text-gray-500">Context Utilization</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getStatusColor(metrics.rag.queryLatency, 200, 'good')}`}>
                  {metrics.rag.queryLatency}ms
                </div>
                <div className="text-sm text-gray-500">Query Latency</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Charts Placeholder */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Latency Trend</h3>
              <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Activity className="mx-auto h-12 w-12 mb-2" />
                  <p>Real-time chart integration</p>
                  <p className="text-sm">SSE/WebSocket data streaming</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Throughput Trend</h3>
              <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <TrendingUp className="mx-auto h-12 w-12 mb-2" />
                  <p>Real-time chart integration</p>
                  <p className="text-sm">SSE/WebSocket data streaming</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
