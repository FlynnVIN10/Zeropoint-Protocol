#!/bin/bash

# Backend Service Deployment Script
# CTO Directive: Backend Integration Finalization

echo "🔌 Deploying backend services..."

# Deploy Tinygrad service
echo "Deploying Tinygrad service..."
kubectl apply -f k8s/tinygrad-service.yaml

# Deploy Petals service
echo "Deploying Petals service..."
kubectl apply -f k8s/petals-service.yaml

# Deploy Wondercraft service
echo "Deploying Wondercraft service..."
kubectl apply -f k8s/wondercraft-service.yaml

# Deploy ML Pipeline service
echo "Deploying ML Pipeline service..."
kubectl apply -f k8s/ml-pipeline-service.yaml

# Deploy Quantum service
echo "Deploying Quantum service..."
kubectl apply -f k8s/quantum-service.yaml

echo "✅ Backend services deployed successfully"
