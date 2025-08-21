# Sonic MAX Cursor Playbook - Phase 5 Makefile
# Tag: [SONIC-MAX][PHASE5]

.PHONY: help smoke verify evidence gate clean

# Default target
help:
	@echo "🚀 Sonic MAX Cursor Playbook - Phase 5 Makefile"
	@echo "================================================"
	@echo ""
	@echo "Available targets:"
	@echo "  smoke     - Run smoke tests against all endpoints"
	@echo "  verify    - Run verification gate with schema validation"
	@echo "  evidence  - Publish evidence to public directory"
	@echo "  gate      - Run complete verification gate (smoke + verify + evidence)"
	@echo "  clean     - Clean generated artifacts"
	@echo "  help      - Show this help message"
	@echo ""
	@echo "Environment variables:"
	@echo "  BASE_URL  - Base URL for testing (default: https://zeropointprotocol.ai)"
	@echo ""

# Set default BASE_URL if not provided
BASE_URL ?= https://zeropointprotocol.ai

# Run smoke tests
smoke:
	@echo "🔥 Running smoke tests against $(BASE_URL)..."
	@BASE_URL=$(BASE_URL) pnpm smoke

# Run verification gate
verify:
	@echo "✅ Running verification gate against $(BASE_URL)..."
	@BASE_URL=$(BASE_URL) pnpm verify:phase5

# Collect Lighthouse data
lighthouse:
	@echo "📊 Collecting Lighthouse data..."
	@pnpm lighthouse:collect

# Publish evidence
evidence:
	@echo "📋 Publishing evidence to public directory..."
	@pnpm evidence:publish

# Run complete verification gate
gate: smoke verify lighthouse evidence
	@echo "🎯 Complete verification gate executed successfully!"
	@echo "📊 Results available in evidence/phase5/"

# Clean generated artifacts
clean:
	@echo "🧹 Cleaning generated artifacts..."
	@rm -rf evidence/phase5/smoke/smoke-*.json
	@rm -rf evidence/phase5/verify/verify-*.json
	@rm -rf evidence/phase5/lighthouse/collection_metadata.json
	@echo "✅ Cleanup completed"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@pnpm install
	@pnpm add -D ajv ajv-formats
	@echo "✅ Dependencies installed"

# Setup development environment
setup: install
	@echo "🔧 Setting up development environment..."
	@mkdir -p evidence/phase5/smoke
	@mkdir -p evidence/phase5/verify
	@mkdir -p evidence/phase5/lighthouse
	@mkdir -p public/evidence/phase5
	@echo "✅ Development environment ready"

# Test all scripts locally
test-local:
	@echo "🧪 Testing all scripts locally..."
	@echo "Testing smoke test..."
	@BASE_URL=http://localhost:3001 pnpm smoke || echo "Smoke test failed (expected if local server not running)"
	@echo "Testing verification gate..."
	@BASE_URL=http://localhost:3001 pnpm verify:phase5 || echo "Verification gate failed (expected if local server not running)"
	@echo "Testing Lighthouse collection..."
	@pnpm lighthouse:collect
	@echo "✅ Local testing completed"

# Show current status
status:
	@echo "📊 Current Phase 5 Status"
	@echo "========================"
	@echo "Base URL: $(BASE_URL)"
	@echo "Node version: $(shell node --version)"
	@echo "pnpm version: $(shell pnpm --version)"
	@echo ""
	@echo "Evidence directories:"
	@ls -la evidence/phase5/ 2>/dev/null || echo "No evidence directory found"
	@echo ""
	@echo "Scripts:"
	@ls -la scripts/ 2>/dev/null || echo "No scripts directory found"
	@echo ""
	@echo "Schemas:"
	@ls -la scripts/_schemas/ 2>/dev/null || echo "No schemas directory found"
