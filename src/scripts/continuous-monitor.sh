#!/bin/bash

# Thin wrapper to run local continuous monitor from repo root
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Determine repo root via git if available; fallback to two levels up
if command -v git >/dev/null 2>&1; then
  ROOT_DIR="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$SCRIPT_DIR/../..")"
else
  ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi
"$ROOT_DIR/monitoring/continuous-monitor.sh"


