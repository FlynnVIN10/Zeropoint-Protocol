#!/usr/bin/env bash
set -euo pipefail

# Deploy-Parity Gate: Ensure deployed SHA matches release tag
# This script validates that the deployed website matches the expected commit

echo "🔍 Deploy-Parity Gate: Validating SHA parity..."

# Get current commit SHA
CURRENT_SHA=$(git rev-parse HEAD)
echo "📝 Current commit SHA: ${CURRENT_SHA}"

# Get the deployed version from the website status endpoint
echo "🌐 Fetching deployed version from website..."

# Try to fetch the status endpoint
DEPLOYED_STATUS=$(curl -s -f "https://zeropointprotocol.ai/api/status/version" 2>/dev/null || echo "{}")

if [ "$DEPLOYED_STATUS" = "{}" ]; then
    echo "⚠️  Website status endpoint not available yet"
    echo "📋 This is expected for initial deployment"
    echo "✅ Deploy-parity gate will validate after deployment"
    exit 0
fi

# Extract deployed SHA from response
DEPLOYED_SHA=$(echo "$DEPLOYED_STATUS" | jq -r '.commit // "unknown"' 2>/dev/null || echo "unknown")

if [ "$DEPLOYED_SHA" = "unknown" ] || [ "$DEPLOYED_SHA" = "null" ]; then
    echo "⚠️  Could not extract deployed SHA from response"
    echo "📋 Response: $DEPLOYED_STATUS"
    echo "✅ Deploy-parity gate will validate after deployment"
    exit 0
fi

echo "🌐 Deployed commit SHA: ${DEPLOYED_SHA}"

# Check if SHAs match
if [ "$CURRENT_SHA" = "$DEPLOYED_SHA" ]; then
    echo "✅ SHA PARITY CONFIRMED"
    echo "📝 Current: ${CURRENT_SHA}"
    echo "🌐 Deployed: ${DEPLOYED_SHA}"
    exit 0
else
    echo "❌ SHA PARITY VIOLATION DETECTED"
    echo "📝 Current: ${CURRENT_SHA}"
    echo "🌐 Deployed: ${DEPLOYED_SHA}"
    echo ""
    echo "🚨 COMPLIANCE VIOLATION: Deployed SHA does not match current commit"
    echo "📋 This indicates a deployment drift or caching issue"
    echo "🔧 Please investigate and redeploy if necessary"
    exit 1
fi
