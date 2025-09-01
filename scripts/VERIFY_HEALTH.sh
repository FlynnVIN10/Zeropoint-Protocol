#!/bin/bash

# VERIFY_HEALTH.sh - Health endpoint verification script
# Per CTO directive: Verify all health endpoints return correct JSON structure

set -e

echo "🔍 Verifying Zeropoint Protocol Health Endpoints..."
echo "=================================================="

BASE_URL="${1:-https://zeropointprotocol.ai}"
echo "Testing endpoints at: $BASE_URL"
echo ""

# Test /api/healthz
echo "📊 Testing /api/healthz..."
HEALTHZ_RESPONSE=$(curl -s "$BASE_URL/api/healthz")
echo "Response: $HEALTHZ_RESPONSE"

# Verify required keys
if echo "$HEALTHZ_RESPONSE" | jq -e '.status' > /dev/null 2>&1; then
    echo "✅ status: OK"
else
    echo "❌ status: MISSING"
fi

if echo "$HEALTHZ_RESPONSE" | jq -e '.commit' > /dev/null 2>&1; then
    echo "✅ commit: OK"
else
    echo "❌ commit: MISSING"
fi

if echo "$HEALTHZ_RESPONSE" | jq -e '.phase' > /dev/null 2>&1; then
    echo "✅ phase: OK"
else
    echo "❌ phase: MISSING"
fi

if echo "$HEALTHZ_RESPONSE" | jq -e '.ciStatus' > /dev/null 2>&1; then
    echo "✅ ciStatus: OK"
else
    echo "❌ ciStatus: MISSING"
fi

if echo "$HEALTHZ_RESPONSE" | jq -e '.buildTime' > /dev/null 2>&1; then
    echo "✅ buildTime: OK"
else
    echo "❌ buildTime: MISSING"
fi

echo ""

# Test /api/readyz
echo "📊 Testing /api/readyz..."
READYZ_RESPONSE=$(curl -s "$BASE_URL/api/readyz")
echo "Response: $READYZ_RESPONSE"

# Verify required keys
if echo "$READYZ_RESPONSE" | jq -e '.ready' > /dev/null 2>&1; then
    echo "✅ ready: OK"
else
    echo "❌ ready: MISSING"
fi

if echo "$READYZ_RESPONSE" | jq -e '.phase' > /dev/null 2>&1; then
    echo "✅ phase: OK"
else
    echo "❌ phase: MISSING"
fi

if echo "$READYZ_RESPONSE" | jq -e '.ciStatus' > /dev/null 2>&1; then
    echo "✅ ciStatus: OK"
else
    echo "❌ ciStatus: MISSING"
fi

echo ""

# Test /status/version.json
echo "📊 Testing /status/version.json..."
VERSION_RESPONSE=$(curl -s "$BASE_URL/status/version.json")
echo "Response: $VERSION_RESPONSE"

# Verify required keys
if echo "$VERSION_RESPONSE" | jq -e '.commit' > /dev/null 2>&1; then
    echo "✅ commit: OK"
else
    echo "❌ commit: MISSING"
fi

if echo "$VERSION_RESPONSE" | jq -e '.buildTime' > /dev/null 2>&1; then
    echo "✅ buildTime: OK"
else
    echo "❌ buildTime: MISSING"
fi

if echo "$VERSION_RESPONSE" | jq -e '.env' > /dev/null 2>&1; then
    echo "✅ env: OK"
else
    echo "❌ env: MISSING"
fi

echo ""

# Test /api/training/status.json
echo "📊 Testing /api/training/status.json..."
TRAINING_RESPONSE=$(curl -s "$BASE_URL/api/training/status.json")
echo "Response: $TRAINING_RESPONSE"

# Verify required keys
if echo "$TRAINING_RESPONSE" | jq -e '.active_runs' > /dev/null 2>&1; then
    echo "✅ active_runs: OK"
else
    echo "❌ active_runs: MISSING"
fi

if echo "$TRAINING_RESPONSE" | jq -e '.completed_today' > /dev/null 2>&1; then
    echo "✅ completed_today: OK"
else
    echo "❌ completed_today: MISSING"
fi

if echo "$TRAINING_RESPONSE" | jq -e '.total_runs' > /dev/null 2>&1; then
    echo "✅ total_runs: OK"
else
    echo "❌ total_runs: MISSING"
fi

echo ""

echo "🎯 Health Verification Complete!"
echo "=================================================="

# Summary
echo "Summary of findings:"
echo "- Health endpoints: $(echo "$HEALTHZ_RESPONSE" | jq -r '.status' 2>/dev/null || echo 'FAILED')"
echo "- Ready status: $(echo "$READYZ_RESPONSE" | jq -r '.ready' 2>/dev/null || echo 'FAILED')"
echo "- Training data: $(echo "$TRAINING_RESPONSE" | jq -r '.active_runs' 2>/dev/null || echo 'FAILED') active runs"

echo ""
echo "🔧 Next steps:"
echo "1. Fix any missing keys identified above"
echo "2. Verify SPA can display the data"
echo "3. Run Lighthouse tests for A11y ≥95"
echo "4. Ensure MOCKS_DISABLED=1"
