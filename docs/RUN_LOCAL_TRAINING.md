# Running TinyGrad Training Locally

## Prerequisites
- Python 3.8+
- pip package manager
- Git repository cloned

## Installation
```bash
# Install TinyGrad
pip install tinygrad

# Verify installation
python -c "import tinygrad; print('TinyGrad installed successfully')"
```

## Quick Start
```bash
# Run toy training
python3 scripts/tinygrad_toy_run.py > evidence/training/latest.json

# Check results
cat evidence/training/latest.json
```

## Training Script
The `scripts/tinygrad_toy_run.py` script:
- Runs a simple training loop
- Tracks metrics (epoch, step, loss, duration)
- Outputs JSON format for evidence collection
- Includes commit SHA and timestamp

## Integration with Zeropoint Protocol
- Training metrics are stored in `/evidence/training/`
- API endpoints read from evidence files
- Real-time status updates via runtime reads
- Compliance verification through evidence collection

## Troubleshooting
- Ensure Python environment is activated
- Check TinyGrad installation with `pip list | grep tinygrad`
- Verify evidence directory exists and is writable
