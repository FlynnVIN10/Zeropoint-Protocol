#!/bin/bash

# Synthient Syslog Viewer - CEO Oversight Tool
# Usage: ./synthient-logs.sh [format] [limit]

BASE_URL="https://zeropointprotocol.ai/api/synthients-syslog"
FORMAT=${1:-"syslog"}
LIMIT=${2:-"10"}

echo "🤖 Zeropoint Protocol - Synthient Activity Logs"
echo "================================================"
echo "Format: $FORMAT | Limit: $LIMIT"
echo "Generated: $(date)"
echo ""

if [ "$FORMAT" = "syslog" ]; then
    echo "📋 Human-Readable Syslog Format:"
    echo "--------------------------------"
    curl -fsS "$BASE_URL?format=syslog&limit=$LIMIT"
    echo ""
    echo ""
    echo "💡 Priority Codes: <130>=Medium, <131>=Low, <128>=High, <128>=Critical"
    echo "💡 Format: <priority>timestamp hostname synthient[logid]: action - details"
elif [ "$FORMAT" = "json" ]; then
    echo "📋 JSON Format:"
    echo "---------------"
    curl -fsS "$BASE_URL?format=json&limit=$LIMIT" | jq .
else
    echo "❌ Invalid format. Use 'syslog' or 'json'"
    echo ""
    echo "Usage:"
    echo "  ./synthient-logs.sh syslog 20    # Human-readable syslog, 20 entries"
    echo "  ./synthient-logs.sh json 5       # JSON format, 5 entries"
    echo "  ./synthient-logs.sh              # Default: syslog, 10 entries"
    exit 1
fi

echo ""
echo "🔗 Web Dashboard: https://zeropointprotocol.ai/synthients-monitor.html"
echo "🔗 API Endpoint: $BASE_URL"
