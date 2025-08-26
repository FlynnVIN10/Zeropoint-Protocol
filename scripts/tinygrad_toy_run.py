#!/usr/bin/env python3
"""
TinyGrad Toy Run Script
Produces training metrics that match the SCP v1 schema
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='TinyGrad Toy Training Run')
    parser.add_argument('--synthiant-id', required=True, help='Synthiant identifier')
    parser.add_argument('--run-id', required=True, help='Unique run identifier')
    parser.add_argument('--device', default='cpu', choices=['cpu', 'gpu', 'tpu', 'npu', 'hybrid'], help='Device type')
    parser.add_argument('--source', default='local', choices=['local', 'cloud', 'cluster', 'edge', 'hybrid'], help='Source type')
    parser.add_argument('--output-dir', required=True, help='Output directory for metrics and logs')
    parser.add_argument('--epochs', type=int, default=5, help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
    parser.add_argument('--learning-rate', type=float, default=0.001, help='Learning rate')
    
    return parser.parse_args()

def get_git_commit():
    """Get current git commit hash"""
    try:
        import subprocess
        result = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], 
                              capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "unknown"

def get_device_info():
    """Get device information"""
    device = os.environ.get('DEVICE', 'cpu')
    
    # Try to detect GPU
    try:
        import subprocess
        result = subprocess.run(['nvidia-smi', '--query-gpu=name', '--format=csv,noheader,nounits'], 
                              capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            return 'gpu'
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    return device

def simulate_training(epochs, batch_size, learning_rate):
    """Simulate a training run"""
    print(f"Starting training simulation...")
    print(f"Epochs: {epochs}, Batch Size: {batch_size}, Learning Rate: {learning_rate}")
    
    # Simulate training progress
    base_loss = 2.0
    for epoch in range(epochs):
        # Simulate epoch training
        time.sleep(0.5)  # Simulate computation time
        
        # Simulate decreasing loss
        epoch_loss = base_loss * (0.8 ** epoch) + (0.1 * (1 - epoch/epochs))
        
        print(f"Epoch {epoch + 1}/{epochs}: Loss = {epoch_loss:.6f}")
    
    final_loss = epoch_loss
    print(f"Training completed! Final loss: {final_loss:.6f}")
    
    return final_loss

def generate_metrics(args, final_loss):
    """Generate SCP v1 compliant metrics"""
    timestamp = datetime.utcnow().isoformat() + 'Z'
    commit_hash = get_git_commit()
    device_type = get_device_info()
    
    metrics = {
        "synthiant_id": args.synthiant_id,
        "run_id": args.run_id,
        "timestamp": timestamp,
        "loss": final_loss,
        "source": args.source,
        "commit": commit_hash,
        "device": device_type,
        "metadata": {
            "epochs": args.epochs,
            "batch_size": args.batch_size,
            "learning_rate": args.learning_rate,
            "script": "tinygrad_toy_run.py",
            "version": "1.0"
        },
        "hyperparameters": {
            "epochs": args.epochs,
            "batch_size": args.batch_size,
            "learning_rate": args.learning_rate,
            "optimizer": "sgd",
            "loss_function": "mse"
        }
    }
    
    return metrics

def save_metrics(metrics, output_dir):
    """Save metrics to file"""
    output_path = Path(output_dir) / "metrics.json"
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save metrics
    with open(output_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print(f"Metrics saved to: {output_path}")
    return output_path

def validate_metrics(metrics):
    """Basic validation of metrics against SCP schema"""
    required_fields = ['synthiant_id', 'run_id', 'timestamp', 'loss', 'source', 'commit', 'device']
    
    # Check required fields
    for field in required_fields:
        if field not in metrics:
            print(f"ERROR: Missing required field: {field}")
            return False
        if not metrics[field]:
            print(f"ERROR: Empty value for required field: {field}")
            return False
    
    # Check data types
    if not isinstance(metrics['loss'], (int, float)):
        print("ERROR: Loss must be a number")
        return False
    
    if metrics['loss'] < 0:
        print("ERROR: Loss must be non-negative")
        return False
    
    # Check enums
    valid_sources = ['local', 'cloud', 'cluster', 'edge', 'hybrid']
    if metrics['source'] not in valid_sources:
        print(f"ERROR: Invalid source: {metrics['source']}")
        return False
    
    valid_devices = ['cpu', 'gpu', 'tpu', 'npu', 'hybrid']
    if metrics['device'] not in valid_devices:
        print(f"ERROR: Invalid device: {metrics['device']}")
        return False
    
    # Check timestamp format
    try:
        datetime.fromisoformat(metrics['timestamp'].replace('Z', '+00:00'))
    except ValueError:
        print("ERROR: Invalid timestamp format")
        return False
    
    print("✓ Metrics validation passed")
    return True

def main():
    """Main execution function"""
    print("TinyGrad Toy Training Run")
    print("=========================")
    
    # Parse arguments
    args = parse_arguments()
    
    # Display configuration
    print(f"Configuration:")
    print(f"- Synthiant ID: {args.synthiant_id}")
    print(f"- Run ID: {args.run_id}")
    print(f"- Device: {args.device}")
    print(f"- Source: {args.source}")
    print(f"- Output Dir: {args.output_dir}")
    print(f"- Epochs: {args.epochs}")
    print(f"- Batch Size: {args.batch_size}")
    print(f"- Learning Rate: {args.learning_rate}")
    print()
    
    try:
        # Run training simulation
        final_loss = simulate_training(args.epochs, args.batch_size, args.learning_rate)
        
        # Generate metrics
        metrics = generate_metrics(args, final_loss)
        
        # Validate metrics
        if not validate_metrics(metrics):
            print("ERROR: Metrics validation failed")
            sys.exit(1)
        
        # Save metrics
        metrics_path = save_metrics(metrics, args.output_dir)
        
        # Display results
        print()
        print("Training Run Summary:")
        print("=====================")
        print(f"Final Loss: {final_loss:.6f}")
        print(f"Metrics File: {metrics_path}")
        print(f"Schema Validation: PASSED")
        print()
        print("✓ Training run completed successfully!")
        
    except Exception as e:
        print(f"ERROR: Training run failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
