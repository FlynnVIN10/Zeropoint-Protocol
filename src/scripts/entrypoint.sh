#!/bin/sh
# Zeroth-gated entrypoint for Zeropoint Protocol

# Check for Zeroth Principle in main.ts
if grep -q 'Zeroth Principle' ./src/main.ts; then
  echo "[Zeroth Gate] Ethical alignment confirmed. Launching Zeropoint Protocol..."
  exec npm run start:core
else
  echo "[Zeroth Gate] ERROR: Zeroth Principle not found in main.ts. Launch aborted."
  exit 1
fi 