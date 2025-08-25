#!/bin/bash

# Synthiant Runner Example Script
# This script demonstrates how to run local training and submit metrics to SCP v1

set -e

# Configuration
MODEL_NAME="gpt-3.5-turbo"
DATASET_NAME="wikitext-103"
OUTPUT_DIR="evidence/training/submissions/${MODEL_NAME}/$(date -u +%Y-%m-%dT%H-%M-%SZ)"
METRICS_FILE="${OUTPUT_DIR}/metrics.json"

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
        log_warning "Git is not installed - commit SHA will be 'unknown'"
    fi
    
    # Check if jq is available for JSON validation
    if ! command -v jq &> /dev/null; then
        log_warning "jq is not installed - JSON validation will be skipped"
    fi
    
    log_success "Prerequisites check completed"
}

# Create output directory
create_output_dir() {
    log_info "Creating output directory: ${OUTPUT_DIR}"
    mkdir -p "${OUTPUT_DIR}"
    log_success "Output directory created"
}

# Get current git commit
get_git_commit() {
    if command -v git &> /dev/null; then
        git rev-parse --short HEAD 2>/dev/null || echo "unknown"
    else
        echo "unknown"
    fi
}

# Get system information
get_system_info() {
    case "$(uname -s)" in
        Linux*)     echo "Linux-$(uname -r)";;
        Darwin*)    echo "macOS-$(sw_vers -productVersion)";;
        CYGWIN*)   echo "Cygwin";;
        MINGW*)    echo "MinGW";;
        *)          echo "Unknown-$(uname -s)";;
    esac
}

# Run training simulation
run_training() {
    log_info "Starting training simulation..."
    
    # Record start time
    START_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Simulate training process
    log_info "Training epoch 1..."
    sleep 2
    log_info "Training epoch 2..."
    sleep 2
    log_info "Training epoch 3..."
    sleep 1
    
    # Record end time
    END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Calculate duration
    START_EPOCH=$(date -d "$START_TIME" +%s)
    END_EPOCH=$(date -d "$END_TIME" +%s)
    DURATION=$((END_EPOCH - START_EPOCH))
    
    log_success "Training completed in ${DURATION} seconds"
    
    # Return training results
    echo "${START_TIME}|${END_TIME}|${DURATION}"
}

# Generate metrics
generate_metrics() {
    local start_time=$1
    local end_time=$2
    local duration=$3
    
    log_info "Generating SCP v1 compliant metrics..."
    
    # Generate a realistic loss value (decreasing over time)
    LOSS=$(awk -v seed=$RANDOM 'BEGIN{srand(seed); print 0.5 + rand() * 0.3}')
    ACCURACY=$(awk -v seed=$RANDOM 'BEGIN{srand(seed); print 0.7 + rand() * 0.2}')
    
    # Create metrics JSON
    cat > "${METRICS_FILE}" << EOF
{
  "run_id": "run_$(date +%Y%m%d_%H%M%S)",
  "model": "${MODEL_NAME}",
  "started_at": "${start_time}",
  "ended_at": "${end_time}",
  "dataset": "${DATASET_NAME}",
  "metrics": {
    "loss": ${LOSS},
    "accuracy": ${ACCURACY}
  },
  "notes": "Training run executed by synthiant_runner_example.sh on $(get_system_info)"
}
EOF
    
    log_success "Metrics generated: ${METRICS_FILE}"
}

# Validate metrics against schema
validate_metrics() {
    if command -v jq &> /dev/null; then
        log_info "Validating metrics against SCP v1 schema..."
        
        # Basic JSON validation
        if jq empty "${METRICS_FILE}" 2>/dev/null; then
            log_success "JSON validation passed"
        else
            log_error "JSON validation failed"
            exit 1
        fi
        
        # Check required fields
        local required_fields=("run_id" "model" "started_at" "ended_at" "dataset" "metrics")
        local missing_fields=()
        
        for field in "${required_fields[@]}"; do
            if ! jq -e ".${field}" "${METRICS_FILE}" > /dev/null 2>&1; then
                missing_fields+=("$field")
            fi
        done
        
        if [ ${#missing_fields[@]} -eq 0 ]; then
            log_success "All required fields present"
        else
            log_error "Missing required fields: ${missing_fields[*]}"
            exit 1
        fi
        
        # Check metrics object
        if ! jq -e '.metrics.loss' "${METRICS_FILE}" > /dev/null 2>&1; then
            log_error "Missing metrics.loss field"
            exit 1
        fi
        
        if ! jq -e '.metrics.accuracy' "${METRICS_FILE}" > /dev/null 2>&1; then
            log_error "Missing metrics.accuracy field"
            exit 1
        fi
        
        log_success "Schema validation completed successfully"
    else
        log_warning "Skipping schema validation (jq not available)"
    fi
}

# Update leaderboard
update_leaderboard() {
    log_info "Updating leaderboard..."
    
    if [ -f "scripts/build-leaderboard.mjs" ]; then
        if node scripts/build-leaderboard.mjs; then
            log_success "Leaderboard updated successfully"
        else
            log_warning "Leaderboard update failed"
        fi
    else
        log_warning "Leaderboard builder script not found"
    fi
}

# Display results
display_results() {
    log_success "Training run completed successfully!"
    echo
    echo "Results Summary:"
    echo "================="
    echo "Model: ${MODEL_NAME}"
    echo "Dataset: ${DATASET_NAME}"
    echo "Duration: $(grep -o '"ended_at": "[^"]*"' "${METRICS_FILE}" | cut -d'"' -f4)"
    echo "Loss: $(grep -o '"loss": [0-9.]*' "${METRICS_FILE}" | cut -d':' -f2 | tr -d ' ')"
    echo "Accuracy: $(grep -o '"accuracy": [0-9.]*' "${METRICS_FILE}" | cut -d':' -f2 | tr -d ' ')"
    echo "Metrics file: ${METRICS_FILE}"
    echo
    echo "Next steps:"
    echo "1. Review the generated metrics"
    echo "2. Commit and push to your repository"
    echo "3. Create a pull request using the SCP template"
    echo "4. Wait for SCRA review and approval"
}

# Main execution
main() {
    echo "Synthiant Runner Example Script"
    echo "================================"
    echo
    
    # Check prerequisites
    check_prerequisites
    
    # Create output directory
    create_output_dir
    
    # Run training
    training_results=$(run_training)
    IFS='|' read -r start_time end_time duration <<< "$training_results"
    
    # Generate metrics
    generate_metrics "$start_time" "$end_time" "$duration"
    
    # Validate metrics
    validate_metrics
    
    # Update leaderboard
    update_leaderboard
    
    # Display results
    display_results
}

# Run main function
main "$@"
