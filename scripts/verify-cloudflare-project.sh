#!/bin/bash

# Cloudflare Pages Project Name Verification Script
# Per CTO directive: Verify the Cloudflare Pages project name

set -e

echo "🔍 Verifying Cloudflare Pages project name..."

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN not set"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "❌ CLOUDFLARE_ACCOUNT_ID not set"
    exit 1
fi

echo "✅ Environment variables set"

# Get the list of Pages projects
echo "📡 Fetching Cloudflare Pages projects..."
PROJECTS_RESPONSE=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects")

echo "📋 API Response:"
echo "$PROJECTS_RESPONSE" | jq '.'

# Check if the API call was successful
if echo "$PROJECTS_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo "✅ API call successful"
else
    echo "❌ API call failed"
    echo "Error: $(echo "$PROJECTS_RESPONSE" | jq -r '.errors[0].message // "Unknown error"')"
    exit 1
fi

# Extract project names
echo "🔍 Extracting project names..."
PROJECT_NAMES=$(echo "$PROJECTS_RESPONSE" | jq -r '.result[]?.name // empty')

echo "📋 Available project names:"
echo "$PROJECT_NAMES"

# Check for expected project names
echo "🔍 Checking for expected project names..."

EXPECTED_PROJECTS=("zeropointprotocol-ai" "zeropointprotocol" "zeropointprotocolai" "zeropointprotocol.ai")

FOUND_PROJECT=""
for project in "${EXPECTED_PROJECTS[@]}"; do
    if echo "$PROJECT_NAMES" | grep -q "^$project$"; then
        echo "✅ Found expected project: $project"
        FOUND_PROJECT="$project"
        break
    fi
done

if [ -z "$FOUND_PROJECT" ]; then
    echo "❌ No expected project found"
    echo "Expected projects: ${EXPECTED_PROJECTS[*]}"
    echo "Available projects: $PROJECT_NAMES"
    echo ""
    echo "💡 Recommendation:"
    echo "1. Check Cloudflare Dashboard → Pages → Project name"
    echo "2. Update CLOUDFLARE_PROJECT_NAME secret with exact project name"
    echo "3. Ensure project name has no dots (custom domains can have dots)"
    exit 1
fi

# Get detailed project information
echo "📋 Getting detailed project information for: $FOUND_PROJECT"
PROJECT_DETAILS=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$FOUND_PROJECT")

echo "📋 Project Details:"
echo "$PROJECT_DETAILS" | jq '.'

# Extract key information
PROJECT_NAME=$(echo "$PROJECT_DETAILS" | jq -r '.result.name // "unknown"')
PROJECT_DOMAINS=$(echo "$PROJECT_DETAILS" | jq -r '.result.domains[] // empty')
LATEST_DEPLOYMENT=$(echo "$PROJECT_DETAILS" | jq -r '.result.latest_deployment.id // "none"')

echo ""
echo "🎯 VERIFICATION RESULTS:"
echo "========================="
echo "✅ Project Name: $PROJECT_NAME"
echo "🌐 Custom Domains: $PROJECT_DOMAINS"
echo "🚀 Latest Deployment: $LATEST_DEPLOYMENT"
echo ""
echo "📝 EVIDENCE PACK:"
echo "=================="
echo "Project Name for CI: $PROJECT_NAME"
echo "API Response: $PROJECTS_RESPONSE"
echo "Project Details: $PROJECT_DETAILS"
echo ""
echo "🔧 NEXT STEPS:"
echo "=============="
echo "1. Update CLOUDFLARE_PROJECT_NAME secret to: $PROJECT_NAME"
echo "2. Update workflow files to use: projectName: $PROJECT_NAME"
echo "3. Test deployment with new project name"
echo "4. Verify custom domain mapping"

# Save evidence
echo "$PROJECTS_RESPONSE" > cloudflare-projects-verification.json
echo "$PROJECT_DETAILS" > cloudflare-project-details.json

echo ""
echo "📁 Evidence files saved:"
echo "- cloudflare-projects-verification.json"
echo "- cloudflare-project-details.json"

echo ""
echo "✅ Cloudflare Pages project name verification complete!"
