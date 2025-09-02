#!/bin/bash

# Capture headers for all endpoints
COMMIT_SHA=${1:-$(git rev-parse HEAD)}
BASE_URL=${2:-"http://localhost:3000"}
OUTPUT_DIR="evidence/phase0/verify/${COMMIT_SHA}/headers"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Endpoints to test
endpoints=(
  "/status/version.json"
  "/api/healthz"
  "/api/readyz"
)

echo "Capturing headers for commit: $COMMIT_SHA"
echo "Base URL: $BASE_URL"
echo "Output directory: $OUTPUT_DIR"

# Capture headers for each endpoint
for endpoint in "${endpoints[@]}"; do
  echo "Capturing headers for $endpoint..."
  
  # Convert endpoint to filename (replace / with _)
  filename=$(echo "$endpoint" | sed 's/\//_/g')
  
  # Capture headers with curl -i
  curl -i "${BASE_URL}${endpoint}" > "${OUTPUT_DIR}/${filename}.txt" 2>&1
  
  if [ $? -eq 0 ]; then
    echo "✅ Headers captured for $endpoint"
  else
    echo "❌ Failed to capture headers for $endpoint"
  fi
done

echo "Header capture complete. Files saved to: $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"
