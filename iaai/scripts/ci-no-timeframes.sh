#!/usr/bin/env bash
set -euo pipefail

# CI Guardrail: Block planning timeframes and relative promises
# Allow ISO timestamps; block ETA, deadlines, "by EOD", etc.

echo "🔍 Scanning for timeframe violations..."

# Pattern to block timeframe references while allowing legitimate uses
# More specific patterns to avoid false positives
PATTERN='(\bETA\b|\bdeadline\b|\bdue\s+(?:on|by|in|at)\b|\broadmap\s+(?:timeline|schedule|milestone)\b|\bby\s+(?:EOD|end\s+of\s+day|tomorrow|next\s+week)\b|\btomorrow\b|\byesterday\b|\bnext\s+(?:week|month|year)\b|\bwithin\s+[0-9]+\s?(?:hours?|days?|weeks?|months?|years?)\b)'

# Files to exclude from scanning
EXCLUDE_PATTERN='(^vendor/|\.png$|\.jpg$|\.gif$|\.woff2$|\.ico$|\.lock$|\.git/|node_modules/|\.next/)'

echo "📁 Scanning files..."

# Scan for violations
VIOLATIONS=$(git ls-files | grep -Ev "${EXCLUDE_PATTERN}" | grep -v "^website-legacy-archive" | xargs -I{} grep -EIn "${PATTERN}" {} 2>/dev/null || true)

echo "🔍 Pattern: ${PATTERN}"
echo "📁 Files scanned: $(git ls-files | grep -Ev "${EXCLUDE_PATTERN}" | grep -v "^website-legacy-archive" | wc -l)"

if [ -n "${VIOLATIONS}" ]; then
    echo "❌ TIMEFRAME VIOLATIONS FOUND:"
    echo "${VIOLATIONS}"
    echo ""
    echo "🚨 COMPLIANCE VIOLATION: Timeframe references are not allowed."
    echo "✅ Allowed: ISO timestamps (2025-08-12T15:30:00Z)"
    echo "❌ Blocked: ETA, deadlines, 'by EOD', 'in 2 days', 'due on Friday'"
    echo ""
    echo "Please remove all timeframe references and commit again."
    exit 1
else
    echo "✅ No timeframe violations found. Compliance check PASSED."
    exit 0
fi
