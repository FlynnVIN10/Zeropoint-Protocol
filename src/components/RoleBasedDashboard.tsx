import React, { useState, useEffect, useCallback } from 'react';
import { useRole } from '../contexts/RoleContext';
import RoleSelector from './RoleSelector';
import IntentArc from './IntentArc';
import styles from './RoleBasedDashboard.module.css';

// Types
interface Proposal {
  id: string;
  title: string;
  description: string;
  type: 'code-change' | 'training-job' | 'system-update';
  status: 'pending' | 'approved' | 'vetoed';
  humanVotes: { approve: number; veto: number };
  sentientVotes: { approve: number; veto: number };
  requiresHumanInput: boolean;
}

interface VoteTally {
  proposalId: string;
  proposalTitle: string;
  humanVotes: { approve: number; veto: number; total: number };
  sentientVotes: { approve: number; veto: number; total: number };
  status: 'pending' | 'approved' | 'vetoed';
}

interface AgentData {
  id: string;
  xp: number;
  level: string;
  trust: number;
  ethical: number;
  status: 'active' | 'idle' | 'training';
  pendingTasks: Array<{
    id: string;
    title: string;
    progress: number;
  }>;
}

interface ConsensusMetrics {
  humanVotes: { total: number; approve: number; veto: number };
  sentientVotes: { total: number; approve: number; veto: number };
  trustScores: { human: number; sentient: number; overall: number };
  entropy: number;
}

// API Configuration
const API_BASE_URL = 'http://localhost:3000/v1';

// Human Consensus View Components
const HumanConsensusView: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/consensus/proposals`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProposals(data.filter((p: Proposal) => p.requiresHumanInput));
      }
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (proposalId: string, vote: 'approve' | 'veto') => {
    try {
      const response = await fetch(`${API_BASE_URL}/consensus/human-vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ proposalId, vote })
      });

      if (response.ok) {
        fetchProposals(); // Refresh proposals
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading human consensus view...</div>;
  }

  return (
    <div className={styles.humanConsensusView}>
      <h2>Human Consensus Dashboard</h2>
      <p className={styles.roleDescription}>
        You have override authority with veto power. Review and vote on proposals requiring human input.
      </p>
      
      <div className={styles.proposalsSection}>
        <h3>Pending Proposals</h3>
        {proposals.length === 0 ? (
          <p>No proposals requiring human input at this time.</p>
        ) : (
          <div className={styles.proposalsGrid}>
            {proposals.map(proposal => (
              <div key={proposal.id} className={styles.proposalCard}>
                <h4>{proposal.title}</h4>
                <p>{proposal.description}</p>
                <div className={styles.voteCounts}>
                  <span>Human: {proposal.humanVotes.approve} approve, {proposal.humanVotes.veto} veto</span>
                  <span>Sentient: {proposal.sentientVotes.approve} approve, {proposal.sentientVotes.veto} veto</span>
                </div>
                <div className={styles.voteButtons}>
                  <button
                    onClick={() => handleVote(proposal.id, 'approve')}
                    className={styles.approveButton}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'veto')}
                    className={styles.vetoButton}
                  >
                    ❌ Veto
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Sentient Consensus View Components
const SentientConsensusView: React.FC = () => {
  const [voteTallies, setVoteTallies] = useState<VoteTally[]>([]);
  const [metrics, setMetrics] = useState<ConsensusMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSentientData();
  }, []);

  const fetchSentientData = async () => {
    try {
      const [talliesResponse, metricsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/consensus/vote-tallies`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch(`${API_BASE_URL}/consensus/metrics`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
      ]);

      if (talliesResponse.ok) {
        const tallies = await talliesResponse.json();
        setVoteTallies(tallies);
      }

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Failed to fetch sentient data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (proposalId: string, vote: 'approve' | 'veto') => {
    try {
      const response = await fetch(`${API_BASE_URL}/consensus/sentient-vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ proposalId, vote })
      });

      if (response.ok) {
        fetchSentientData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading sentient consensus view...</div>;
  }

  return (
    <div className={styles.sentientConsensusView}>
      <h2>Sentient Consensus Dashboard</h2>
      <p className={styles.roleDescription}>
        Participate in collective AI decision making. Vote on proposals and view consensus metrics.
      </p>

      {metrics && (
        <div className={styles.metricsSection}>
          <h3>Consensus Metrics</h3>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <h4>Trust Scores</h4>
              <p>Human: {metrics.trustScores.human.toFixed(1)}%</p>
              <p>Sentient: {metrics.trustScores.sentient.toFixed(1)}%</p>
              <p>Overall: {metrics.trustScores.overall.toFixed(1)}%</p>
            </div>
            <div className={styles.metricCard}>
              <h4>Vote Statistics</h4>
              <p>Human: {metrics.humanVotes.total} total</p>
              <p>Sentient: {metrics.sentientVotes.total} total</p>
              <p>Entropy: {metrics.entropy.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.intentArcSection}>
        <h3>Intent Arc Visualization</h3>
        <IntentArc />
      </div>

      <div className={styles.voteTalliesSection}>
        <h3>Live Vote Tallies</h3>
        {voteTallies.length === 0 ? (
          <p>No active proposals at this time.</p>
        ) : (
          <div className={styles.talliesGrid}>
            {voteTallies.map(tally => (
              <div key={tally.proposalId} className={styles.tallyCard}>
                <h4>{tally.proposalTitle}</h4>
                <div className={styles.voteCounts}>
                  <div>
                    <strong>Human:</strong> {tally.humanVotes.approve} approve, {tally.humanVotes.veto} veto
                  </div>
                  <div>
                    <strong>Sentient:</strong> {tally.sentientVotes.approve} approve, {tally.sentientVotes.veto} veto
                  </div>
                </div>
                <div className={styles.voteButtons}>
                  <button
                    onClick={() => handleVote(tally.proposalId, 'approve')}
                    className={styles.approveButton}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleVote(tally.proposalId, 'veto')}
                    className={styles.vetoButton}
                  >
                    ❌ Veto
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Agent View Components
const AgentView: React.FC = () => {
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAgentData();
  }, []);

  const fetchAgentData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAgentData(data);
      }
    } catch (error) {
      console.error('Failed to fetch agent data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading agent view...</div>;
  }

  if (!agentData) {
    return <div className={styles.error}>Failed to load agent data</div>;
  }

  return (
    <div className={styles.agentView}>
      <h2>Agent Dashboard</h2>
      <p className={styles.roleDescription}>
        Your personal agent perspective. Monitor your performance and manage tasks.
      </p>

      <div className={styles.agentStats}>
        <div className={styles.statCard}>
          <h3>Agent Status</h3>
          <p><strong>Level:</strong> {agentData.level}</p>
          <p><strong>XP:</strong> {agentData.xp}</p>
          <p><strong>Status:</strong> {agentData.status}</p>
          <p><strong>Trust:</strong> {(agentData.trust * 100).toFixed(1)}%</p>
          <p><strong>Ethical:</strong> {(agentData.ethical * 100).toFixed(1)}%</p>
        </div>

        <div className={styles.tasksSection}>
          <h3>Pending Tasks</h3>
          {agentData.pendingTasks.length === 0 ? (
            <p>No pending tasks at this time.</p>
          ) : (
            <div className={styles.tasksList}>
              {agentData.pendingTasks.map(task => (
                <div key={task.id} className={styles.taskItem}>
                  <h4>{task.title}</h4>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span>{task.progress}% complete</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Role-Based Dashboard Component
const RoleBasedDashboard: React.FC = () => {
  const { currentRole, isLoading: roleLoading } = useRole();

  if (roleLoading) {
    return <div className={styles.loading}>Loading role information...</div>;
  }

  const renderRoleView = () => {
    switch (currentRole) {
      case 'human-consensus':
        return <HumanConsensusView />;
      case 'sentient-consensus':
        return <SentientConsensusView />;
      case 'agent-view':
        return <AgentView />;
      default:
        return <div className={styles.error}>Unknown role: {currentRole}</div>;
    }
  };

  return (
    <div className={styles.roleBasedDashboard}>
      <div className={styles.header}>
        <h1>Zeropoint Protocol Dashboard</h1>
        <RoleSelector />
      </div>
      
      <div className={styles.content}>
        {renderRoleView()}
      </div>
    </div>
  );
};

export default RoleBasedDashboard; 