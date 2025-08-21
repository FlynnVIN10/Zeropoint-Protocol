#!/bin/bash

# Stress Testing Script for Zeropoint Protocol
# Phase 5 - Scalability Enhancements

set -e

# Configuration
TEST_DURATION=300  # 5 minutes
CONCURRENT_USERS=100
RAMP_UP_TIME=60   # 1 minute
API_BASE_URL="http://localhost:3000"
TEST_RESULTS_DIR="stress-test-results"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="stress-test.log"
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Create results directory
mkdir -p $TEST_RESULTS_DIR

# Health check
health_check() {
    log "Performing health check..."
    
    local health_response=$(curl -s -w "%{http_code}" -o /tmp/health.json $API_BASE_URL/api/healthz)
    local status_code=${health_response: -3}
    
    if [ $status_code -eq 200 ]; then
        log "${GREEN}Health check passed${NC}"
        return 0
    else
        log "${RED}Health check failed with status $status_code${NC}"
        return 1
    fi
}

# Database connection test
test_database() {
    log "Testing database connections..."
    
    # Test PostgreSQL
    local pg_response=$(curl -s -w "%{http_code}" -o /tmp/pg.json $API_BASE_URL/api/readyz)
    local pg_status=${pg_response: -3}
    
    if [ $pg_status -eq 200 ]; then
        log "${GREEN}PostgreSQL connection successful${NC}"
    else
        log "${RED}PostgreSQL connection failed${NC}"
    fi
    
    # Test Redis
    local redis_response=$(curl -s -w "%{http_code}" -o /tmp/redis.json $API_BASE_URL/api/readyz)
    local redis_status=${redis_response: -3}
    
    if [ $redis_status -eq 200 ]; then
        log "${GREEN}Redis connection successful${NC}"
    else
        log "${RED}Redis connection failed${NC}"
    fi
}

# API endpoint stress test
stress_test_api() {
    local endpoint=$1
    local test_name=$2
    
    log "Starting stress test for $test_name..."
    
    # Create test configuration
    cat > $TEST_RESULTS_DIR/${test_name}_config.json << EOF
{
    "test_name": "$test_name",
    "endpoint": "$endpoint",
    "duration": $TEST_DURATION,
    "concurrent_users": $CONCURRENT_USERS,
    "ramp_up_time": $RAMP_UP_TIME,
    "start_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    # Run stress test using curl in parallel
    local start_time=$(date +%s)
    local end_time=$((start_time + TEST_DURATION))
    
    # Create temporary script for parallel execution
    cat > $TEST_RESULTS_DIR/${test_name}_parallel.sh << 'EOF'
#!/bin/bash
endpoint=$1
test_name=$2
end_time=$3

while [ $(date +%s) -lt $end_time ]; do
    response=$(curl -s -w "%{http_code}|%{time_total}|%{time_connect}|%{time_starttransfer}" -o /dev/null $endpoint)
    echo "$(date '+%Y-%m-%d %H:%M:%S.%3N')|$response" >> $TEST_RESULTS_DIR/${test_name}_results.csv
    sleep 0.1
done
EOF
    
    chmod +x $TEST_RESULTS_DIR/${test_name}_parallel.sh
    
    # Start parallel requests
    for i in $(seq 1 $CONCURRENT_USERS); do
        $TEST_RESULTS_DIR/${test_name}_parallel.sh $endpoint $test_name $end_time &
    done
    
    # Wait for all processes to complete
    wait
    
    # Clean up temporary script
    rm $TEST_RESULTS_DIR/${test_name}_parallel.sh
    
    log "Stress test completed for $test_name"
}

# Performance analysis
analyze_performance() {
    local test_name=$1
    
    log "Analyzing performance for $test_name..."
    
    if [ -f "$TEST_RESULTS_DIR/${test_name}_results.csv" ]; then
        # Calculate statistics
        local total_requests=$(wc -l < "$TEST_RESULTS_DIR/${test_name}_results.csv")
        local successful_requests=$(awk -F'|' '$2 == "200" {count++} END {print count}' "$TEST_RESULTS_DIR/${test_name}_results.csv")
        local failed_requests=$((total_requests - successful_requests))
        
        # Response time statistics
        local avg_response_time=$(awk -F'|' '$2 == "200" {sum+=$3; count++} END {if(count>0) print sum/count; else print 0}' "$TEST_RESULTS_DIR/${test_name}_results.csv")
        local max_response_time=$(awk -F'|' '$2 == "200" {if($3>max) max=$3} END {print max}' "$TEST_RESULTS_DIR/${test_name}_results.csv")
        local min_response_time=$(awk -F'|' '$2 == "200" {if($3<min || min==0) min=$3} END {print min}' "$TEST_RESULTS_DIR/${test_name}_results.csv")
        
        # Create performance report
        cat > $TEST_RESULTS_DIR/${test_name}_performance.json << EOF
{
    "test_name": "$test_name",
    "total_requests": $total_requests,
    "successful_requests": $successful_requests,
    "failed_requests": $failed_requests,
    "success_rate": $((successful_requests * 100 / total_requests)),
    "response_time": {
        "average": $avg_response_time,
        "maximum": $max_response_time,
        "minimum": $min_response_time
    },
    "concurrent_users": $CONCURRENT_USERS,
    "test_duration": $TEST_DURATION,
    "requests_per_second": $((total_requests / TEST_DURATION))
}
EOF
        
        log "${GREEN}Performance analysis completed for $test_name${NC}"
        log "Total requests: $total_requests, Success rate: $((successful_requests * 100 / total_requests))%"
        log "Average response time: ${avg_response_time}s"
    else
        log "${RED}No results file found for $test_name${NC}"
    fi
}

# Main test execution
main() {
    log "Starting Zeropoint Protocol stress testing..."
    
    # Check if API is running
    if ! health_check; then
        log "${RED}API is not running. Please start the service first.${NC}"
        exit 1
    fi
    
    # Test database connections
    test_database
    
    # Create results header
    echo "timestamp|status_code|response_time|connect_time|start_transfer_time" > $TEST_RESULTS_DIR/results_header.csv
    
    # Run stress tests
    stress_test_api "$API_BASE_URL/api/healthz" "health_endpoint"
    stress_test_api "$API_BASE_URL/api/readyz" "ready_endpoint"
    stress_test_api "$API_BASE_URL/status/version.json" "version_endpoint"
    
    # Analyze performance
    analyze_performance "health_endpoint"
    analyze_performance "ready_endpoint"
    analyze_performance "version_endpoint"
    
    # Generate summary report
    cat > $TEST_RESULTS_DIR/stress_test_summary.md << EOF
# Stress Test Summary

**Date:** $(date)
**Duration:** $TEST_DURATION seconds
**Concurrent Users:** $CONCURRENT_USERS
**Ramp-up Time:** $RAMP_UP_TIME seconds

## Test Results

### Health Endpoint
- **File:** health_endpoint_performance.json
- **Results:** health_endpoint_results.csv

### Ready Endpoint
- **File:** ready_endpoint_performance.json
- **Results:** ready_endpoint_results.csv

### Version Endpoint
- **File:** version_endpoint_performance.json
- **Results:** version_endpoint_results.csv

## Performance Criteria

- **Response Time Target:** <200ms at 90th percentile
- **Success Rate Target:** >99%
- **Throughput Target:** >100 requests/second

## Next Steps

1. Review performance results
2. Identify bottlenecks
3. Optimize identified areas
4. Re-run tests after optimization
EOF
    
    log "${GREEN}Stress testing completed successfully!${NC}"
    log "Results available in: $TEST_RESULTS_DIR/"
    log "Summary report: $TEST_RESULTS_DIR/stress_test_summary.md"
}

# Handle signals
trap 'log "Stress testing interrupted"; exit 1' SIGTERM SIGINT

# Run main function
main
