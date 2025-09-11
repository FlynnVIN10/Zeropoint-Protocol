#!/bin/bash
set -euo pipefail

HOST="${1:-https://zeropointprotocol.ai}"

echo "=== Rollback Validation Script ==="
echo "Target: $HOST"

# Verify local status file exists if repo provides one (optional)
if [ -f ./public/status/version.json ]; then
  STATUS=$(jq -r '.ciStatus' < ./public/status/version.json)
  if [ "$STATUS" != "green" ]; then
    echo "❌ Local ciStatus not green in ./public/status/version.json"; exit 1
  fi
fi

# Curl endpoint checks
for ENDPOINT in /api/healthz /api/readyz /status/version.json; do
  URL="${HOST}${ENDPOINT}"
  echo "Checking $URL"
  HTTP_CODE=$(curl -sS -H "Accept: application/json" -o /tmp/out -w "%{http_code}" "$URL")
  if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ $ENDPOINT HTTP $HTTP_CODE"; head -c 120 /tmp/out || true; echo; exit 1
  fi

  if [ "$ENDPOINT" = "/status/version.json" ]; then
    # Validate JSON keys
    jq -e '.phase and .commit and .ciStatus and .buildTime and .ragMode' /tmp/out >/dev/null \
      || { echo "❌ Missing required keys in /status/version.json"; head -c 200 /tmp/out; echo; exit 1; }
    RAG=$(jq -r '.ragMode' /tmp/out)
    if [ "$RAG" != "beyond" ]; then
      echo "❌ ragMode != \"beyond\""; jq . /tmp/out; exit 1
    fi
  fi

  echo "OK: $ENDPOINT"
done

# Lighthouse accessibility audit
echo "Running Lighthouse accessibility audit..."
npx lighthouse "$HOST" --only-categories=accessibility --output=json --quiet --chrome-flags="--headless=new" > /tmp/lh.json
A11Y=$(jq '.categories.accessibility.score' /tmp/lh.json)
# A11Y is 0..1
awk "BEGIN {exit !($A11Y >= 0.95)}" || { echo "❌ Lighthouse A11y < 0.95 ($A11Y)"; exit 1; }

echo "✅ Rollback validation passed"
