#!/bin/bash
# Start training for a synthient
# Usage: ./scripts/train-synthient.sh [synthient-id]

API_BASE="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

if [ -z "$1" ]; then
  echo -e "${YELLOW}Usage: $0 <synthient-id>${NC}"
  echo ""
  echo "Available Synthients:"
  curl -s ${API_BASE}/api/synthients | jq -r '.[] | "  \(.id) - \(.name) [\(.status)]"'
  exit 1
fi

SYNTHIENT_ID="$1"

echo -e "${BOLD}${CYAN}Starting Training for Synthient: ${SYNTHIENT_ID}${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start training
RESULT=$(curl -s -X POST ${API_BASE}/api/synthients/${SYNTHIENT_ID}/train)

echo "$RESULT" | jq .

if echo "$RESULT" | jq -e '.started == true' >/dev/null 2>&1; then
  RUN_ID=$(echo "$RESULT" | jq -r '.runId')
  echo ""
  echo -e "${GREEN}✓ Training started successfully!${NC}"
  echo "Run ID: ${RUN_ID}"
  echo ""
  echo "Monitor progress with:"
  echo "  ./scripts/status.sh"
  echo "  ./scripts/monitor-live.sh"
else
  echo ""
  echo -e "${YELLOW}⚠ Training may have failed or synthient not found${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"







