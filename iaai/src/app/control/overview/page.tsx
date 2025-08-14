'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, CheckCircle, Clock, Cpu, Database, Server, Users } from 'lucide-react'

interface KPI {
  id: string
  name: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
}

interface DeployStatus {
  id: string
  environment: string
  status: 'success' | 'failed' | 'in-progress'
  commit: string
  timestamp: string
  duration: string
}

interface Incident {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  status: 'open' | 'resolved' | 'investigating'
  timestamp: string
}

export default function ControlCenterOverview() {
  const [kpis, setKpis] = useState<KPI[]>([
    {
      id: '1',
      name: 'System Uptime',
      value: '99.97%',
      change: '+0.02%',
      changeType: 'positive',
      icon: <CheckCircle className="h-8 w-8 text-green-500" />
    },
    {
      id: '2',
      name: 'Active Synthiants',
      value: '47',
      change: '+3',
      changeType: 'positive',
      icon: <Users className="h-8 w-8 text-blue-500" />
    },
    {
      id: '3',
      name: 'GPU Utilization',
      value: '78%',
      change: '-5%',
      changeType: 'negative',
      icon: <Cpu className="h-8 w-8 text-purple-500" />
    },
    {
      id: '4',
      name: 'Data Throughput',
      value: '2.4 TB/s',
      change: '+0.3 TB/s',
      changeType: 'positive',
      icon: <Database className="h-8 w-8 text-orange-500" />
    }
  ])

  const [deployments, setDeployments] = useState<DeployStatus[]>([
    {
      id: '1',
      environment: 'Production',
      status: 'success',
      commit: 'a1b2c3d',
      timestamp: '2 minutes ago',
      duration: '3m 24s'
    },
    {
      id: '2',
      environment: 'Staging',
      status: 'in-progress',
      commit: 'e4f5g6h',
      timestamp: '5 minutes ago',
      duration: '1m 12s'
    }
  ])

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      severity: 'low',
      title: 'Increased latency in EU region',
      description: 'Response times increased by 15% in Frankfurt datacenter',
      status: 'investigating',
      timestamp: '1 hour ago'
    }
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Control Center</h1>
          <p className="mt-2 text-gray-600">
            Real-time monitoring and control for Zeropoint Protocol
          </p>
        </div>

        {/* KPIs Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {kpi.icon}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {kpi.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {kpi.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          kpi.changeType === 'positive' ? 'text-green-600' : 
                          kpi.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {kpi.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Deployments and Incidents */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Deployments */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Deployments</h3>
              <div className="space-y-4">
                {deployments.map((deploy) => (
                  <div key={deploy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        deploy.status === 'success' ? 'bg-green-500' :
                        deploy.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{deploy.environment}</p>
                        <p className="text-xs text-gray-500">Commit {deploy.commit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{deploy.timestamp}</p>
                      <p className="text-xs text-gray-500">{deploy.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Incidents */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Incidents</h3>
              <div className="space-y-4">
                {incidents.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">All systems operational</h3>
                    <p className="mt-1 text-sm text-gray-500">No active incidents</p>
                  </div>
                ) : (
                  incidents.map((incident) => (
                    <div key={incident.id} className="border-l-4 border-red-400 bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">{incident.title}</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{incident.description}</p>
                          </div>
                          <div className="mt-4 flex">
                            <div className="flex-shrink-0">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {incident.severity}
                              </span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <span className="text-xs text-red-700">{incident.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                    <Server className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    System Status
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    View detailed system health and performance metrics
                  </p>
                </div>
              </button>

              <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <Users className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Synthiants
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Monitor active Synthiants and their performance
                  </p>
                </div>
              </button>

              <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                    <Activity className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Metrics
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Real-time performance and cost metrics
                  </p>
                </div>
              </button>

              <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-700 ring-4 ring-white">
                    <Clock className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Audit Trail
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                    View system audit logs and timeline
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
