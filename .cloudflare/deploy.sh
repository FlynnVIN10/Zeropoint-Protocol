#!/bin/bash

# Zeropoint Protocol Website Deployment Script
# Cloudflare Pages Deployment for Static Site

set -euo pipefail

echo "🚀 Starting Zeropoint Protocol static website deployment..."

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
echo "Project: $CLOUDFLARE_PROJECT_NAME"
echo "Account: $CLOUDFLARE_ACCOUNT_ID"

# Use wrangler for deployment
npx wrangler pages deploy public \
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
ROUTES=("/" "/status" "/metrics" "/consensus" "/audits" "/library" "/governance" "/legal/terms")

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

# Test API endpoints
echo "Testing API endpoints..."
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/healthz")
READY_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/readyz")

if [ "$HEALTH_CODE" = "200" ]; then
    echo "✅ /api/healthz: HTTP $HEALTH_CODE"
else
    echo "❌ /api/healthz: HTTP $HEALTH_CODE"
    FAILED_ROUTES+=("/api/healthz")
fi

if [ "$READY_CODE" = "200" ]; then
    echo "✅ /api/readyz: HTTP $READY_CODE"
else
    echo "❌ /api/readyz: HTTP $READY_CODE"
    FAILED_ROUTES+=("/api/readyz")
fi

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
