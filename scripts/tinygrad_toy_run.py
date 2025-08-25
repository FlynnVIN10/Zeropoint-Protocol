#!/usr/bin/env python3
"""
TinyGrad Toy Run Script for SCP v1
Produces training metrics matching the SCP v1 schema
"""

import argparse
import json
import time
import random
import os
from datetime import datetime
from pathlib import Path

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='TinyGrad Toy Run for SCP v1')
    parser.add_argument('--synthiant-id', required=True, help='Synthiant ID for submission')
    parser.add_argument('--device', required=True, help='Device/platform identifier')
    parser.add_argument('--commit', required=True, help='Git commit hash')
    parser.add_argument('--output-dir', required=True, help='Output directory for metrics')
    parser.add_argument('--epochs', type=int, default=3, help='Number of training epochs')
    parser.add_argument('--steps-per-epoch', type=int, default=100, help='Steps per epoch')
    parser.add_argument('--learning-rate', type=float, default=0.01, help='Learning rate')
    parser.add_argument('--seed', type=int, default=42, help='Random seed for reproducibility')
    
    return parser.parse_args()

def simulate_training(epochs, steps_per_epoch, learning_rate, seed):
    """Simulate a TinyGrad training run"""
    random.seed(seed)
    
    # Simulate training progress
    base_loss = 2.0
    best_loss = base_loss
    
    training_log = []
    
    for epoch in range(epochs):
        for step in range(steps_per_epoch):
            # Simulate loss reduction with some noise
            progress = (epoch * steps_per_epoch + step) / (epochs * steps_per_epoch)
            noise = random.uniform(-0.1, 0.1)
            current_loss = base_loss * (1 - progress * 0.8) + noise
            
            if current_loss < best_loss:
                best_loss = current_loss
            
            training_log.append({
                'epoch': epoch + 1,
                'step': step + 1,
                'loss': max(0.0, current_loss),
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            })
    
    return training_log, best_loss

def generate_metrics(args, training_log, final_loss, duration):
    """Generate SCP v1 compliant metrics"""
    start_time = datetime.utcnow().isoformat() + 'Z'
    
    metrics = {
        "synthiant_id": args.synthiant_id,
        "run_id": start_time,
        "epoch": args.epochs,
        "step": args.steps_per_epoch,
        "loss": round(final_loss, 4),
        "duration_s": round(duration, 1),
        "commit": args.commit,
        "ts": start_time,
        "source": "tinygrad",
        "device": args.device,
        "notes": f"Simulated TinyGrad training run with {args.epochs} epochs, {args.steps_per_epoch} steps/epoch, lr={args.learning_rate}"
    }
    
    return metrics

def save_metrics(metrics, output_dir):
    """Save metrics to the specified output directory"""
    output_path = Path(output_dir) / "metrics.json"
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save metrics with pretty formatting
    with open(output_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print(f"✅ Metrics saved to: {output_path}")
    return output_path

def validate_metrics(metrics):
    """Validate metrics against SCP v1 schema requirements"""
    required_fields = [
        "synthiant_id", "run_id", "epoch", "step", "loss", 
        "duration_s", "commit", "ts", "source"
    ]
    
    # Check required fields
    missing_fields = [field for field in required_fields if field not in metrics]
    if missing_fields:
        raise ValueError(f"Missing required fields: {missing_fields}")
    
    # Check data types
    if not isinstance(metrics["synthiant_id"], str):
        raise ValueError("synthiant_id must be a string")
    
    if not isinstance(metrics["epoch"], int) or metrics["epoch"] < 1:
        raise ValueError("epoch must be a positive integer")
    
    if not isinstance(metrics["step"], int) or metrics["step"] < 1:
        raise ValueError("step must be a positive integer")
    
    if not isinstance(metrics["loss"], (int, float)) or metrics["loss"] < 0:
        raise ValueError("loss must be a non-negative number")
    
    if not isinstance(metrics["duration_s"], (int, float)) or metrics["duration_s"] < 0:
        raise ValueError("duration_s must be a non-negative number")
    
    # Check source values
    valid_sources = ["tinygrad", "pytorch", "tensorflow", "jax", "other"]
    if metrics["source"] not in valid_sources:
        raise ValueError(f"source must be one of: {valid_sources}")
    
    print("✅ Metrics validation passed")
    return True

def main():
    """Main execution function"""
    print("🚀 TinyGrad Toy Run - SCP v1")
    print("==============================")
    
    # Parse arguments
    args = parse_arguments()
    
    print(f"Synthiant ID: {args.synthiant_id}")
    print(f"Device: {args.device}")
    print(f"Commit: {args.commit}")
    print(f"Output Directory: {args.output_dir}")
    print(f"Training Configuration: {args.epochs} epochs, {args.steps_per_epoch} steps/epoch")
    print()
    
    # Record start time
    start_time = time.time()
    
    # Simulate training
    print("🔄 Simulating TinyGrad training...")
    training_log, final_loss = simulate_training(
        args.epochs, 
        args.steps_per_epoch, 
        args.learning_rate, 
        args.seed
    )
    
    # Calculate duration
    duration = time.time() - start_time
    
    print(f"✅ Training completed in {duration:.1f} seconds")
    print(f"📊 Final loss: {final_loss:.4f}")
    print()
    
    # Generate metrics
    print("📝 Generating SCP v1 metrics...")
    metrics = generate_metrics(args, training_log, final_loss, duration)
    
    # Validate metrics
    print("🔍 Validating metrics...")
    validate_metrics(metrics)
    
    # Save metrics
    print("💾 Saving metrics...")
    output_path = save_metrics(metrics, args.output_dir)
    
    # Display summary
    print()
    print("==========================================")
    print("           TRAINING SUMMARY")
    print("==========================================")
    print(f"Synthiant ID: {metrics['synthiant_id']}")
    print(f"Run ID: {metrics['run_id']}")
    print(f"Final Loss: {metrics['loss']}")
    print(f"Duration: {metrics['duration_s']} seconds")
    print(f"Epochs: {metrics['epoch']}")
    print(f"Steps: {metrics['step']}")
    print(f"Device: {metrics['device']}")
    print(f"Source: {metrics['source']}")
    print(f"Commit: {metrics['commit']}")
    print("==========================================")
    print()
    print("🎉 Ready for SCP v1 submission!")
    print(f"📁 Metrics file: {output_path}")
    print()
    print("Next steps:")
    print("1. Review the generated metrics.json file")
    print("2. Use the synthiant_runner_example.sh script")
    print("3. Submit via pull request using SCP template")
    print("4. Request review from SCRA and PM")

if __name__ == "__main__":
    main()
