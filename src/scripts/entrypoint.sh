#!/bin/sh
# Zeroth-gated entrypoint for Lexame

# Check for Zeroth Principle in main.ts
if grep -q 'Zeroth Principle' ./src/main.ts; then
  echo "[Zeroth Gate] Ethical alignment confirmed. Launching Lexame..."
  exec npm run start:core
else
  echo "[Zeroth Gate] ERROR: Zeroth Principle not found in main.ts. Launch aborted."
  exit 1
fi 