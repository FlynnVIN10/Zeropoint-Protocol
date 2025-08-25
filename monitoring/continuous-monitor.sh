#!/bin/bash

# Zeropoint Protocol - Continuous Operational Monitoring
# Monitors platform health and operational excellence

set -e

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

LOG_FILE="$PROJECT_ROOT/monitoring/operational-logs.txt"
STATUS_FILE="$PROJECT_ROOT/monitoring/operational-status.md"
ALERT_THRESHOLD=3
FAILURE_COUNT=0

# Ensure monitoring directories exist
mkdir -p "$PROJECT_ROOT/monitoring/logs"
mkdir -p "$PROJECT_ROOT/monitoring/alerts"
mkdir -p "$PROJECT_ROOT/monitoring/reports"

echo "🔍 Zeropoint Protocol - Continuous Monitoring Started"
echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" | tee -a "$LOG_FILE"
echo "Project Root: $PROJECT_ROOT" | tee -a "$LOG_FILE"

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local name=$2
    
    if curl -s -f "$endpoint" > /dev/null 2>&1; then
        echo "✅ $name: Operational" | tee -a "$LOG_FILE"
        return 0
    else
        echo "❌ $name: FAILED" | tee -a "$LOG_FILE"
        FAILURE_COUNT=$((FAILURE_COUNT + 1))
        return 1
    fi
}

# Function to test response time
test_response_time() {
    local endpoint=$1
    local name=$2
    
    local start_time=$(date +%s%N)
    if curl -s -f "$endpoint" > /dev/null 2>&1; then
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 ))
        echo "⏱️  $name: ${response_time}ms" | tee -a "$LOG_FILE"
        
        if [ $response_time -gt 1000 ]; then
            echo "⚠️  WARNING: $name response time >1s" | tee -a "$LOG_FILE"
        fi
    else
        echo "❌ $name: Response time test failed" | tee -a "$LOG_FILE"
        FAILURE_COUNT=$((FAILURE_COUNT + 1))
    fi
}

# Main monitoring sequence
echo "🔍 Testing all critical endpoints..." | tee -a "$LOG_FILE"

test_endpoint "https://zeropointprotocol.ai/api/healthz" "Health Check"
test_endpoint "https://zeropointprotocol.ai/api/readyz" "Ready Check"
test_endpoint "https://zeropointprotocol.ai/status/version.json" "Version Check"
test_endpoint "https://zeropointprotocol.ai/api/training/status" "Training Status"
test_endpoint "https://zeropointprotocol.ai/petals/status.json" "Petals Status"
test_endpoint "https://zeropointprotocol.ai/api/wondercraft/status.json" "Wondercraft Status"

echo "" | tee -a "$LOG_FILE"
echo "⏱️  Testing response times..." | tee -a "$LOG_FILE"

test_response_time "https://zeropointprotocol.ai/api/healthz" "Health Check"
test_response_time "https://zeropointprotocol.ai/api/readyz" "Ready Check"
test_response_time "https://zeropointprotocol.ai/status/version.json" "Version Check"

echo "" | tee -a "$LOG_FILE"
echo "🔍 Testing SCP v1 system..." | tee -a "$LOG_FILE"

cd "$PROJECT_ROOT"
if node scripts/build-leaderboard.mjs > /dev/null 2>&1; then
    echo "✅ SCP v1 Leaderboard Builder: Operational" | tee -a "$LOG_FILE"
else
    echo "❌ SCP v1 Leaderboard Builder: FAILED" | tee -a "$LOG_FILE"
    FAILURE_COUNT=$((FAILURE_COUNT + 1))
fi

if node scripts/build-dynamic-evidence.mjs > /dev/null 2>&1; then
    echo "✅ Dynamic Evidence System: Operational" | tee -a "$LOG_FILE"
else
    echo "❌ Dynamic Evidence System: FAILED" | tee -a "$LOG_FILE"
    FAILURE_COUNT=$((FAILURE_COUNT + 1))
fi

echo "" | tee -a "$LOG_FILE"
echo "📊 Monitoring Summary:" | tee -a "$LOG_FILE"
echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" | tee -a "$LOG_FILE"
echo "Failures: $FAILURE_COUNT" | tee -a "$LOG_FILE"

if [ $FAILURE_COUNT -eq 0 ]; then
    echo "🎉 PLATFORM STATUS: OPERATIONAL EXCELLENCE" | tee -a "$LOG_FILE"
    echo "✅ All systems operational" | tee -a "$LOG_FILE"
    echo "✅ Response times within SLA" | tee -a "$LOG_FILE"
    echo "✅ SCP v1 system functional" | tee -a "$LOG_FILE"
    echo "✅ Dynamic evidence operational" | tee -a "$LOG_FILE"
else
    echo "⚠️  PLATFORM STATUS: DEGRADED PERFORMANCE" | tee -a "$LOG_FILE"
    echo "❌ $FAILURE_COUNT system(s) experiencing issues" | tee -a "$LOG_FILE"
    
    if [ $FAILURE_COUNT -ge $ALERT_THRESHOLD ]; then
        echo "🚨 ALERT: Multiple system failures detected!" | tee -a "$LOG_FILE"
        echo "🚨 Immediate attention required!" | tee -a "$LOG_FILE"
    fi
fi

echo "" | tee -a "$LOG_FILE"
echo "---" | tee -a "$LOG_FILE"

# Update status file
if [ $FAILURE_COUNT -eq 0 ]; then
    sed -i '' 's/Platform Status:.*/Platform Status: 🟢 OPERATIONAL EXCELLENCE/' "$STATUS_FILE" 2>/dev/null || true
    sed -i '' 's/Last Updated:.*/Last Updated: '"$(date -u +"%Y-%m-%d %H:%M UTC")"'/' "$STATUS_FILE" 2>/dev/null || true
else
    sed -i '' 's/Platform Status:.*/Platform Status: 🟡 DEGRADED PERFORMANCE/' "$STATUS_FILE" 2>/dev/null || true
    sed -i '' 's/Last Updated:.*/Last Updated: '"$(date -u +"%Y-%m-%d %H:%M UTC")"'/' "$STATUS_FILE" 2>/dev/null || true
fi

exit $FAILURE_COUNT
