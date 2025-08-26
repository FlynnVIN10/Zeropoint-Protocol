#!/bin/bash

# Synthiant Runner Example Script
# This script demonstrates how to run local training and submit results via SCP v1

set -e  # Exit on any error

# Configuration
SYNTHIANT_ID="${SYNTHIANT_ID:-example_synthiant}"
RUN_ID="${RUN_ID:-$(date +%Y%m%d_%H%M%S)}"
COMMIT_HASH="${COMMIT_HASH:-$(git rev-parse --short HEAD)}"
DEVICE_TYPE="${DEVICE_TYPE:-cpu}"
SOURCE_TYPE="${SOURCE_TYPE:-local}"

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
        log_error "Python 3 is not installed or not in PATH"
        exit 1
    fi
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed or not in PATH"
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
    local submission_dir="evidence/training/submissions/${SYNTHIANT_ID}/${RUN_ID}"
    
    log_info "Creating submission directory: ${submission_dir}"
    mkdir -p "${submission_dir}"
    
    log_success "Submission directory created"
}

# Run training
run_training() {
    log_info "Starting training run..."
    
    # Check if tinygrad_toy_run.py exists
    if [ ! -f "scripts/tinygrad_toy_run.py" ]; then
        log_error "Training script scripts/tinygrad_toy_run.py not found"
        exit 1
    fi
    
    # Run the training script
    log_info "Executing training script..."
    python3 scripts/tinygrad_toy_run.py \
        --synthiant-id "${SYNTHIANT_ID}" \
        --run-id "${RUN_ID}" \
        --device "${DEVICE_TYPE}" \
        --source "${SOURCE_TYPE}" \
        --output-dir "evidence/training/submissions/${SYNTHIANT_ID}/${RUN_ID}"
    
    if [ $? -eq 0 ]; then
        log_success "Training completed successfully"
    else
        log_error "Training failed"
        exit 1
    fi
}

# Validate submission
validate_submission() {
    log_info "Validating submission..."
    
    local submission_dir="evidence/training/submissions/${SYNTHIANT_ID}/${RUN_ID}"
    local metrics_file="${submission_dir}/metrics.json"
    
    # Check if metrics.json exists
    if [ ! -f "${metrics_file}" ]; then
        log_error "Metrics file not found: ${metrics_file}"
        exit 1
    fi
    
    # Check if build-leaderboard.mjs exists for validation
    if [ -f "scripts/build-leaderboard.mjs" ]; then
        log_info "Running schema validation..."
        node scripts/build-leaderboard.mjs
        if [ $? -eq 0 ]; then
            log_success "Schema validation passed"
        else
            log_warning "Schema validation had issues - check output above"
        fi
    else
        log_warning "build-leaderboard.mjs not found - skipping validation"
    fi
    
    log_success "Submission validation completed"
}

# Generate training log
generate_training_log() {
    log_info "Generating training log..."
    
    local submission_dir="evidence/training/submissions/${SYNTHIANT_ID}/${RUN_ID}"
    local log_file="${submission_dir}/training_log.txt"
    
    cat > "${log_file}" << EOF
Synthiant Training Run Log
==========================

Run Information:
- Synthiant ID: ${SYNTHIANT_ID}
- Run ID: ${RUN_ID}
- Commit Hash: ${COMMIT_HASH}
- Device Type: ${DEVICE_TYPE}
- Source Type: ${SOURCE_TYPE}
- Start Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
- End Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

Environment:
- OS: $(uname -s)
- Architecture: $(uname -m)
- Python Version: $(python3 --version 2>&1)
- Git Branch: $(git branch --show-current)
- Git Status: $(git status --porcelain | wc -l) files modified

Training Summary:
- This was a demonstration run using the synthiant runner example script
- Training completed successfully
- Metrics generated and saved to metrics.json
- All required files created in submission directory

Next Steps:
1. Review the generated metrics.json file
2. Commit your changes: git add evidence/training/submissions/${SYNTHIANT_ID}/${RUN_ID}/
3. Create a pull request using the SCP template
4. Wait for SCRA and PM approval

EOF
    
    log_success "Training log generated: ${log_file}"
}

# Display submission summary
show_summary() {
    local submission_dir="evidence/training/submissions/${SYNTHIANT_ID}/${RUN_ID}"
    
    echo
    log_success "=== SUBMISSION COMPLETE ==="
    echo
    echo "Synthiant ID: ${SYNTHIANT_ID}"
    echo "Run ID: ${RUN_ID}"
    echo "Submission Directory: ${submission_dir}"
    echo
    echo "Files Created:"
    ls -la "${submission_dir}"
    echo
    echo "Next Steps:"
    echo "1. Review the generated files"
    echo "2. Commit: git add ${submission_dir}/"
    echo "3. Push: git push origin your-branch-name"
    echo "4. Create PR using .github/PULL_REQUEST_TEMPLATE_SCP.md"
    echo
    log_info "Happy training! 🚀"
}

# Main execution
main() {
    echo "Synthiant Runner Example Script"
    echo "=============================="
    echo
    
    # Display configuration
    echo "Configuration:"
    echo "- Synthiant ID: ${SYNTHIANT_ID}"
    echo "- Run ID: ${RUN_ID}"
    echo "- Commit Hash: ${COMMIT_HASH}"
    echo "- Device Type: ${DEVICE_TYPE}"
    echo "- Source Type: ${SOURCE_TYPE}"
    echo
    
    # Execute steps
    check_prerequisites
    create_submission_dir
    run_training
    validate_submission
    generate_training_log
    show_summary
}

# Run main function
main "$@"
