'use client'

import { useState, useEffect } from 'react'
import { Vote, Users, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface ConsensusVote {
  id: string
  proposalId: string
  proposalTitle: string
  voter: string
  vote: 'approve' | 'reject' | 'abstain'
  timestamp: string
  reasoning: string
  weight: number
}

interface Proposal {
  id: string
  title: string
  description: string
  status: 'active' | 'passed' | 'failed' | 'vetoed'
  proposer: string
  createdAt: string
  targetDate: string
  requiredQuorum: number
  currentVotes: {
    approve: number
    reject: number
    abstain: number
  }
  totalWeight: number
  vetoedBy: string | null
  vetoReason: string | null
}

export default function ConsensusPage() {
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: '1',
      title: 'Deploy Phase P0-1 Scope Controls',
      description: 'Deploy scope enforcement and mock detection to production environment',
      status: 'active',
      proposer: 'PM',
      createdAt: '2 hours ago',
      targetDate: '6 hours from now',
      requiredQuorum: 75,
      currentVotes: { approve: 3, reject: 0, abstain: 1 },
      totalWeight: 100,
      vetoedBy: null,
      vetoReason: null
    },
    {
      id: '2',
      title: 'Update tinygrad Integration',
      description: 'Integrate latest tinygrad version with ROCm support',
      status: 'passed',
      proposer: 'DevOps',
      createdAt: '1 day ago',
      targetDate: 'Completed',
      requiredQuorum: 75,
      currentVotes: { approve: 4, reject: 0, abstain: 0 },
      totalWeight: 100,
      vetoedBy: null,
      vetoReason: null
    },
    {
      id: '3',
      title: 'Security Policy Update',
      description: 'Implement new security scanning requirements',
      status: 'vetoed',
      proposer: 'Security Team',
      createdAt: '3 days ago',
      targetDate: 'Vetoed',
      requiredQuorum: 75,
      currentVotes: { approve: 2, reject: 1, abstain: 1 },
      totalWeight: 100,
      vetoedBy: 'CTO',
      vetoReason: 'Insufficient threat modeling documentation'
    }
  ])

  const [votes, setVotes] = useState<ConsensusVote[]>([
    {
      id: '1',
      proposalId: '1',
      proposalTitle: 'Deploy Phase P0-1 Scope Controls',
      voter: 'PM',
      vote: 'approve',
      timestamp: '1 hour ago',
      reasoning: 'Scope controls are essential for production safety',
      weight: 25
    },
    {
      id: '2',
      proposalId: '1',
      proposalTitle: 'Deploy Phase P0-1 Scope Controls',
      voter: 'DevOps',
      vote: 'approve',
      timestamp: '45 minutes ago',
      reasoning: 'Implementation tested and ready for production',
      weight: 25
    },
    {
      id: '3',
      proposalId: '1',
      proposalTitle: 'Deploy Phase P0-1 Scope Controls',
      voter: 'QA',
      vote: 'approve',
      timestamp: '30 minutes ago',
      reasoning: 'All tests passing, no regressions detected',
      weight: 25
    },
    {
      id: '4',
      proposalId: '1',
      proposalTitle: 'Deploy Phase P0-1 Scope Controls',
      voter: 'Security',
      vote: 'abstain',
      timestamp: '15 minutes ago',
      reasoning: 'Security review in progress',
      weight: 25
    }
  ])

  const [consensusStats, setConsensusStats] = useState({
    totalProposals: 15,
    activeProposals: 3,
    passedProposals: 10,
    failedProposals: 1,
    vetoedProposals: 1,
    averageQuorum: 78.5
  })

  const calculateQuorumPercentage = (proposal: Proposal) => {
    const totalVotes = proposal.currentVotes.approve + proposal.currentVotes.reject + proposal.currentVotes.abstain
    if (totalVotes === 0) return 0
    return Math.round((totalVotes / proposal.totalWeight) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'passed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'vetoed': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVoteColor = (vote: string) => {
    switch (vote) {
      case 'approve': return 'bg-green-100 text-green-800'
      case 'reject': return 'bg-red-100 text-red-800'
      case 'abstain': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Consensus Monitoring</h1>
          <p className="mt-2 text-gray-600">
            Track proposals, votes, quorum, and veto decisions
          </p>
        </div>

        {/* Consensus Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Vote className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Proposals</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{consensusStats.totalProposals}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{consensusStats.activeProposals}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Passed</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{consensusStats.passedProposals}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{consensusStats.failedProposals}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Vetoed</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{consensusStats.vetoedProposals}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Quorum</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{consensusStats.averageQuorum}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Proposals */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Proposals</h2>
          <div className="space-y-6">
            {proposals.filter(p => p.status === 'active').map((proposal) => (
              <div key={proposal.id} className="bg-white shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{proposal.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{proposal.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Proposer:</span>
                      <p className="text-gray-900 font-medium">{proposal.proposer}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Created:</span>
                      <p className="text-gray-900 font-medium">{proposal.createdAt}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Target:</span>
                      <p className="text-gray-900 font-medium">{proposal.targetDate}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Voting Progress</h4>
                      <span className="text-sm text-gray-500">
                        Quorum: {calculateQuorumPercentage(proposal)}% / {proposal.requiredQuorum}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(calculateQuorumPercentage(proposal), 100)}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <span className="text-gray-500">Approve</span>
                        <p className="text-green-600 font-medium">{proposal.currentVotes.approve}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-500">Reject</span>
                        <p className="text-red-600 font-medium">{proposal.currentVotes.reject}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-500">Abstain</span>
                        <p className="text-gray-600 font-medium">{proposal.currentVotes.abstain}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Votes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Votes</h2>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {votes.map((vote) => (
                  <div key={vote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Vote className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {vote.proposalTitle}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Voted by {vote.voter} • {vote.timestamp} • Weight: {vote.weight}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {vote.reasoning}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVoteColor(vote.vote)}`}>
                        {vote.vote}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vetoed Proposals */}
        {proposals.filter(p => p.status === 'vetoed').length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vetoed Proposals</h2>
            <div className="space-y-6">
              {proposals.filter(p => p.status === 'vetoed').map((proposal) => (
                <div key={proposal.id} className="bg-white shadow rounded-lg border-l-4 border-orange-400">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{proposal.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{proposal.description}</p>

                    <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-orange-400" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-orange-800">Vetoed by {proposal.vetoedBy}</h4>
                          <p className="text-sm text-orange-700 mt-1">{proposal.vetoReason}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
