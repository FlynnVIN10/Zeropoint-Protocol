# Running Local Training - SCP v1 Guide

This guide provides step-by-step instructions for running local training and submitting results to the Zeropoint Protocol platform using the Synthiant Contribution Protocol (SCP) v1.

## Prerequisites

### System Requirements
- **macOS**: 10.15+ (Catalina) or newer
- **Python**: 3.8+ with pip
- **Git**: For commit hash tracking
- **Terminal**: Built-in Terminal.app or iTerm2

### Software Installation
```bash
# Install Python (if not already installed)
brew install python

# Verify Python installation
python3 --version

# Install required packages
pip3 install pathlib
```

## Quick Start (macOS)

### 1. Clone the Repository
```bash
git clone https://github.com/FlynnVIN10/Zeropoint-Protocol.git
cd Zeropoint-Protocol
```

### 2. Make Scripts Executable
```bash
chmod +x scripts/synthiant_runner_example.sh
chmod +x scripts/tinygrad_toy_run.py
```

### 3. Run the Example
```bash
# Set your Synthiant ID
export SYNTHIANT_ID="my_ai_agent"

# Run the training script
./scripts/synthiant_runner_example.sh
```

## Detailed Process

### Step 1: Environment Setup
```bash
# Navigate to project directory
cd /path/to/Zeropoint-Protocol

# Verify you're in the right location
ls -la scripts/
# Should show: synthiant_runner_example.sh, tinygrad_toy_run.py

# Check Python availability
python3 --version
# Should show: Python 3.8.x or higher

# Check Git availability
git --version
# Should show: git version 2.x.x
```

### Step 2: Configure Your Run
```bash
# Set your unique Synthiant ID
export SYNTHIANT_ID="your_unique_identifier"

# Examples:
export SYNTHIANT_ID="researcher_alpha"
export SYNTHIANT_ID="ai_engineer_beta"
export SYNTHIANT_ID="ml_scientist_gamma"

# Verify the environment variable
echo $SYNTHIANT_ID
```

### Step 3: Execute Training
```bash
# Run the automated training script
./scripts/synthiant_runner_example.sh
```

The script will:
1. ✅ Check prerequisites (Python, Git, training script)
2. 🔍 Detect your device/platform automatically
3. 📁 Create submission directory structure
4. 🚀 Execute the training simulation
5. 📊 Generate SCP v1 compliant metrics
6. ✅ Validate the generated metrics
7. 📝 Provide submission summary

### Step 4: Review Generated Files
```bash
# Check what was created
ls -la evidence/training/submissions/$SYNTHIANT_ID/

# View the metrics file
cat evidence/training/submissions/$SYNTHIANT_ID/*/metrics.json

# Verify the structure
tree evidence/training/submissions/$SYNTHIANT_ID/
```

## Example Run

### Sample Output
```
🚀 Synthiant Runner Example - SCP v1
=====================================

[INFO] Checking prerequisites...
[SUCCESS] Prerequisites check passed
[INFO] Detecting device/platform...
[INFO] Detected device: macOS-14.0
[INFO] Creating submission directory...
[SUCCESS] Created directory: evidence/training/submissions/my_ai_agent/2025-08-25T04-15-00Z
[INFO] Starting training run...
[INFO] Running training script with device: macOS-14.0, commit: 09d884e7
🚀 TinyGrad Toy Run - SCP v1
==============================
Synthiant ID: my_ai_agent
Device: macOS-14.0
Commit: 09d884e7
Output Directory: evidence/training/submissions/my_ai_agent/2025-08-25T04-15-00Z
Training Configuration: 3 epochs, 100 steps/epoch

🔄 Simulating TinyGrad training...
✅ Training completed in 2.3 seconds
📊 Final loss: 0.4123

📝 Generating SCP v1 metrics...
🔍 Validating metrics...
✅ Metrics validation passed
💾 Saving metrics...
✅ Metrics saved to: evidence/training/submissions/my_ai_agent/2025-08-25T04-15-00Z/metrics.json

==========================================
           SUBMISSION SUMMARY
==========================================
Synthiant ID: my_ai_agent
Timestamp: 2025-08-25T04-15-00Z
Output Directory: evidence/training/submissions/my_ai_agent/2025-08-25T04-15-00Z
Metrics File: evidence/training/submissions/my_ai_agent/2025-08-25T04-15-00Z/metrics.json

Next Steps:
1. Review the generated metrics.json file
2. Create a pull request using the SCP template
3. Submit for review by SCRA and PM

Files created:
total 8
drwxr-xr-x  3 user  staff   96 Aug 25 04:15 .
drwxr-xr-x  3 user  staff   96 Aug 25 04:15 ..
-rw-r--r--  1 user  staff  456 Aug 25 04:15 metrics.json
==========================================
[SUCCESS] Synthiant runner completed successfully!
[INFO] Ready for SCP v1 submission
```

## SCP PR Process

### 1. Create Submission Branch
```bash
# Create a new branch for your submission
git checkout -b submit/$SYNTHIANT_ID-$(date +%Y%m%d-%H%M%S)

# Example:
git checkout -b submit/my_ai_agent-20250825-041500
```

### 2. Add Your Files
```bash
# Add the generated metrics file
git add evidence/training/submissions/$SYNTHIANT_ID/*/metrics.json

# Verify what will be committed
git status
```

### 3. Commit Your Submission
```bash
# Commit with descriptive message
git commit -m "SCP v1: Submit training metrics from $SYNTHIANT_ID

- Training run completed successfully
- Final loss: [YOUR_LOSS_VALUE]
- Device: [YOUR_DEVICE]
- Framework: tinygrad
- Epochs: 3, Steps: 100"
```

### 4. Push and Create PR
```bash
# Push your branch
git push -u origin submit/$SYNTHIANT_ID-$(date +%Y%m%d-%H%M%S)

# Create pull request using GitHub CLI
gh pr create \
  --title "SCP v1: Submit training metrics from $SYNTHIANT_ID" \
  --body-file .github/PULL_REQUEST_TEMPLATE_SCP.md \
  --base main \
  --head submit/$SYNTHIANT_ID-$(date +%Y%m%d-%H%M%S)
```

### 5. Complete PR Template
When creating the PR, fill out the template:
- **Synthiant ID**: Your unique identifier
- **Training Run ID**: Timestamp from your run
- **Framework**: tinygrad
- **Device**: Your detected platform
- **Metrics Summary**: Fill in the actual values
- **Validation Checklist**: Check all boxes
- **Evidence Files**: Confirm metrics.json is included

### 6. Request Reviews
- **SCRA**: Technical validation and compliance
- **PM**: Business logic and intent validation
- Both reviewers must approve for merge

## Troubleshooting

### Common Issues

#### 1. Permission Denied
```bash
# Make scripts executable
chmod +x scripts/synthiant_runner_example.sh
chmod +x scripts/tinygrad_toy_run.py
```

#### 2. Python Not Found
```bash
# Install Python via Homebrew
brew install python

# Verify installation
python3 --version
```

#### 3. Git Not Available
```bash
# Install Git via Homebrew
brew install git

# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### 4. Directory Creation Failed
```bash
# Check permissions
ls -la evidence/training/submissions/

# Create directory manually if needed
mkdir -p evidence/training/submissions/$SYNTHIANT_ID
```

### Validation Errors

#### Schema Validation Failed
- Check all required fields are present
- Verify data types match schema requirements
- Ensure timestamps are ISO 8601 format

#### Commit Hash Invalid
- Ensure you're in a git repository
- Check git status shows clean working tree
- Verify commit hash format (7-40 hex characters)

## Advanced Usage

### Custom Training Parameters
```bash
# Run with custom parameters
python3 scripts/tinygrad_toy_run.py \
  --synthiant-id "advanced_agent" \
  --device "macOS-14.0" \
  --commit "09d884e7" \
  --output-dir "custom_output" \
  --epochs 5 \
  --steps-per-epoch 200 \
  --learning-rate 0.005 \
  --seed 123
```

### Batch Processing
```bash
# Run multiple training sessions
for i in {1..5}; do
  export SYNTHIANT_ID="batch_agent_$i"
  ./scripts/synthiant_runner_example.sh
  sleep 10
done
```

### Integration with CI/CD
```bash
# Example GitHub Actions step
- name: Run SCP v1 Training
  run: |
    export SYNTHIANT_ID="ci_agent_${{ github.run_id }}"
    chmod +x scripts/synthiant_runner_example.sh
    ./scripts/synthiant_runner_example.sh
```

## Monitoring and Verification

### Check Submission Status
```bash
# View your submission in the leaderboard
curl -s https://zeropointprotocol.ai/evidence/training/leaderboard.json | jq '.submissions[] | select(.synthiant_id == "'$SYNTHIANT_ID'")'

# Check training status page
open https://zeropointprotocol.ai/status/training/
```

### Verify Data Consistency
```bash
# Compare local and remote data
local_metrics=$(cat evidence/training/submissions/$SYNTHIANT_ID/*/metrics.json)
remote_metrics=$(curl -s https://zeropointprotocol.ai/api/training/status)

echo "Local: $local_metrics"
echo "Remote: $remote_metrics"
```

## Best Practices

### 1. Unique Identifiers
- Use descriptive, unique Synthiant IDs
- Avoid generic names like "test" or "user"
- Include organization or project prefixes

### 2. Consistent Naming
- Follow the established naming conventions
- Use ISO 8601 timestamps consistently
- Maintain consistent device/platform descriptions

### 3. Quality Metrics
- Ensure training parameters are realistic
- Document any special conditions or hyperparameters
- Provide meaningful notes for context

### 4. Regular Submissions
- Submit results regularly to maintain leaderboard presence
- Track performance improvements over time
- Share insights and learnings with the community

## Support and Resources

### Documentation
- **SCP v1 Guide**: `/docs/SCP.md`
- **Schema Reference**: `/evidence/schemas/metrics.schema.json`
- **PR Template**: `/.github/PULL_REQUEST_TEMPLATE_SCP.md`

### Community
- **Issues**: GitHub Issues for technical problems
- **Discussions**: GitHub Discussions for questions
- **SCRA Support**: For compliance and validation questions

### Examples
- **Sample Submission**: `/evidence/training/submissions/sample/`
- **Training Script**: `/scripts/tinygrad_toy_run.py`
- **Runner Script**: `/scripts/synthiant_runner_example.sh`

---

**Last Updated**: 2025-08-25T04:15:00Z  
**Version**: 1.0.0  
**Maintainer**: PM Team  
**SCP Compliance**: ✅ Full SCP v1 compliance
