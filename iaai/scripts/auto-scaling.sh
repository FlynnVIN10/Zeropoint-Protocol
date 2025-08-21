#!/bin/bash

# Auto-scaling Script for Zeropoint Protocol
# Phase 5 - Scalability Enhancements

set -e

# Configuration
SCALING_INTERVAL=30
POSTGRES_CPU_THRESHOLD=80
POSTGRES_MEMORY_THRESHOLD=80
REDIS_CPU_THRESHOLD=80
REDIS_MEMORY_THRESHOLD=80
MAX_POSTGRES_REPLICAS=3
MAX_REDIS_REPLICAS=3

# Logging
LOG_FILE="/var/log/auto-scaling.log"
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Get container resource usage
get_container_stats() {
    local container_name=$1
    docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemPerc}}" $container_name | tail -n 1
}

# Parse CPU percentage
parse_cpu() {
    echo $1 | sed 's/%//'
}

# Parse memory percentage
parse_memory() {
    echo $1 | sed 's/%//'
}

# Scale PostgreSQL
scale_postgres() {
    local current_replicas=$(docker ps --filter "name=postgres-replica" --format "{{.Names}}" | wc -l)
    local target_replicas=$1
    
    if [ $target_replicas -gt $MAX_POSTGRES_REPLICAS ]; then
        target_replicas=$MAX_POSTGRES_REPLICAS
    fi
    
    if [ $target_replicas -lt 1 ]; then
        target_replicas=1
    fi
    
    if [ $target_replicas -ne $current_replicas ]; then
        log "Scaling PostgreSQL from $current_replicas to $target_replicas replicas"
        
        # Scale using docker-compose
        cd /app
        docker-compose -f docker-compose.scalable.yml up -d --scale postgres-replica=$target_replicas
        
        log "PostgreSQL scaled to $target_replicas replicas"
    fi
}

# Scale Redis
scale_redis() {
    local current_replicas=$(docker ps --filter "name=redis-replica" --format "{{.Names}}" | wc -l)
    local target_replicas=$1
    
    if [ $target_replicas -gt $MAX_REDIS_REPLICAS ]; then
        target_replicas=$MAX_REDIS_REPLICAS
    fi
    
    if [ $target_replicas -lt 1 ]; then
        target_replicas=1
    fi
    
    if [ $target_replicas -ne $current_replicas ]; then
        log "Scaling Redis from $current_replicas to $target_replicas replicas"
        
        # Scale using docker-compose
        cd /app
        docker-compose -f docker-compose.scalable.yml up -d --scale redis-replica=$target_replicas
        
        log "Redis scaled to $target_replicas replicas"
    fi
}

# Main scaling logic
main() {
    log "Auto-scaling service started"
    
    while true; do
        # Check PostgreSQL scaling
        if docker ps --filter "name=postgres-primary" --format "{{.Names}}" | grep -q "postgres-primary"; then
            local postgres_stats=$(get_container_stats "postgres-primary")
            local postgres_cpu=$(parse_cpu $(echo $postgres_stats | awk '{print $1}'))
            local postgres_memory=$(parse_memory $(echo $postgres_stats | awk '{print $2}'))
            
            local postgres_replicas=1
            if [ $postgres_cpu -gt $POSTGRES_CPU_THRESHOLD ] || [ $postgres_memory -gt $POSTGRES_MEMORY_THRESHOLD ]; then
                postgres_replicas=2
            fi
            
            scale_postgres $postgres_replicas
        fi
        
        # Check Redis scaling
        if docker ps --filter "name=redis-primary" --format "{{.Names}}" | grep -q "redis-primary"; then
            local redis_stats=$(get_container_stats "redis-primary")
            local redis_cpu=$(parse_cpu $(echo $redis_stats | awk '{print $1}'))
            local redis_memory=$(parse_memory $(echo $redis_stats | awk '{print $2}'))
            
            local redis_replicas=1
            if [ $redis_cpu -gt $REDIS_CPU_THRESHOLD ] || [ $redis_memory -gt $REDIS_MEMORY_THRESHOLD ]; then
                redis_replicas=2
            fi
            
            scale_redis $redis_replicas
        fi
        
        # Wait before next check
        sleep $SCALING_INTERVAL
    done
}

# Handle signals
trap 'log "Auto-scaling service stopped"; exit 0' SIGTERM SIGINT

# Start the service
main
