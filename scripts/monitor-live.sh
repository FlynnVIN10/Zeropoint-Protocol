#!/bin/bash
# Live monitoring dashboard for Zeropoint Protocol
# Usage: ./scripts/monitor-live.sh [--interval SECONDS]

INTERVAL=${2:-2}
API_BASE="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

clear_screen() {
  printf "\033c"
}

fetch_data() {
  HEALTH=$(curl -s ${API_BASE}/api/healthz 2>/dev/null)
  READY=$(curl -s ${API_BASE}/api/readyz 2>/dev/null)
  SYNTHIENTS=$(curl -s ${API_BASE}/api/synthients 2>/dev/null)
  PROPOSALS=$(curl -s ${API_BASE}/api/proposals 2>/dev/null)
  
  # Parse data
  HEALTH_OK=$(echo "$HEALTH" | jq -r '.ok // false' 2>/dev/null)
  READY_STATUS=$(echo "$READY" | jq -r '.ready // false' 2>/dev/null)
  
  SYNTHIENT_COUNT=$(echo "$SYNTHIENTS" | jq 'length' 2>/dev/null)
  SYNTHIENTS_TRAINING=$(echo "$SYNTHIENTS" | jq '[.[] | select(.status == "training")] | length' 2>/dev/null)
  SYNTHIENTS_READY=$(echo "$SYNTHIENTS" | jq '[.[] | select(.status == "ready")] | length' 2>/dev/null)
  
  PROPOSAL_COUNT=$(echo "$PROPOSALS" | jq 'length' 2>/dev/null)
  PROPOSALS_OPEN=$(echo "$PROPOSALS" | jq '[.[] | select(.status == "open")] | length' 2>/dev/null)
  PROPOSALS_APPROVED=$(echo "$PROPOSALS" | jq '[.[] | select(.status == "approved")] | length' 2>/dev/null)
  
  # Training runs
  TOTAL_RUNS=$(echo "$SYNTHIENTS" | jq '[.[].TrainingRun | length] | add // 0' 2>/dev/null)
  SUCCESSFUL_RUNS=$(echo "$SYNTHIENTS" | jq '[.[].TrainingRun[] | select(.status == "success")] | length' 2>/dev/null)
}

display_dashboard() {
  clear_screen
  
  echo -e "${BOLD}${CYAN}"
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║         ZEROPOINT PROTOCOL - LIVE MONITORING                  ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  
  # System Status
  echo -e "${BOLD}🔧 SYSTEM STATUS${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if [ "$HEALTH_OK" = "true" ]; then
    echo -e "Health:    ${GREEN}✓ OK${NC}"
  else
    echo -e "Health:    ${RED}✗ FAIL${NC}"
  fi
  
  if [ "$READY_STATUS" = "true" ]; then
    echo -e "Ready:     ${GREEN}✓ READY${NC}"
  else
    echo -e "Ready:     ${YELLOW}⚠ NOT READY${NC}"
  fi
  
  echo ""
  
  # Synthients
  echo -e "${BOLD}🧠 SYNTHIENTS${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "Total:     ${CYAN}${SYNTHIENT_COUNT}${NC}"
  echo -e "Training:  ${YELLOW}${SYNTHIENTS_TRAINING}${NC}"
  echo -e "Ready:     ${GREEN}${SYNTHIENTS_READY}${NC}"
  echo ""
  
  # Training Runs
  echo -e "${BOLD}📊 TRAINING RUNS${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "Total:     ${CYAN}${TOTAL_RUNS}${NC}"
  echo -e "Success:   ${GREEN}${SUCCESSFUL_RUNS}${NC}"
  echo ""
  
  # Governance
  echo -e "${BOLD}⚖️  GOVERNANCE${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "Proposals: ${CYAN}${PROPOSAL_COUNT}${NC}"
  echo -e "Open:      ${YELLOW}${PROPOSALS_OPEN}${NC}"
  echo -e "Approved:  ${GREEN}${PROPOSALS_APPROVED}${NC}"
  echo ""
  
  # Recent Synthients
  echo -e "${BOLD}🔍 ACTIVE SYNTHIENTS${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$SYNTHIENTS" | jq -r '.[] | select(.status != "idle") | "\(.name) [\(.status)] - Runs: \(.TrainingRun | length)"' 2>/dev/null | head -5
  echo ""
  
  # Footer
  echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "Updated: $(date '+%Y-%m-%d %H:%M:%S') | Refresh: ${INTERVAL}s | Press Ctrl+C to exit"
}

# Main loop
echo -e "${CYAN}Starting Zeropoint Protocol Live Monitor...${NC}"
echo -e "Refresh interval: ${INTERVAL} seconds"
echo ""

while true; do
  fetch_data
  display_dashboard
  sleep $INTERVAL
done


