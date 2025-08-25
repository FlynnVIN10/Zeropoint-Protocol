#!/bin/bash

# 🚀 Synthiant Training Runner Example Script
# SCP v1 - Local Training Execution
# 
# This script demonstrates how to run local training and submit results
# to the Zeropoint Protocol platform using SCP v1.

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SUBMISSIONS_DIR="$PROJECT_ROOT/evidence/training/submissions"
SYNTHIANT_ID="${SYNTHIANT_ID:-synthiant_$(date +%s)}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
SUBMISSION_DIR="$SUBMISSIONS_DIR/$SYNTHIANT_ID/$TIMESTAMP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Python is available
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required but not installed"
        exit 1
    fi
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        log_error "Git is required but not installed"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create submission directory
create_submission_dir() {
    log_info "Creating submission directory: $SUBMISSION_DIR"
    
    mkdir -p "$SUBMISSION_DIR"
    
    if [ ! -d "$SUBMISSION_DIR" ]; then
        log_error "Failed to create submission directory"
        exit 1
    fi
    
    log_success "Submission directory created"
}

# Get current git commit
get_git_commit() {
    local commit=$(git rev-parse --short HEAD)
    if [ -z "$commit" ]; then
        log_error "Failed to get git commit hash"
        exit 1
    fi
    echo "$commit"
}

# Detect device/platform
detect_device() {
    local os=$(uname -s)
    local version=""
    
    case "$os" in
        "Darwin")
            version=$(sw_vers -productVersion 2>/dev/null || echo "unknown")
            echo "macOS-$version"
            ;;
        "Linux")
            version=$(cat /etc/os-release | grep VERSION_ID | cut -d'"' -f2 2>/dev/null || echo "unknown")
            echo "Linux-$version"
            ;;
        "MINGW"*|"MSYS"*|"CYGWIN"*)
            version=$(cmd.exe /c "ver" 2>/dev/null | tail -1 || echo "unknown")
            echo "Windows-$version"
            ;;
        *)
            echo "Unknown-$os"
            ;;
    esac
}

# Run training
run_training() {
    log_info "Starting training run..."
    
    local commit=$(get_git_commit)
    local device=$(detect_device)
    local start_time=$(date +%s)
    
    log_info "Git commit: $commit"
    log_info "Device: $device"
    log_info "Start time: $(date -u)"
    
    # Run the Python training script
    cd "$PROJECT_ROOT"
    python3 scripts/tinygrad_toy_run.py \
        --synthiant-id "$SYNTHIANT_ID" \
        --commit "$commit" \
        --device "$device" \
        --output-dir "$SUBMISSION_DIR"
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "Training completed in ${duration}s"
}

# Validate submission
validate_submission() {
    log_info "Validating submission..."
    
    local metrics_file="$SUBMISSION_DIR/metrics.json"
    
    if [ ! -f "$metrics_file" ]; then
        log_error "Metrics file not found: $metrics_file"
        exit 1
    fi
    
    # Basic JSON validation
    if ! python3 -m json.tool "$metrics_file" > /dev/null 2>&1; then
        log_error "Invalid JSON in metrics file"
        exit 1
    fi
    
    # Check required fields
    local required_fields=("synthiant_id" "run_id" "ts" "loss" "epoch" "step" "duration_s" "commit" "device" "source")
    
    for field in "${required_fields[@]}"; do
        if ! python3 -c "import json; data=json.load(open('$metrics_file')); print(data.get('$field', 'MISSING'))" | grep -q -v "MISSING"; then
            log_error "Missing required field: $field"
            exit 1
        fi
    done
    
    log_success "Submission validation passed"
}

# Update leaderboard
update_leaderboard() {
    log_info "Updating leaderboard..."
    
    cd "$PROJECT_ROOT"
    
    if [ -f "scripts/build-leaderboard.mjs" ]; then
        node scripts/build-leaderboard.mjs
        log_success "Leaderboard updated"
    else
        log_warning "Leaderboard builder not found, skipping update"
    fi
}

# Display submission summary
display_summary() {
    log_info "Submission Summary"
    echo "=================="
    echo "Synthiant ID: $SYNTHIANT_ID"
    echo "Timestamp: $TIMESTAMP"
    echo "Submission Dir: $SUBMISSION_DIR"
    echo "Metrics File: $SUBMISSION_DIR/metrics.json"
    echo ""
    
    if [ -f "$SUBMISSION_DIR/metrics.json" ]; then
        echo "Metrics Preview:"
        python3 -m json.tool "$SUBMISSION_DIR/metrics.json" | head -20
        echo "..."
    fi
    
    echo ""
    log_info "Next steps:"
    echo "1. Review the generated metrics.json file"
    echo "2. Create a pull request using the SCP template"
    echo "3. Request review from SCRA and PM"
    echo "4. Merge after approval to update the leaderboard"
}

# Main execution
main() {
    echo "🚀 Synthiant Training Runner - SCP v1"
    echo "====================================="
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Create submission directory
    create_submission_dir
    
    # Run training
    run_training
    
    # Validate submission
    validate_submission
    
    # Update leaderboard
    update_leaderboard
    
    # Display summary
    display_summary
    
    log_success "Training run completed successfully!"
    log_info "Ready for SCP v1 submission"
}

# Handle script arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --synthiant-id)
            SYNTHIANT_ID="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --synthiant-id ID    Set custom Synthiant ID (default: auto-generated)"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  SYNTHIANT_ID        Alternative way to set Synthiant ID"
            echo ""
            echo "Example:"
            echo "  $0 --synthiant-id my_ai_agent"
            echo "  SYNTHIANT_ID=custom_id $0"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"
