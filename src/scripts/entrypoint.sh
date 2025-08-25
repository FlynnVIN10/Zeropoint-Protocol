#!/bin/bash

# Zeropoint Protocol - Zeroth-Gated Entrypoint
# Checks main.ts intent via grep for unethical keywords
# Launches the compiled application if aligned

set -e

echo "🔒 Zeroth Principle Gate: Checking intent alignment..."
echo "Only with good intent and a good heart does the system function"

# Check if main.ts exists
if [ ! -f "src/main.ts" ]; then
    echo "❌ CRITICAL: main.ts not found - cannot validate intent"
    exit 1
fi

# Define unethical keywords to scan for
UNETHICAL_KEYWORDS=(
    "hack"
    "exploit"
    "bypass"
    "unauthorized"
    "malicious"
    "harmful"
    "destructive"
    "illegal"
    "fraud"
    "deceive"
)

echo "🔍 Scanning main.ts for intent alignment..."

# Scan for unethical keywords
VIOLATIONS=()
for keyword in "${UNETHICAL_KEYWORDS[@]}"; do
    if grep -qi "$keyword" src/main.ts; then
        VIOLATIONS+=("$keyword")
    fi
done

# Check for violations
if [ ${#VIOLATIONS[@]} -gt 0 ]; then
    echo "❌ ZEROTH PRINCIPLE VIOLATION DETECTED!"
    echo "Unethical keywords found: ${VIOLATIONS[*]}"
    echo "System will not launch - intent not aligned with good heart"
    exit 1
fi

echo "✅ Zeroth Principle Gate: PASSED"
echo "Intent aligned with good heart - system may function"
echo "�� Launching Zeropoint Protocol..."

# Launch the compiled application directly (not npm start)
if [ -f "dist/main.js" ]; then
    echo "✅ Launching compiled application..."
    node dist/main.js
else
    echo "❌ Compiled application not found. Building first..."
    npm run build
    node dist/main.js
fi
