#!/bin/bash
# Quick status check for Zeropoint Protocol
# Usage: ./scripts/status.sh

API_BASE="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

echo -e "${BOLD}${CYAN}Zeropoint Protocol Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Health Check
echo -n "System Health:     "
HEALTH=$(curl -s ${API_BASE}/api/healthz 2>/dev/null)
if echo "$HEALTH" | jq -e '.ok == true' >/dev/null 2>&1; then
  echo -e "${GREEN}✓ OK${NC}"
else
  echo -e "${RED}✗ FAIL${NC}"
fi

# Readiness
echo -n "System Ready:      "
READY=$(curl -s ${API_BASE}/api/readyz 2>/dev/null)
if echo "$READY" | jq -e '.ready == true' >/dev/null 2>&1; then
  echo -e "${GREEN}✓ READY${NC}"
else
  echo -e "${YELLOW}⚠ NOT READY${NC}"
fi

echo ""

# Synthients
SYNTHIENTS=$(curl -s ${API_BASE}/api/synthients 2>/dev/null)
SYNTHIENT_COUNT=$(echo "$SYNTHIENTS" | jq 'length' 2>/dev/null)
TRAINING_COUNT=$(echo "$SYNTHIENTS" | jq '[.[] | select(.status == "training")] | length' 2>/dev/null)
READY_COUNT=$(echo "$SYNTHIENTS" | jq '[.[] | select(.status == "ready")] | length' 2>/dev/null)
TOTAL_RUNS=$(echo "$SYNTHIENTS" | jq '[.[].TrainingRun | length] | add // 0' 2>/dev/null)

echo -e "${BOLD}Synthients:${NC}"
echo "  Total:           ${SYNTHIENT_COUNT}"
echo "  Training:        ${TRAINING_COUNT}"
echo "  Ready:           ${READY_COUNT}"
echo "  Training Runs:   ${TOTAL_RUNS}"

echo ""

# Proposals
PROPOSALS=$(curl -s ${API_BASE}/api/proposals 2>/dev/null)
PROPOSAL_COUNT=$(echo "$PROPOSALS" | jq 'length' 2>/dev/null)
OPEN_COUNT=$(echo "$PROPOSALS" | jq '[.[] | select(.status == "open")] | length' 2>/dev/null)
APPROVED_COUNT=$(echo "$PROPOSALS" | jq '[.[] | select(.status == "approved")] | length' 2>/dev/null)

echo -e "${BOLD}Governance:${NC}"
echo "  Proposals:       ${PROPOSAL_COUNT}"
echo "  Open:            ${OPEN_COUNT}"
echo "  Approved:        ${APPROVED_COUNT}"

echo ""

# Recent Training Runs
echo -e "${BOLD}Recent Training Runs:${NC}"
echo "$SYNTHIENTS" | jq -r '.[] | select(.TrainingRun | length > 0) | .TrainingRun[] | "  [\(.status)] \(.startedAt) - Loss: \((.metricsJson | fromjson).loss // "N/A")"' 2>/dev/null | head -5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}For live monitoring, run: ./scripts/monitor-live.sh${NC}"


