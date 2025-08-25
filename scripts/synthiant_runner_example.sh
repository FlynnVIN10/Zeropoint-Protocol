#!/bin/bash

# Synthiant Runner Example Script for SCP v1
# This script automates local training runs and prepares metrics for submission

set -e

# Configuration
SYNTHIANT_ID="${SYNTHIANT_ID:-synthiant_$(date +%s)}"
TRAINING_SCRIPT="scripts/tinygrad_toy_run.py"
OUTPUT_DIR="evidence/training/submissions/${SYNTHIANT_ID}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")

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
    
    # Check if training script exists
    if [ ! -f "$TRAINING_SCRIPT" ]; then
        log_error "Training script not found: $TRAINING_SCRIPT"
        exit 1
    fi
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        log_warning "Git not found - commit hash will be 'unknown'"
    fi
    
    log_success "Prerequisites check passed"
}

# Detect device/platform
detect_device() {
    log_info "Detecting device/platform..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        DEVICE="macOS-$(sw_vers -productVersion)"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v nvidia-smi &> /dev/null; then
            DEVICE="Linux-CUDA"
        else
            DEVICE="Linux-CPU"
        fi
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        DEVICE="Windows-$(uname -r)"
    else
        DEVICE="Unknown-$(uname -s)"
    fi
    
    log_info "Detected device: $DEVICE"
}

# Create submission directory
create_submission_dir() {
    log_info "Creating submission directory..."
    
    mkdir -p "${OUTPUT_DIR}/${TIMESTAMP}"
    log_success "Created directory: ${OUTPUT_DIR}/${TIMESTAMP}"
}

# Run training
run_training() {
    log_info "Starting training run..."
    
    # Get current commit hash
    COMMIT="unknown"
    if command -v git &> /dev/null; then
        COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    fi
    
    # Run training with detected device
    log_info "Running training script with device: $DEVICE, commit: $COMMIT"
    
    python3 "$TRAINING_SCRIPT" \
        --synthiant-id "$SYNTHIANT_ID" \
        --device "$DEVICE" \
        --commit "$COMMIT" \
        --output-dir "${OUTPUT_DIR}/${TIMESTAMP}"
    
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
    
    METRICS_FILE="${OUTPUT_DIR}/${TIMESTAMP}/metrics.json"
    
    if [ ! -f "$METRICS_FILE" ]; then
        log_error "Metrics file not found: $METRICS_FILE"
        exit 1
    fi
    
    # Basic JSON validation
    if ! python3 -m json.tool "$METRICS_FILE" > /dev/null 2>&1; then
        log_error "Invalid JSON in metrics file"
        exit 1
    fi
    
    # Check required fields
    REQUIRED_FIELDS=("synthiant_id" "run_id" "epoch" "step" "loss" "duration_s" "commit" "ts" "source")
    
    for field in "${REQUIRED_FIELDS[@]}"; do
        if ! python3 -c "import json; data=json.load(open('$METRICS_FILE')); print('OK' if '$field' in data else 'MISSING')" | grep -q "OK"; then
            log_error "Required field missing: $field"
            exit 1
        fi
    done
    
    log_success "Submission validation passed"
}

# Generate submission summary
generate_summary() {
    log_info "Generating submission summary..."
    
    METRICS_FILE="${OUTPUT_DIR}/${TIMESTAMP}/metrics.json"
    
    echo ""
    echo "=========================================="
    echo "           SUBMISSION SUMMARY"
    echo "=========================================="
    echo "Synthiant ID: $SYNTHIANT_ID"
    echo "Timestamp: $TIMESTAMP"
    echo "Output Directory: ${OUTPUT_DIR}/${TIMESTAMP}"
    echo "Metrics File: $METRICS_FILE"
    echo ""
    echo "Next Steps:"
    echo "1. Review the generated metrics.json file"
    echo "2. Create a pull request using the SCP template"
    echo "3. Submit for review by SCRA and PM"
    echo ""
    echo "Files created:"
    ls -la "${OUTPUT_DIR}/${TIMESTAMP}/"
    echo "=========================================="
}

# Main execution
main() {
    echo "🚀 Synthiant Runner Example - SCP v1"
    echo "====================================="
    echo ""
    
    check_prerequisites
    detect_device
    create_submission_dir
    run_training
    validate_submission
    generate_summary
    
    log_success "Synthiant runner completed successfully!"
    log_info "Ready for SCP v1 submission"
}

# Run main function
main "$@"
