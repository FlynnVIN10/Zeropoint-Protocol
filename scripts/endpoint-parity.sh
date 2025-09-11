#!/bin/bash
set -euo pipefail

echo "=== ENDPOINT PARITY VERIFICATION ==="

H=$(git rev-parse --short=8 HEAD)
echo "Repository HEAD: $H"

for p in /status/version.json /api/healthz /api/readyz /api/training /api/proposals; do
  echo "Checking $p..."
  C=$(curl -fsS "https://zeropointprotocol.ai$p" | jq -r .commit)
  echo "  Commit: $C"
  test "$C" = "$H" || { echo "❌ Mismatch $p => $C vs $H"; exit 1; }
  echo "  ✅ Match"
done

echo "✅ All endpoints match HEAD commit: $H"
