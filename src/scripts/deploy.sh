#!/bin/bash

# Zeropoint Protocol Deployment Script
# Phase 5: Production Deployment Configuration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to log errors
error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Function to log success
success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to log warnings
warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check intent (placeholder for zeroth-gate integration)
check_intent() {
    log "Checking deployment intent..."
    
    # Check if this is a dry run
    if [[ "$1" == "--dry-run" ]]; then
        log "DRY RUN MODE: Simulating deployment without actual execution"
        return 0
    fi
    
    # Check environment variables
    if [[ -z "$NODE_ENV" ]]; then
        warning "NODE_ENV not set, defaulting to production"
        export NODE_ENV=production
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        error "package.json not found. Please run from project root."
        exit 1
    fi
    
    # Check if git is clean (optional)
    if [[ -n "$(git status --porcelain)" ]]; then
        warning "Git working directory is not clean"
    fi
    
    success "Intent check passed"
}

# Function to install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    if [[ "$1" == "--dry-run" ]]; then
        log "DRY RUN: Would run 'npm install'"
        return 0
    fi
    
    npm install
    success "Dependencies installed successfully"
}

# Function to build the application
build_application() {
    log "Building application..."
    
    if [[ "$1" == "--dry-run" ]]; then
        log "DRY RUN: Would run 'npm run build'"
        return 0
    fi
    
    npm run build
    success "Application built successfully"
}

# Function to start the application
start_application() {
    log "Starting application..."
    
    if [[ "$1" == "--dry-run" ]]; then
        log "DRY RUN: Would run 'npm start'"
        return 0
    fi
    
    # Start the application in the background
    npm start &
    APP_PID=$!
    
    # Wait a moment for the app to start
    sleep 5
    
    # Check if the app is running
    if kill -0 $APP_PID 2>/dev/null; then
        success "Application started successfully (PID: $APP_PID)"
    else
        error "Failed to start application"
        exit 1
    fi
}

# Function to log to soulchain
soulchain_log() {
    local message="$1"
    log "Logging to soulchain: $message"
    
    if [[ "$1" == "--dry-run" ]]; then
        log "DRY RUN: Would log to soulchain: $message"
        return 0
    fi
    
    # Use curl to log to soulchain endpoint
    curl -s -X POST http://localhost:3000/v1/soulchain/persist \
        -H "Content-Type: application/json" \
        -d "{
            \"action\": \"deployment\",
            \"metadata\": {
                \"timestamp\": \"$(date -u +'%Y-%m-%dT%H:%M:%S.000Z')\",
                \"environment\": \"$NODE_ENV\",
                \"user\": \"$(whoami)\",
                \"hostname\": \"$(hostname)\"
            },
            \"data\": \"$message\"
        }" > /dev/null 2>&1 || warning "Failed to log to soulchain (endpoint may not be available)"
}

# Function to verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    if [[ "$1" == "--dry-run" ]]; then
        log "DRY RUN: Would verify deployment with curl"
        return 0
    fi
    
    # Wait for the application to be ready
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:3000/v1/health > /dev/null 2>&1; then
            success "Deployment verified successfully"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts: Application not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    error "Deployment verification failed after $max_attempts attempts"
    exit 1
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Simulate deployment without actual execution"
    echo "  --help       Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  NODE_ENV     Environment (default: production)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Full deployment"
    echo "  $0 --dry-run          # Simulate deployment"
}

# Main deployment function
main() {
    local dry_run=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                dry_run=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    log "Starting Zeropoint Protocol deployment..."
    
    # Run deployment steps
    check_intent $([[ "$dry_run" == true ]] && echo "--dry-run")
    install_dependencies $([[ "$dry_run" == true ]] && echo "--dry-run")
    build_application $([[ "$dry_run" == true ]] && echo "--dry-run")
    start_application $([[ "$dry_run" == true ]] && echo "--dry-run")
    verify_deployment $([[ "$dry_run" == true ]] && echo "--dry-run")
    
    # Log successful deployment
    soulchain_log $([[ "$dry_run" == true ]] && echo "--dry-run" || echo "Deployment executed at $(date)")
    
    success "Deployment completed successfully!"
}

# Run main function with all arguments
main "$@" 