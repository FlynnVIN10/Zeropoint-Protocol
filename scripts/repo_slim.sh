#!/usr/bin/env bash
set -euo pipefail

# Repo Slim Script - Enforces repository hygiene and structure
# Phase R Task 2: Purge stale content and tighten layout

echo "🔍 Running repository hygiene check..."

# Check for forbidden directories that should not exist
FORBIDDEN_DIRS=(
    "website/node_modules"
    "website/.next"
    "website/out"
    "website/build"
    "website/dist"
    ".venv"
    "venv"
    "env"
    "node_modules"
    "dist"
    "build"
    "out"
    ".next"
)

# Check for forbidden file patterns
FORBIDDEN_PATTERNS=(
    "*.ckpt"
    "*.onnx"
    "*.mp4"
    "*.uasset"
    "*.bin"
    "*.mov"
    "*.usdz"
    "*.log"
    "*.tmp"
    "*.temp"
)

# Check for forbidden directories
echo "📁 Checking for forbidden directories..."
for dir in "${FORBIDDEN_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "❌ Forbidden directory found: $dir"
        echo "   This directory should not exist in the repository."
        echo "   Please remove it and update .gitignore if needed."
        exit 1
    fi
done

# Check for forbidden file patterns
echo "📄 Checking for forbidden file patterns..."
for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    found_files=$(find . -name "$pattern" -not -path "./.git/*" -not -path "./vendor/*" 2>/dev/null | head -10)
    if [ -n "$found_files" ]; then
        echo "❌ Forbidden files found matching pattern: $pattern"
        echo "   Found files:"
        echo "$found_files"
        echo "   These files should not exist in the repository."
        echo "   Please remove them and update .gitignore if needed."
        exit 1
    fi
done

# Check repository structure
echo "🏗️  Checking repository structure..."

# Required directories
REQUIRED_DIRS=(
    "platform"
    "website"
    "scripts"
    "PM-to-Dev-Team"
    "test"
    "config"
    "app"
    "src"
    "vendor"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ Required directory missing: $dir"
        echo "   This directory is required for the repository structure."
        exit 1
    fi
done

# Check for oversized files (>10MB)
echo "📏 Checking for oversized files..."
OVERSIZED_FILES=$(find . -type f -size +10M -not -path "./.git/*" -not -path "./vendor/*" 2>/dev/null | head -10)
if [ -n "$OVERSIZED_FILES" ]; then
    echo "❌ Oversized files found (>10MB):"
    echo "$OVERSIZED_FILES"
    echo "   These files may cause push issues."
    echo "   Consider using Git LFS or removing them if not needed."
    exit 1
fi

# Check total repository size
REPO_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "📊 Repository size: $REPO_SIZE"

# Check if vendor/tinygrad is properly structured
if [ -d "vendor/tinygrad" ]; then
    if [ -d "vendor/tinygrad/.git" ]; then
        echo "✅ vendor/tinygrad is a git repository (ready for submodule conversion)"
    else
        echo "⚠️  vendor/tinygrad exists but is not a git repository"
        echo "   Consider converting to submodule or removing"
    fi
fi

echo "✅ Repository hygiene check passed!"
echo "   All forbidden content removed"
echo "   Structure validated"
echo "   No oversized files detected"
