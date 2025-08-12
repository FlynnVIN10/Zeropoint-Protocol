'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Users, Clock, CheckCircle, AlertCircle, Activity } from 'lucide-react'

interface Synthiant {
  id: string
  name: string
  status: 'active' | 'idle' | 'busy' | 'offline'
  lastSeen: string
  responseTime: string
  queuePosition: number
  currentTask: string
  performance: {
    accuracy: number
    latency: number
    throughput: number
  }
}

interface ChatSession {
  id: string
  synthiantId: string
  synthiantName: string
  status: 'active' | 'waiting' | 'completed'
  startTime: string
  duration: string
  messageCount: number
  userRating: number | null
}

export default function SynthiantsPage() {
  const [synthiants, setSynthiants] = useState<Synthiant[]>([
    {
      id: '1',
      name: 'Alpha-001',
      status: 'active',
      lastSeen: '2 minutes ago',
      responseTime: '45ms',
      queuePosition: 0,
      currentTask: 'Processing user query #1234',
      performance: { accuracy: 94.2, latency: 45, throughput: 156 }
    },
    {
      id: '2',
      name: 'Beta-002',
      status: 'busy',
      lastSeen: '30 seconds ago',
      responseTime: '120ms',
      queuePosition: 0,
      currentTask: 'Training session #5678',
      performance: { accuracy: 91.8, latency: 120, throughput: 89 }
    },
    {
      id: '3',
      name: 'Gamma-003',
      status: 'idle',
      lastSeen: '5 minutes ago',
      responseTime: 'N/A',
      queuePosition: 3,
      currentTask: 'Waiting for assignment',
      performance: { accuracy: 93.5, latency: 0, throughput: 0 }
    }
  ])

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      synthiantId: '1',
      synthiantName: 'Alpha-001',
      status: 'active',
      startTime: '10 minutes ago',
      duration: '10m 23s',
      messageCount: 15,
      userRating: 5
    },
    {
      id: '2',
      synthiantId: '2',
      synthiantName: 'Beta-002',
      status: 'waiting',
      startTime: '2 minutes ago',
      duration: '2m 15s',
      messageCount: 3,
      userRating: null
    }
  ])

  const [queueStats, setQueueStats] = useState({
    totalWaiting: 12,
    averageWaitTime: '3m 24s',
    priorityQueue: 3,
    regularQueue: 9
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Synthiants Monitoring</h1>
          <p className="mt-2 text-gray-600">
            Real-time monitoring of AI agents and their performance
          </p>
        </div>

        {/* Queue Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Waiting</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{queueStats.totalWaiting}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Wait Time</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{queueStats.averageWaitTime}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Priority Queue</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{queueStats.priorityQueue}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Regular Queue</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{queueStats.regularQueue}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Synthiants Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Synthiants</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {synthiants.map((synthiant) => (
              <div key={synthiant.id} className="bg-white shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{synthiant.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      synthiant.status === 'active' ? 'bg-green-100 text-green-800' :
                      synthiant.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                      synthiant.status === 'idle' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {synthiant.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last Seen:</span>
                      <span className="text-gray-900">{synthiant.lastSeen}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Response Time:</span>
                      <span className="text-gray-900">{synthiant.responseTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Queue Position:</span>
                      <span className="text-gray-900">#{synthiant.queuePosition}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Current Task:</span>
                      <p className="text-gray-900 mt-1">{synthiant.currentTask}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Accuracy</span>
                        <p className="text-gray-900 font-medium">{synthiant.performance.accuracy}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Latency</span>
                        <p className="text-gray-900 font-medium">{synthiant.performance.latency}ms</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Throughput</span>
                        <p className="text-gray-900 font-medium">{synthiant.performance.throughput}/s</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Sessions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Chat Sessions</h2>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {chatSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <MessageCircle className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Session with {session.synthiantName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Started {session.startTime} • Duration: {session.duration}
                        </p>
                        <p className="text-xs text-gray-500">
                          Messages: {session.messageCount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.status === 'active' ? 'bg-green-100 text-green-800' :
                        session.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                      {session.userRating && (
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <CheckCircle
                              key={i}
                              className={`h-4 w-4 ${
                                i < session.userRating! ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
