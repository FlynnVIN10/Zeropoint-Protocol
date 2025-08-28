'use client'

import { useState, useEffect } from 'react'

interface Proposal {
  id: string
  prompt: string
  synthiant_id: string
  created_at: string
  state: string
  synthiant_reason?: string
  human_reason?: string
}

interface Vote {
  id: string
  proposal_id: string
  voter_id: string
  voter_type: string
  vote: string
  reason?: string
  timestamp: string
}

export default function LeftPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proposalsRes, votesRes] = await Promise.all([
          fetch('/api/consensus/proposals'),
          fetch('/api/consensus/vote')
        ])
        
        if (proposalsRes.ok) {
          const proposalsData = await proposalsRes.json()
          setProposals(proposalsData)
        }
        
        if (votesRes.ok) {
          const votesData = await votesRes.json()
          setVotes(votesData)
        }
      } catch (error) {
        console.error('Failed to fetch consensus data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getProposalsByState = (state: string) => {
    return proposals.filter(p => p.state === state)
  }

  const getVotesForProposal = (proposalId: string) => {
    return votes.filter(v => v.proposal_id === proposalId)
  }

  const handleVote = async (proposalId: string, vote: 'approve' | 'veto', reason?: string) => {
    try {
      const response = await fetch('/api/consensus/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposal_id: proposalId,
          voter_id: 'human:reviewer',
          voter_type: 'human',
          vote,
          reason
        })
      })

      if (response.ok) {
        // Refresh data
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to submit vote:', error)
    }
  }

  if (isCollapsed) {
    return (
      <aside className="left-panel-collapsed" style={{width: '60px', borderRight: '1px solid #333', padding: '8px', flexShrink: 0}}>
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6E00FF',
            cursor: 'pointer',
            fontSize: '20px'
          }}
        >
          ▶
        </button>
      </aside>
    )
  }

  if (loading) {
    return (
      <aside className="left-panel" style={{width: '20rem', borderRight: '1px solid #333', padding: '16px', flexShrink: 0, overflowY: 'auto', background: '#111'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h3 style={{margin: 0}}>Consensus Queue</h3>
          <button
            onClick={() => setIsCollapsed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6E00FF',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ◀
          </button>
        </div>
        <p>Loading consensus data...</p>
      </aside>
    )
  }

  return (
    <aside className="left-panel" style={{width: '20rem', borderRight: '1px solid #333', padding: '16px', flexShrink: 0, overflowY: 'auto', background: '#111'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
        <h3 style={{margin: 0}}>Consensus Queue</h3>
        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6E00FF',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ◀
        </button>
      </div>
      
      <div className="consensus-sections">
        <section style={{marginBottom: '20px'}}>
          <h4 style={{color: '#6E00FF', marginBottom: '8px'}}>Pending Proposals ({getProposalsByState('pending').length})</h4>
          {getProposalsByState('pending').length > 0 ? (
            getProposalsByState('pending').map(proposal => (
              <div key={proposal.id} style={{border: '1px solid #333', padding: '8px', marginBottom: '8px', borderRadius: '4px'}}>
                <p style={{fontSize: '12px', margin: '0 0 4px 0'}}><strong>{proposal.synthiant_id}</strong></p>
                <p style={{fontSize: '11px', margin: '0 0 8px 0'}}>{proposal.prompt.substring(0, 60)}...</p>
                <div style={{display: 'flex', gap: '4px'}}>
                  <button
                    onClick={() => handleVote(proposal.id, 'approve')}
                    style={{
                      background: '#51cf66',
                      border: 'none',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '2px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'veto')}
                    style={{
                      background: '#ff6b6b',
                      border: 'none',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '2px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Veto
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="muted">No pending proposals</div>
          )}
        </section>
        
        <section style={{marginBottom: '20px'}}>
          <h4 style={{color: '#6E00FF', marginBottom: '8px'}}>Synthiant Approved ({getProposalsByState('synthiant_approved').length})</h4>
          {getProposalsByState('synthiant_approved').length > 0 ? (
            getProposalsByState('synthiant_approved').map(proposal => (
              <div key={proposal.id} style={{border: '1px solid #51cf66', padding: '8px', marginBottom: '8px', borderRadius: '4px', background: 'rgba(81, 207, 102, 0.1)'}}>
                <p style={{fontSize: '12px', margin: '0 0 4px 0'}}><strong>{proposal.synthiant_id}</strong> ✅</p>
                <p style={{fontSize: '11px', margin: '0 0 4px 0'}}>{proposal.prompt.substring(0, 60)}...</p>
                <p style={{fontSize: '10px', color: '#51cf66'}}>Awaiting human review</p>
              </div>
            ))
          ) : (
            <div className="muted">No synthiant approved proposals</div>
          )}
        </section>
        
        <section style={{marginBottom: '20px'}}>
          <h4 style={{color: '#6E00FF', marginBottom: '8px'}}>Human Approved ({getProposalsByState('human_approved').length})</h4>
          {getProposalsByState('human_approved').length > 0 ? (
            getProposalsByState('human_approved').map(proposal => (
              <div key={proposal.id} style={{border: '1px solid #51cf66', padding: '8px', marginBottom: '8px', borderRadius: '4px', background: 'rgba(81, 207, 102, 0.2)'}}>
                <p style={{fontSize: '12px', margin: '0 0 4px 0'}}><strong>{proposal.synthiant_id}</strong> ✅✅</p>
                <p style={{fontSize: '11px', margin: '0 0 4px 0'}}>{proposal.prompt.substring(0, 60)}...</p>
                <p style={{fontSize: '10px', color: '#51cf66'}}>Fully approved</p>
              </div>
            ))
          ) : (
            <div className="muted">No human approved proposals</div>
          )}
        </section>
        
        <section style={{marginBottom: '20px'}}>
          <h4 style={{color: '#6E00FF', marginBottom: '8px'}}>Vetoed ({getProposalsByState('synthiant_vetoed').length + getProposalsByState('human_vetoed').length})</h4>
          {[...getProposalsByState('synthiant_vetoed'), ...getProposalsByState('human_vetoed')].length > 0 ? (
            [...getProposalsByState('synthiant_vetoed'), ...getProposalsByState('human_vetoed')].map(proposal => (
              <div key={proposal.id} style={{border: '1px solid #ff6b6b', padding: '8px', marginBottom: '8px', borderRadius: '4px', background: 'rgba(255, 107, 107, 0.1)'}}>
                <p style={{fontSize: '12px', margin: '0 0 4px 0'}}><strong>{proposal.synthiant_id}</strong> ❌</p>
                <p style={{fontSize: '11px', margin: '0 0 4px 0'}}>{proposal.prompt.substring(0, 60)}...</p>
                <p style={{fontSize: '10px', color: '#ff6b6b'}}>Vetoed - requires retraining</p>
              </div>
            ))
          ) : (
            <div className="muted">No vetoed proposals</div>
          )}
        </section>
        
        <section style={{marginBottom: '20px'}}>
          <h4 style={{color: '#6E00FF', marginBottom: '8px'}}>Activity Summary</h4>
          <div style={{fontSize: '11px', color: '#bbb'}}>
            <p>Total Proposals: {proposals.length}</p>
            <p>Pending Review: {getProposalsByState('pending').length}</p>
            <p>Synthiant Approved: {getProposalsByState('synthiant_approved').length}</p>
            <p>Human Approved: {getProposalsByState('human_approved').length}</p>
            <p>Total Vetoed: {getProposalsByState('synthiant_vetoed').length + getProposalsByState('human_vetoed').length}</p>
          </div>
        </section>
      </div>
    </aside>
  )
}
