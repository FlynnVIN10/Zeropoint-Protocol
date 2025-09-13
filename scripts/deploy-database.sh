#!/bin/bash

# Database Deployment Script
# CTO Directive: Backend Integration Finalization

echo "🗄️ Deploying database schemas..."

# Deploy Tinygrad schema
echo "Deploying Tinygrad schema..."
psql $TINYGRAD_DATABASE_URL -f lib/db/schemas/tinygrad.sql

# Deploy Petals schema
echo "Deploying Petals schema..."
psql $PETALS_DATABASE_URL -f lib/db/schemas/petals.sql

# Deploy Wondercraft schema
echo "Deploying Wondercraft schema..."
psql $WONDERCRAFT_DATABASE_URL -f lib/db/schemas/wondercraft.sql

# Deploy ML Pipeline schema
echo "Deploying ML Pipeline schema..."
psql $ML_PIPELINE_DATABASE_URL -f lib/db/schemas/ml_pipeline.sql

# Deploy Quantum schema
echo "Deploying Quantum schema..."
psql $QUANTUM_DATABASE_URL -f lib/db/schemas/quantum.sql

# Deploy Monitoring schema
echo "Deploying Monitoring schema..."
psql $DATABASE_URL -f lib/db/schemas/monitoring.sql

echo "✅ Database schemas deployed successfully"
