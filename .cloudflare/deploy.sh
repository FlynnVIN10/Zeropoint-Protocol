#!/bin/bash

# Zeropoint Protocol Website Deployment Script
# Cloudflare Pages Deployment

set -euo pipefail

echo "🚀 Starting Zeropoint Protocol website deployment..."

# Check required environment variables
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN is not set"
    exit 1
fi

if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
    echo "❌ CLOUDFLARE_ACCOUNT_ID is not set"
    exit 1
fi

if [ -z "${CLOUDFLARE_PROJECT_NAME:-}" ]; then
    echo "❌ CLOUDFLARE_PROJECT_NAME is not set"
    exit 1
fi

echo "✅ Environment variables validated"

# Build the application
echo "🔨 Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Verify build output
if [ ! -d "out" ]; then
    echo "❌ Build output directory 'out' not found"
    exit 1
fi

echo "✅ Build output verified"

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
echo "Project: $CLOUDFLARE_PROJECT_NAME"
echo "Account: $CLOUDFLARE_ACCOUNT_ID"

# Use wrangler for deployment
npx wrangler pages deploy out \
    --project-name="$CLOUDFLARE_PROJECT_NAME" \
    --account-id="$CLOUDFLARE_ACCOUNT_ID" \
    --commit-dirty=true

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Deployment completed successfully"

# Verify deployment
echo "🔍 Verifying deployment..."

# Wait for deployment to propagate
sleep 30

# Check if the site is accessible
DEPLOY_URL="https://$CLOUDFLARE_PROJECT_NAME.pages.dev"
echo "Checking deployment at: $DEPLOY_URL"

# Test main routes
ROUTES=("/" "/legal" "/legal/whitelabel" "/docs" "/library" "/status")

for route in "${ROUTES[@]}"; do
    echo "Testing route: $route"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL$route")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ $route: HTTP $HTTP_CODE"
    else
        echo "❌ $route: HTTP $HTTP_CODE"
        FAILED_ROUTES+=("$route")
    fi
done

# Report results
if [ ${#FAILED_ROUTES[@]} -eq 0 ]; then
    echo "🎉 All routes deployed successfully!"
    echo "🌐 Live URL: $DEPLOY_URL"
else
    echo "⚠️  Some routes failed:"
    printf '%s\n' "${FAILED_ROUTES[@]}"
    exit 1
fi

echo "📊 Deployment Summary:"
echo "  - Project: $CLOUDFLARE_PROJECT_NAME"
echo "  - Account: $CLOUDFLARE_ACCOUNT_ID"
echo "  - Build: $(date -u)"
echo "  - Status: ✅ Success"

echo "🚀 Deployment completed successfully!"
