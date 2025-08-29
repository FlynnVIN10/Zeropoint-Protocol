#!/bin/bash

# © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

# src/scripts/continuous-monitor.sh

# Zeropoint Protocol Local-Only Monitoring Script
# Monitors local endpoints only - NEVER touches production

set -euo pipefail

# Configuration
LOCAL_BASE_URL="http://localhost:3000"
EVIDENCE_DIR="evidence/v19/monitor"
LOG_FILE="$EVIDENCE_DIR/monitor.log"
HEALTH_CHECK_INTERVAL=30
MAX_RETRIES=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ensure evidence directory exists
mkdir -p "$EVIDENCE_DIR"

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR" "Script failed: $1"
    exit 1
}

# Check if any production URLs are being used
check_no_production_urls() {
    # Skip license headers and comments
    if grep -v "^#" "$0" | grep -v "©.*zeropointprotocol\.ai" | grep -q "zeropointprotocol\.ai\|cloudflare\.pages\|vercel\.app"; then
        error_exit "Production URLs detected in monitoring script - ABORTING"
    fi
    
    if [[ "$LOCAL_BASE_URL" != "http://localhost"* ]]; then
        error_exit "Base URL must be localhost - ABORTING"
    fi
}

# Health check function
check_endpoint() {
    local endpoint="$1"
    local expected_status="$2"
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if response=$(curl -s -w "%{http_code}" -o /tmp/response_body "$LOCAL_BASE_URL$endpoint" 2>/dev/null); then
            local status_code="${response: -3}"
            local body=$(cat /tmp/response_body)
            
            if [ "$status_code" = "$expected_status" ]; then
                # Validate JSON response
                if echo "$body" | jq . >/dev/null 2>&1; then
                    log "INFO" "✅ $endpoint: $status_code OK"
                    return 0
                else
                    log "WARN" "⚠️  $endpoint: $status_code OK but invalid JSON"
                    return 1
                fi
            else
                log "WARN" "⚠️  $endpoint: Expected $expected_status, got $status_code"
                retries=$((retries + 1))
                sleep 2
            fi
        else
            log "WARN" "⚠️  $endpoint: Connection failed (attempt $((retries + 1)))"
            retries=$((retries + 1))
            sleep 2
        fi
    done
    
    log "ERROR" "❌ $endpoint: Failed after $MAX_RETRIES attempts"
    return 1
}

# Header validation function
validate_headers() {
    local endpoint="$1"
    local required_headers=("content-type" "cache-control" "x-content-type-options")
    
    local headers_output
    if headers_output=$(curl -s -I "$LOCAL_BASE_URL$endpoint" 2>/dev/null); then
        local missing_headers=()
        
        for header in "${required_headers[@]}"; do
            if ! echo "$headers_output" | grep -qi "^$header:"; then
                missing_headers+=("$header")
            fi
        done
        
        if [ ${#missing_headers[@]} -eq 0 ]; then
            log "INFO" "✅ $endpoint: All required headers present"
            return 0
        else
            log "WARN" "⚠️  $endpoint: Missing headers: ${missing_headers[*]}"
            return 1
        fi
    else
        log "ERROR" "❌ $endpoint: Failed to retrieve headers"
        return 1
    fi
}

# Main monitoring function
monitor_endpoints() {
    local failed_checks=0
    local total_checks=0
    
    log "INFO" "Starting endpoint monitoring..."
    
    # Define endpoints to check
    declare -A endpoints=(
        ["/api/healthz"]="200"
        ["/api/readyz"]="200"
        ["/status/version.json"]="200"
        ["/api/training/status"]="200"
        ["/petals/status.json"]="200"
        ["/wondercraft/status.json"]="200"
    )
    
    for endpoint in "${!endpoints[@]}"; do
        total_checks=$((total_checks + 1))
        
        # Check endpoint health
        if check_endpoint "$endpoint" "${endpoints[$endpoint]}"; then
            # Validate headers
            if validate_headers "$endpoint"; then
                log "INFO" "✅ $endpoint: Full validation passed"
            else
                failed_checks=$((failed_checks + 1))
            fi
        else
            failed_checks=$((failed_checks + 1))
        fi
        
        # Small delay between checks
        sleep 1
    done
    
    # Generate summary
    local success_rate=$(( (total_checks - failed_checks) * 100 / total_checks ))
    log "INFO" "Monitoring complete: $success_rate% success rate ($((total_checks - failed_checks))/$total_checks endpoints healthy)"
    
    # Save detailed results
    save_monitoring_results "$success_rate" "$failed_checks" "$total_checks"
    
    # Exit with error if any checks failed
    if [ $failed_checks -gt 0 ]; then
        log "ERROR" "❌ Monitoring failed: $failed_checks endpoints unhealthy"
        return 1
    fi
    
    return 0
}

# Save monitoring results
save_monitoring_results() {
    local success_rate="$1"
    local failed_checks="$2"
    local total_checks="$3"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "$EVIDENCE_DIR/monitor-results.json" << EOF
{
  "timestamp": "$timestamp",
  "success_rate": $success_rate,
  "failed_checks": $failed_checks,
  "total_checks": $total_checks,
  "healthy": $((total_checks - failed_checks)),
  "unhealthy": $failed_checks,
  "base_url": "$LOCAL_BASE_URL",
  "environment": "local"
}
EOF
    
    log "INFO" "Results saved to $EVIDENCE_DIR/monitor-results.json"
}

# Main execution
main() {
    log "INFO" "=== Zeropoint Protocol Local Monitoring Started ==="
    log "INFO" "Base URL: $LOCAL_BASE_URL"
    log "INFO" "Evidence Directory: $EVIDENCE_DIR"
    log "INFO" "Check Interval: ${HEALTH_CHECK_INTERVAL}s"
    
    # Safety checks
    check_no_production_urls
    
    # Initial monitoring
    if monitor_endpoints; then
        log "INFO" "🎉 All endpoints healthy - monitoring PASSED"
        exit 0
    else
        log "ERROR" "💥 Endpoint monitoring FAILED"
        exit 1
    fi
}

# Trap errors
trap 'error_exit "Unexpected error occurred"' ERR

# Run main function
main "$@"


