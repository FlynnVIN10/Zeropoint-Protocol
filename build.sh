#!/bin/bash

# Cloudflare Pages Build Script (delegates evidence generation to postbuild)
# This script runs before Cloudflare Pages builds the site

set -e

echo "🔧 Cloudflare Pages Build Script with Evidence Generation"
echo "Commit: $CF_PAGES_COMMIT_SHA"
echo "Branch: $CF_PAGES_BRANCH"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🏗️ Building application with evidence files..."
npm run build

echo "✅ Build complete with evidence generation"
