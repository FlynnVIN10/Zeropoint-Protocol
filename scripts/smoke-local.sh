#!/bin/bash
# smoke-local.sh - Local smoke tests per CTO directive
# Per CTO directive: Curls + jq → writes smoke.md

set -e

OUTPUT_FILE="public/evidence/compliance/$(date +%F)/smoke.md"
mkdir -p "$(dirname "$OUTPUT_FILE")"

echo "🔬 Running local smoke tests..."

# Ensure server is running
if ! curl -s http://localhost:3000/api/healthz > /dev/null 2>&1; then
  echo "❌ Server not running on localhost:3000"
  echo "   Run: npm run dev"
  exit 1
fi

{
  echo "# Local Smoke Tests"
  echo "**Date:** $(date -u +%FT%TZ)"
  echo "**Host:** localhost:3000"
  echo ""
  echo "---"
  echo ""
  
  echo "## /api/healthz"
  echo '```'
  curl -si http://localhost:3000/api/healthz | sed -n '1,20p'
  echo '```'
  echo ""
  
  echo "## /api/readyz"
  echo '```'
  curl -si http://localhost:3000/api/readyz | sed -n '1,20p'
  echo '```'
  echo ""
  
  echo "## /status/version.json"
  echo '```'
  jq -r '.phase, .commit, .ciStatus, .buildTime' public/status/version.json
  echo '```'
  echo ""
  
  echo "---"
  echo ""
  echo "### Validation"
  echo ""
  
  # Check healthz
  if curl -s http://localhost:3000/api/healthz | jq -e '.ok==true' > /dev/null; then
    echo "- ✅ healthz: ok=true"
  else
    echo "- ❌ healthz: failed"
  fi
  
  # Check readyz
  if curl -s http://localhost:3000/api/readyz | jq -e '.ready==true' > /dev/null; then
    echo "- ✅ readyz: ready=true"
  else
    echo "- ❌ readyz: failed"
  fi
  
  # Check version.json
  if jq -e '.commit and .buildTime and .phase and .ciStatus' public/status/version.json > /dev/null; then
    echo "- ✅ version.json: all fields present"
  else
    echo "- ❌ version.json: missing fields"
  fi
  
  # Check headers
  if curl -sI http://localhost:3000/api/healthz | grep -q "x-content-type-options: nosniff"; then
    echo "- ✅ headers: nosniff present"
  else
    echo "- ❌ headers: nosniff missing"
  fi
  
  echo ""
  echo "**Status:** $(date -u +%FT%TZ)"
  
} > "$OUTPUT_FILE"

echo "✅ Smoke test results written to: $OUTPUT_FILE"
cat "$OUTPUT_FILE"

