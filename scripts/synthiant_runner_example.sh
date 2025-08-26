#!/bin/bash

# Synthiant Runner Example for SCP v1

set -e

# Constants
MODEL_NAME="tinygrad_toy"
DATASET_NAME="toy_dataset"
OUTPUT_DIR="evidence/training/submissions/$(date +%Y%m%d_%H%M%S)"
METRICS_FILE="$OUTPUT_DIR/metrics.json"

# Check prerequisites
command -v python3 &gt;/dev/null || echo "Python3 required"
command -v git &gt;/dev/null || echo "Git required"

# Run training
python3 scripts/tinygrad_toy_run.py --run-id "$(uuidgen)" --model "$MODEL_NAME" --dataset "$DATASET_NAME" --output "$METRICS_FILE"

# Validate
node scripts/build-leaderboard.mjs --validate

# Summary
cat "$METRICS_FILE"
