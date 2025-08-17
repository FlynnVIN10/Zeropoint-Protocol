#!/bin/bash

# Simple deployment script for Zeropoint Protocol static site
set -euo pipefail

echo "🚀 Deploying Zeropoint Protocol static site..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Verify static files exist
echo "🔍 Verifying static files..."
REQUIRED_FILES=("public/index.html" "public/api/healthz.json" "public/api/readyz.json")

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file not found: $file"
        exit 1
    fi
    echo "✅ Found: $file"
done

echo "✅ All required static files verified"

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy public --project-name="zeropoint-protocol"

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo "🌐 Site should be available at: https://zeropointprotocol.ai"
else
    echo "❌ Deployment failed"
    exit 1
fi
