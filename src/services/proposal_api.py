from fastapi import FastAPI, HTTPException
from typing import Dict, List, Optional
import json
import os
from datetime import datetime
from pydantic import BaseModel, Field

# Initialize FastAPI app
app = FastAPI(
    title="Proposal API Service", 
    version="1.0.0",
    description="Synthiant proposal management with dual consensus (AI + Human) gating"
)

# Pydantic models for request/response
class ConsensusUpdate(BaseModel):
    ai: str = Field(..., description="AI consensus: 'pass' or 'fail'")
    human: str = Field(..., description="Human consensus: 'pass' or 'fail'")
    notes: Optional[str] = Field(None, description="Optional notes about the consensus decision")

class ProposalResponse(BaseModel):
    proposalId: str
    synthiantId: str
    timestamp: str
    changeType: str
    summary: str
    details: str
    status: str
    consensus: Dict[str, str]
    trainingData: Optional[Dict] = None
    metrics: Optional[Dict] = None
    ethicsReview: Optional[Dict] = None

class ConsensusResponse(BaseModel):
    proposalId: str
    consensus: Dict[str, str]
    status: str
    message: str
    timestamp: str

class QueueStatsResponse(BaseModel):
    total: int
    pending: int
    accepted: int
    rejected: int
    underReview: int

# Zeroth Principle: Configuration for safety and transparency
QUEUE_FILE = "src/queue/proposals.jsonl"
BACKUP_DIR = "src/queue/backups"

def ensure_queue_directory():
    """Ensure queue directory exists"""
    os.makedirs(os.path.dirname(QUEUE_FILE), exist_ok=True)
    os.makedirs(BACKUP_DIR, exist_ok=True)

def read_proposals() -> List[Dict]:
    """Read all proposals from the queue file"""
    try:
        if not os.path.exists(QUEUE_FILE):
            return []
        
        with open(QUEUE_FILE, "r") as f:
            content = f.read().strip()
            if not content:
                return []
            
            lines = content.split('\n')
            proposals = []
            
            for line in lines:
                if line.strip():
                    try:
                        proposals.append(json.loads(line))
                    except json.JSONDecodeError as e:
                        print(f"Warning: Failed to parse proposal line: {e}")
                        continue
            
            return proposals
    except Exception as e:
        print(f"Error reading proposals: {e}")
        return []

def write_proposals(proposals: List[Dict]):
    """Write proposals back to the queue file"""
    try:
        ensure_queue_directory()
        content = '\n'.join(json.dumps(p) for p in proposals) + '\n'
        with open(QUEUE_FILE, "w") as f:
            f.write(content)
    except Exception as e:
        print(f"Error writing proposals: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to write proposals: {e}")

def create_backup():
    """Create backup of current queue file"""
    try:
        if os.path.exists(QUEUE_FILE):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = os.path.join(BACKUP_DIR, f"proposals_{timestamp}.jsonl")
            with open(QUEUE_FILE, "r") as src, open(backup_file, "w") as dst:
                dst.write(src.read())
    except Exception as e:
        print(f"Warning: Failed to create backup: {e}")

@app.get("/api/proposals", response_model=List[ProposalResponse])
async def get_proposals():
    """Get all proposals from the queue"""
    try:
        proposals = read_proposals()
        return proposals
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read proposals: {str(e)}")

@app.get("/api/proposals/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(proposal_id: str):
    """Get a specific proposal by ID"""
    try:
        proposals = read_proposals()
        proposal = next((p for p in proposals if p.get("proposalId") == proposal_id), None)
        
        if not proposal:
            raise HTTPException(status_code=404, detail=f"Proposal not found: {proposal_id}")
        
        return proposal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get proposal: {str(e)}")

@app.post("/api/proposals/{proposal_id}/consensus", response_model=ConsensusResponse)
async def update_consensus(proposal_id: str, consensus: ConsensusUpdate):
    """Update consensus for a proposal (AI + Human)"""
    try:
        # Zeroth Principle: Validate consensus data
        if not all(k in consensus.dict() for k in ["ai", "human"]):
            raise HTTPException(status_code=400, detail="Invalid consensus: missing ai or human field")
        
        if consensus.ai not in ["pass", "fail"] or consensus.human not in ["pass", "fail"]:
            raise HTTPException(status_code=400, detail="Invalid consensus values: must be 'pass' or 'fail'")
        
        # Read current proposals
        proposals = read_proposals()
        proposal_index = next((i for i, p in enumerate(proposals) if p.get("proposalId") == proposal_id), None)
        
        if proposal_index is None:
            raise HTTPException(status_code=404, detail=f"Proposal not found: {proposal_id}")
        
        # Update consensus
        proposal = proposals[proposal_index]
        proposal["consensus"] = {
            "ai": consensus.ai,
            "human": consensus.human,
            "timestamp": datetime.now().isoformat(),
            "notes": consensus.notes
        }
        
        # Zeroth Principle: Update status based on dual consensus
        if consensus.ai == "pass" and consensus.human == "pass":
            proposal["status"] = "accepted"
            status_message = "Dual consensus achieved - proposal accepted"
        elif consensus.ai == "fail" or consensus.human == "fail":
            proposal["status"] = "rejected"
            status_message = "Consensus failed - proposal rejected"
        else:
            proposal["status"] = "under_review"
            status_message = "Consensus updated - awaiting final decision"
        
        # Write updated proposals back to queue
        write_proposals(proposals)
        
        # Create backup
        create_backup()
        
        return ConsensusResponse(
            proposalId=proposal_id,
            consensus=proposal["consensus"],
            status=proposal["status"],
            message=status_message,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update consensus: {str(e)}")

@app.get("/api/proposals/stats", response_model=QueueStatsResponse)
async def get_queue_stats():
    """Get queue statistics"""
    try:
        proposals = read_proposals()
        
        stats = {
            "total": len(proposals),
            "pending": len([p for p in proposals if p.get("status") == "pending"]),
            "accepted": len([p for p in proposals if p.get("status") == "accepted"]),
            "rejected": len([p for p in proposals if p.get("status") == "rejected"]),
            "underReview": len([p for p in proposals if p.get("status") == "under_review"])
        }
        
        return QueueStatsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get queue stats: {str(e)}")

@app.post("/api/proposals/{proposal_id}/validate")
async def validate_proposal(proposal_id: str):
    """Validate a proposal for data integrity"""
    try:
        proposals = read_proposals()
        proposal = next((p for p in proposals if p.get("proposalId") == proposal_id), None)
        
        if not proposal:
            raise HTTPException(status_code=404, detail=f"Proposal not found: {proposal_id}")
        
        # Basic validation checks
        errors = []
        
        if not proposal.get("proposalId"):
            errors.append("Missing proposal ID")
        
        if not proposal.get("synthiantId"):
            errors.append("Missing synthiant ID")
        
        if not proposal.get("summary"):
            errors.append("Missing summary")
        
        if not proposal.get("consensus"):
            errors.append("Missing consensus data")
        
        if proposal.get("consensus", {}).get("ai") not in ["pass", "fail", "pending"]:
            errors.append("Invalid AI consensus value")
        
        if proposal.get("consensus", {}).get("human") not in ["pass", "fail", "pending"]:
            errors.append("Invalid human consensus value")
        
        return {
            "proposalId": proposal_id,
            "valid": len(errors) == 0,
            "errors": errors,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate proposal: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "proposal_api",
        "timestamp": datetime.now().isoformat(),
        "queue_file": QUEUE_FILE,
        "backup_dir": BACKUP_DIR
    }

# Initialize queue directory on startup
@app.on_event("startup")
async def startup_event():
    """Initialize service on startup"""
    ensure_queue_directory()
    print(f"Proposal API Service started. Queue file: {QUEUE_FILE}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
