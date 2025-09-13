-- Petals Consensus Schema
CREATE TABLE IF NOT EXISTS consensus_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  proposer VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  voting_start TIMESTAMP WITH TIME ZONE,
  voting_end TIMESTAMP WITH TIME ZONE,
  quorum_required INTEGER DEFAULT 0,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS consensus_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id VARCHAR(255) NOT NULL REFERENCES consensus_proposals(proposal_id),
  voter VARCHAR(255) NOT NULL,
  choice VARCHAR(20) NOT NULL CHECK (choice IN ('for', 'against', 'abstain')),
  weight DECIMAL NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id, voter)
);

CREATE TABLE IF NOT EXISTS consensus_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  actor VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposals_status ON consensus_proposals(status);
CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON consensus_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_history_proposal_id ON consensus_history(proposal_id);
