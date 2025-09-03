#!/bin/bash

# Cloudflare Pages Build Script with Evidence Generation
# This script runs before Cloudflare Pages builds the site

set -e

echo "🔧 Cloudflare Pages Build Script with Evidence Generation"
echo "Commit: $CF_PAGES_COMMIT_SHA"
echo "Branch: $CF_PAGES_BRANCH"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate evidence files from the current commit
echo "🔧 Generating evidence files from commit: $CF_PAGES_COMMIT_SHA"
GITHUB_SHA="$CF_PAGES_COMMIT_SHA" node scripts/generate-evidence.js

# Verify evidence generation
echo "✅ Verifying evidence files were generated:"
ls -la public/evidence/phase1/
ls -la public/evidence/training/sample-run-123/

echo "📋 Evidence file contents:"
echo "Index commit: $(cat public/evidence/phase1/index.json | jq -r '.commit')"
echo "Metadata commit: $(cat public/evidence/phase1/metadata.json | jq -r '.commit')"
echo "Progress commit: $(cat public/evidence/phase1/progress.json | jq -r '.commit')"
echo "Provenance commit: $(cat public/evidence/training/sample-run-123/provenance.json | jq -r '.commit')"

# Verify all files reference the same commit
if [ "$(cat public/evidence/phase1/index.json | jq -r '.commit')" = "$CF_PAGES_COMMIT_SHA" ] && \
   [ "$(cat public/evidence/phase1/metadata.json | jq -r '.commit')" = "$CF_PAGES_COMMIT_SHA" ] && \
   [ "$(cat public/evidence/phase1/progress.json | jq -r '.commit')" = "$CF_PAGES_COMMIT_SHA" ] && \
   [ "$(cat public/evidence/training/sample-run-123/provenance.json | jq -r '.commit')" = "$CF_PAGES_COMMIT_SHA" ]; then
  echo "✅ All evidence files reference commit: $CF_PAGES_COMMIT_SHA"
else
  echo "❌ Evidence file commit mismatch detected!"
  exit 1
fi

# Build the application
echo "🏗️ Building application with evidence files..."
npm run build

echo "✅ Build complete with evidence generation"
