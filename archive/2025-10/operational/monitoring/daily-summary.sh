#!/bin/bash

# Daily operational summary report
REPORT_DATE=$(date +%Y-%m-%d)
REPORT_FILE="monitoring/reports/daily-summary-${REPORT_DATE}.md"

echo "# Zeropoint Protocol - Daily Operational Summary" > "$REPORT_FILE"
echo "**Date:** $REPORT_DATE" >> "$REPORT_FILE"
echo "**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Count successful vs failed monitoring checks
SUCCESS_COUNT=$(grep -c "✅" monitoring/logs/monitor.log 2>/dev/null || echo "0")
FAILURE_COUNT=$(grep -c "❌" monitoring/logs/monitor.log 2>/dev/null || echo "0")
WARNING_COUNT=$(grep -c "⚠️" monitoring/logs/monitor.log 2>/dev/null || echo "0")

echo "## Monitoring Summary" >> "$REPORT_FILE"
echo "- **Successful Checks:** $SUCCESS_COUNT" >> "$REPORT_FILE"
echo "- **Failed Checks:** $FAILURE_COUNT" >> "$REPORT_FILE"
echo "- **Warnings:** $WARNING_COUNT" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# System status
if [ $FAILURE_COUNT -eq 0 ]; then
    echo "## System Status: 🟢 OPERATIONAL EXCELLENCE" >> "$REPORT_FILE"
else
    echo "## System Status: 🟡 DEGRADED PERFORMANCE" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "## Recent Activity" >> "$REPORT_FILE"
echo "Last 10 monitoring entries:" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
tail -10 monitoring/logs/monitor.log >> "$REPORT_FILE" 2>/dev/null || echo "No monitoring logs found" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"

echo "Daily summary report generated: $REPORT_FILE"
