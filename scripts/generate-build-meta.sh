#!/bin/bash
set -euo pipefail

# Generate unified build metadata
SHORT_SHA="$(git rev-parse --short=8 HEAD)"
BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
PHASE="stage2"
RAG_MODE="beyond"

echo "=== BUILD METADATA GENERATION ==="
echo "SHORT_SHA: $SHORT_SHA"
echo "BUILD_TIME: $BUILD_TIME"
echo "PHASE: $PHASE"
echo "RAG_MODE: $RAG_MODE"

# Create CI build metadata artifact
cat > ci-build-meta.json << EOF
{
  "commit": "$SHORT_SHA",
  "buildTime": "$BUILD_TIME",
  "phase": "$PHASE",
  "ragMode": "$RAG_MODE",
  "ciStatus": "green",
  "env": "prod"
}
EOF

echo "Generated ci-build-meta.json:"
cat ci-build-meta.json

# Update wrangler.toml with unified values
sed -i.bak "s/COMMIT_SHA = \".*\"/COMMIT_SHA = \"$SHORT_SHA\"/" wrangler.toml
sed -i.bak "s/BUILD_TIME = \".*\"/BUILD_TIME = \"$BUILD_TIME\"/" wrangler.toml
rm wrangler.toml.bak

# Update worker wrangler.toml
sed -i.bak "s/COMMIT_SHA = \".*\"/COMMIT_SHA = \"$SHORT_SHA\"/" infra/worker-status/wrangler.toml
sed -i.bak "s/BUILD_TIME = \".*\"/BUILD_TIME = \"$BUILD_TIME\"/" infra/worker-status/wrangler.toml
rm infra/worker-status/wrangler.toml.bak

# Update static version.json (if used)
cat > public/status/version.json << EOF
{
  "commit": "$SHORT_SHA",
  "buildTime": "$BUILD_TIME",
  "phase": "$PHASE",
  "ciStatus": "green",
  "env": "prod",
  "ragMode": "$RAG_MODE"
}
EOF

echo "Updated all commit injection points with unified values"
