#!/bin/bash
# SCRA Endpoint Probe Script
# Probes all training endpoints and stores results in evidence directory

commit=$(git rev-parse HEAD)
base_url="https://8b685ab4.zeropoint-protocol.pages.dev"
output_dir="evidence/phase1/verify/$commit"

echo "Probing endpoints for commit: $commit"
echo "Base URL: $base_url"
echo "Output directory: $output_dir"

mkdir -p "$output_dir"

# List of endpoints to probe
endpoints=(
  "/api/training/runs"
  "/api/healthz"
  "/api/readyz"
  "/api/events/training/test"
  "/status/version.json"
)

# Probe each endpoint
for endpoint in "${endpoints[@]}"; do
  echo "Probing $endpoint..."
  
  # Replace slashes with underscores for filename
  filename=$(echo "$endpoint" | tr / _)
  
  # Capture full response with headers
  curl -i "$base_url$endpoint" > "$output_dir/${filename}.txt" 2>&1
  
  if [ $? -eq 0 ]; then
    echo "✅ Successfully probed $endpoint"
  else
    echo "❌ Failed to probe $endpoint"
  fi
done

# Test POST endpoint with test token
echo "Testing POST /api/training/runs with test token..."
curl -i -X POST \
  -H "Authorization: Bearer scra-test-token" \
  -H "Content-Type: application/json" \
  -d '{"dataset": "MNIST", "epochs": 5}' \
  "$base_url/api/training/runs" > "$output_dir/api_training_runs_post.txt" 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Successfully tested POST /api/training/runs"
else
  echo "❌ Failed to test POST /api/training/runs"
fi

# Test metrics endpoint with sample run ID
echo "Testing metrics endpoint..."
curl -i "$base_url/api/training/runs/sample-run-123/metrics" > "$output_dir/api_training_runs_sample_run_123_metrics.txt" 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Successfully tested metrics endpoint"
else
  echo "❌ Failed to test metrics endpoint"
fi

echo "Probe complete. Results saved to: $output_dir"
ls -l "$output_dir"
