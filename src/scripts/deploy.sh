#!/bin/bash

# © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

# Zeroth Principle: Only with good intent and a good heart does the system function.
# Production Deployment Script for Zeropoint Protocol

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Zeroth-gate intent validation
check_intent() {
    local dry_run_mode="$1"
    log "🔍 Zeroth-gate: Validating deployment intent..."
    
    # Check if this is a legitimate deployment
    if [[ "$dry_run_mode" == "true" ]]; then
        log "🧪 Dry-run mode detected - intent validation passed"
        return 0
    fi
    
    # Check environment variables for deployment authorization
    if [[ -z "$DEPLOYMENT_AUTHORIZED" && -z "$CI" ]]; then
        error "Zeroth violation: Deployment not authorized"
        return 1
    fi
    
    # Check for malicious patterns in environment
    if [[ "$NODE_ENV" == "production" && -z "$DEPLOYMENT_AUTHORIZED" ]]; then
        error "Zeroth violation: Production deployment requires explicit authorization"
        return 1
    fi
    
    success "✅ Zeroth-gate: Intent validation passed"
    return 0
}

# Soulchain logging function
soulchain_log() {
    local message="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    
    # Create soulchain entry
    cat > /tmp/soulchain_deploy.json << EOF
{
    "action": "deployment",
    "metadata": {
        "timestamp": "$timestamp",
        "environment": "${NODE_ENV:-development}",
        "user": "${USER:-unknown}",
        "hostname": "$(hostname)"
    },
    "data": "$message"
}
EOF
    
    # Log to soulchain if available
    if command -v curl >/dev/null 2>&1; then
        if curl -s -f http://localhost:3000/v1/soulchain/persist \
            -H "Content-Type: application/json" \
            -d @/tmp/soulchain_deploy.json >/dev/null 2>&1; then
            log "📝 Soulchain: Deployment logged successfully"
        else
            warning "⚠️  Soulchain: Could not log deployment (service may not be running)"
        fi
    fi
    
    # Clean up
    rm -f /tmp/soulchain_deploy.json
}

# Main deployment function
deploy() {
    local dry_run=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                dry_run=true
                shift
                ;;
            *)
                error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    log "🚀 Starting Zeropoint Protocol deployment..."
    
    # Check intent
    if ! check_intent "$dry_run"; then
        error "Deployment blocked by Zeroth-gate validation"
        exit 1
    fi
    
    if [[ "$dry_run" == true ]]; then
        log "🧪 DRY-RUN MODE: Simulating deployment steps..."
        
        # Simulate npm install
        log "📦 Simulating: npm install"
        if [[ -f "package.json" ]]; then
            success "✅ package.json found"
        else
            error "❌ package.json not found"
            return 1
        fi
        
        # Simulate npm run build
        log "🔨 Simulating: npm run build"
        if [[ -f "nest-cli.json" ]]; then
            success "✅ NestJS configuration found"
        else
            error "❌ NestJS configuration not found"
            return 1
        fi
        
        # Simulate health check
        log "🏥 Simulating: Health check"
        if command -v curl >/dev/null 2>&1; then
            success "✅ curl available for health checks"
        else
            warning "⚠️  curl not available"
        fi
        
        success "✅ Dry-run completed successfully"
        soulchain_log "Dry-run deployment simulation completed at $(date)"
        return 0
    fi
    
    # Production deployment
    log "📦 Installing dependencies..."
    if ! npm install; then
        error "Failed to install dependencies"
        exit 1
    fi
    success "✅ Dependencies installed"
    
    log "🔨 Building application..."
    if ! npm run build; then
        error "Failed to build application"
        exit 1
    fi
    success "✅ Application built successfully"
    
    log "🚀 Starting application..."
    if ! npm start; then
        error "Failed to start application"
        exit 1
    fi
    success "✅ Application started"
    
    # Wait for application to be ready
    log "⏳ Waiting for application to be ready..."
    sleep 5
    
    # Health check
    log "🏥 Performing health check..."
    if curl -f http://localhost:3000/v1/health >/dev/null 2>&1; then
        success "✅ Health check passed"
    else
        error "❌ Health check failed"
        exit 1
    fi
    
    soulchain_log "Production deployment completed successfully at $(date)"
    success "🎉 Deployment completed successfully!"
}

# Run deployment
deploy "$@" 