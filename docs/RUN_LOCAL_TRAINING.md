# Running Local Training - SCP v1 Guide

This guide explains how to run local training and submit metrics to the Synthiant Contribution Protocol (SCP) v1.

## Prerequisites

Before running local training, ensure you have:

- **Python 3.8+** installed
- **Git** installed (for commit tracking)
- **Node.js** installed (for schema validation)
- Access to the Zeropoint Protocol repository

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/FlynnVIN10/Zeropoint-Protocol.git
cd Zeropoint-Protocol
```

### 2. Run the Example Training Script

```bash
# Run with required parameters
python3 scripts/tinygrad_toy_run.py \
  --synthiant-id "your_id" \
  --run-id "unique_run_$(date +%Y%m%d_%H%M%S)" \
  --output-dir "evidence/training/submissions/your_id/$(date +%Y%m%d_%H%M%S)"

# Run with custom parameters
python3 scripts/tinygrad_toy_run.py \
  --synthiant-id "your_id" \
  --run-id "custom_run_001" \
  --epochs 10 \
  --batch-size 64 \
  --learning-rate 0.0001 \
  --device gpu \
  --source local \
  --output-dir "evidence/training/submissions/your_id/custom_run_001"
```

### 3. Use the Synthiant Runner Script

```bash
# Make the script executable
chmod +x scripts/synthiant_runner_example.sh

# Set environment variables (optional)
export SYNTHIANT_ID="your_id"
export RUN_ID="$(date +%Y%m%d_%H%M%S)"
export DEVICE_TYPE="gpu"
export SOURCE_TYPE="local"

# Run the script
./scripts/synthiant_runner_example.sh
```

## Training Scripts

### TinyGrad Toy Run (`scripts/tinygrad_toy_run.py`)

A Python script that simulates TinyGrad training and generates SCP v1 compliant metrics.

**Features:**
- Configurable training parameters (epochs, batch size, learning rate)
- Realistic loss simulation with decreasing trend
- Automatic metrics generation matching SCP v1 schema
- Built-in validation against schema requirements
- Custom output directory support
- Device and source type detection

**Usage:**
```bash
python3 scripts/tinygrad_toy_run.py [OPTIONS]

Required Options:
  --synthiant-id ID    Your unique Synthiant identifier
  --run-id ID          Unique identifier for this training run
  --output-dir DIR     Output directory for metrics and logs

Optional Options:
  --epochs N           Number of training epochs (default: 5)
  --batch-size N       Batch size (default: 32)
  --learning-rate F    Learning rate (default: 0.001)
  --device TYPE        Device type: cpu, gpu, tpu, npu, hybrid (default: cpu)
  --source TYPE        Source type: local, cloud, cluster, edge, hybrid (default: local)
  --help              Show help message
```

**Example Output:**
```
TinyGrad Toy Training Run
=========================
Configuration:
- Synthiant ID: example_synthiant
- Run ID: 20250825_165500
- Device: cpu
- Source: local
- Output Dir: evidence/training/submissions/example_synthiant/20250825_165500
- Epochs: 5
- Batch Size: 32
- Learning Rate: 0.001

Starting training simulation...
Epochs: 5, Batch Size: 32, Learning Rate: 0.001
Epoch 1/5: Loss = 1.600000
Epoch 2/5: Loss = 1.280000
Epoch 3/5: Loss = 1.024000
Epoch 4/5: Loss = 0.819200
Epoch 5/5: Loss = 0.655360
Training completed! Final loss: 0.655360
✓ Metrics validation passed
Metrics saved to: evidence/training/submissions/example_synthiant/20250825_165500/metrics.json

Training Run Summary:
=====================
Final Loss: 0.655360
Metrics File: evidence/training/submissions/example_synthiant/20250825_165500/metrics.json
Schema Validation: PASSED

✓ Training run completed successfully!
```

### Synthiant Runner Script (`scripts/synthiant_runner_example.sh`)

A bash script that automates the entire training and submission process.

**Features:**
- Automatic prerequisite checking (Python, Git, Node.js)
- Training execution via Python script
- Metrics generation and validation
- Schema validation using build-leaderboard.mjs
- Training log generation
- Comprehensive error handling and logging

**Usage:**
```bash
# Basic usage
./scripts/synthiant_runner_example.sh

# With custom environment variables
export SYNTHIANT_ID="your_id"
export RUN_ID="custom_run_001"
export DEVICE_TYPE="gpu"
export SOURCE_TYPE="local"
./scripts/synthiant_runner_example.sh
```

**Example Output:**
```
Synthiant Runner Example Script
================================

[INFO] Checking prerequisites...
[SUCCESS] Prerequisites check completed
[INFO] Creating output directory: evidence/training/submissions/gpt-3.5-turbo/2025-08-25T16-30-00Z
[SUCCESS] Output directory created
[INFO] Starting training simulation...
[INFO] Training epoch 1...
[INFO] Training epoch 2...
[INFO] Training epoch 3...
[SUCCESS] Training completed in 5 seconds
[INFO] Generating SCP v1 compliant metrics...
[SUCCESS] Metrics generated: evidence/training/submissions/gpt-3.5-turbo/2025-08-25T16-30-00Z/metrics.json
[INFO] Validating metrics against SCP v1 schema...
[SUCCESS] Schema validation completed successfully
[INFO] Updating leaderboard...
[SUCCESS] Leaderboard updated successfully
[SUCCESS] Training run completed successfully!

Results Summary:
=================
Model: gpt-3.5-turbo
Dataset: wikitext-103
Duration: 2025-08-25T16:30:05Z
Loss: 0.234
Accuracy: 0.876
Metrics file: evidence/training/submissions/gpt-3.5-turbo/2025-08-25T16-30-00Z/metrics.json
```

## Custom Training Implementation

### 1. Create Your Training Script

Create a Python script that follows this structure:

```python
#!/usr/bin/env python3

import json
import time
from datetime import datetime, timezone
from pathlib import Path

def run_training():
    """Your training logic here"""
    # Implement your actual training code
    # Record start and end times
    # Calculate loss and accuracy
    pass

def generate_metrics(start_time, end_time, loss, accuracy, output_dir):
    """Generate SCP v1 compliant metrics"""
    metrics = {
        "run_id": f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "model": "your-model-name",
        "started_at": start_time,
        "ended_at": end_time,
        "dataset": "your-dataset",
        "metrics": {
            "loss": loss,
            "accuracy": accuracy
        },
        "notes": "Your training description"
    }
    
    # Save metrics
    metrics_file = output_dir / "metrics.json"
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    return metrics

def main():
    # Run training
    start_time = datetime.now(timezone.utc).isoformat()
    
    # Your training code here
    loss, accuracy = run_training()
    
    end_time = datetime.now(timezone.utc).isoformat()
    
    # Generate and save metrics
    output_dir = Path("evidence/training/submissions/your-model")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    metrics = generate_metrics(start_time, end_time, loss, accuracy, output_dir)
    print(f"Metrics saved to: {output_dir}/metrics.json")

if __name__ == "__main__":
    main()
```

### 2. Follow SCP v1 Schema

Ensure your metrics conform to the SCP v1 schema:

```json
{
  "run_id": "unique_run_identifier",
  "model": "model_architecture_name",
  "started_at": "2025-08-25T16:30:00Z",
  "ended_at": "2025-08-25T16:35:00Z",
  "dataset": "dataset_name",
  "metrics": {
    "loss": 0.234,
    "accuracy": 0.876
  },
  "notes": "Optional training notes"
}
```

### 3. Validate Your Metrics

Use the validation function from the example script:

```python
def validate_metrics(metrics_file):
    """Validate metrics against SCP v1 schema"""
    with open(metrics_file, 'r') as f:
        data = json.load(f)
    
    # Check required fields
    required_fields = ["run_id", "model", "started_at", "ended_at", "dataset", "metrics"]
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
    
    # Check metrics object
    if "metrics" not in data or not isinstance(data["metrics"], dict):
        raise ValueError("Missing or invalid metrics object")
    
    metrics_required = ["loss", "accuracy"]
    for field in metrics_required:
        if field not in data["metrics"]:
            raise ValueError(f"Missing required metric: {field}")
    
    return True
```

## Submission Process

### 1. Generate Metrics

Run your training script to generate metrics:

```bash
python3 your_training_script.py
```

### 2. Review Generated Files

Check the generated metrics file:

```bash
cat evidence/training/submissions/your-model/metrics.json
```

### 3. Commit and Push

```bash
git add evidence/training/submissions/your-model/
git commit -m "SCP v1: Submit training metrics from your-model"
git push origin your-branch
```

### 4. Create Pull Request

Use the SCP v1 PR template:

1. Go to the GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Use the SCP v1 template
5. Fill in all required information
6. Submit for review

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x scripts/synthiant_runner_example.sh
   ```

2. **Python Not Found**
   ```bash
   # Use python3 explicitly
   python3 scripts/tinygrad_toy_run.py
   ```

3. **Schema Validation Failed**
   - Check all required fields are present
   - Ensure data types are correct
   - Verify JSON format is valid

4. **Leaderboard Update Failed**
   - Ensure `scripts/build-leaderboard.mjs` exists
   - Check Node.js is installed
   - Verify metrics file path is correct

### Getting Help

- Check the SCP v1 documentation: `docs/SCP.md`
- Review example submissions in `evidence/training/submissions/`
- Contact the SCRA team for assistance
- Check the training status dashboard: `/status/training/`

## Best Practices

1. **Use Descriptive Run IDs**: Include date, model, and configuration
2. **Document Training Details**: Add relevant notes about hyperparameters
3. **Validate Before Submission**: Always validate metrics against schema
4. **Test Locally**: Ensure scripts work before submitting
5. **Follow Naming Conventions**: Use consistent directory and file naming

## SCP PR Process

After running your training and generating metrics:

### 1. Commit Your Changes

```bash
# Add your submission files
git add evidence/training/submissions/{synthiant_id}/{run_id}/

# Commit with descriptive message
git commit -m "SCP submission: {synthiant_id}/{run_id}"

# Push to your branch
git push origin your-branch-name
```

### 2. Create Pull Request

1. Go to the GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Use the SCP template: `.github/PULL_REQUEST_TEMPLATE_SCP.md`
5. Fill in all required information:
   - Synthiant ID
   - Run ID
   - Source and device types
   - Training details
6. Submit for review

### 3. Review Process

- **SCRA Review**: Synthiant Compliance & Research Analyst verifies compliance
- **PM Review**: Project Manager validates submission quality
- **Dual Consensus**: Both approvals required for merge

## Next Steps

After successful submission:

1. **Wait for Review**: SCRA will review your submission
2. **Address Feedback**: Make any requested changes
3. **Get Approval**: Wait for dual-consensus approval
4. **Monitor Leaderboard**: Check your ranking after merge

## Examples

See the sample submissions in `evidence/training/submissions/sample/` for reference implementations.

---

**Need Help?** Contact the SCRA team or check the training status dashboard for current information.
