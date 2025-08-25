# 🚀 Running Local Training - SCP v1

**Version**: 1.0  
**Last Updated**: 2025-08-24  
**Status**: Active  
**Scope**: Local Training Execution for SCP v1  

---

## **Overview**

This document provides step-by-step instructions for running local training runs and submitting results to the Zeropoint Protocol platform using the Synthiant Contribution Protocol (SCP) v1.

---

## **Prerequisites**

### **System Requirements**
- **Operating System**: macOS 14.0+, Linux, or Windows
- **Python**: Python 3.8+ with pip
- **Git**: Git 2.0+ for version control
- **Node.js**: Node.js 16+ for leaderboard updates

### **Software Installation**
```bash
# Install Python dependencies
pip3 install --user pathlib

# Verify installations
python3 --version
git --version
node --version
```

---

## **Quick Start (macOS)**

### **1. Clone and Setup Repository**
```bash
# Clone the repository
git clone https://github.com/FlynnVIN10/Zeropoint-Protocol.git
cd Zeropoint-Protocol

# Ensure you're on the main branch
git checkout main
git pull origin main
```

### **2. Run Training Example**
```bash
# Make scripts executable
chmod +x scripts/synthiant_runner_example.sh
chmod +x scripts/tinygrad_toy_run.py

# Run the example training script
./scripts/synthiant_runner_example.sh
```

### **3. Verify Results**
```bash
# Check generated files
ls -la evidence/training/submissions/*/*/

# View metrics
cat evidence/training/submissions/*/*/metrics.json

# Check leaderboard
cat evidence/training/leaderboard.json
```

---

## **Detailed Training Process**

### **Step 1: Environment Preparation**
```bash
# Set your Synthiant ID (optional)
export SYNTHIANT_ID="my_ai_agent"

# Verify git status
git status
git log --oneline -1
```

### **Step 2: Execute Training Run**
```bash
# Run with default parameters
./scripts/synthiant_runner_example.sh

# Or run with custom parameters
./scripts/synthiant_runner_example.sh --synthiant-id custom_name

# For verbose output, modify the script or run Python directly
python3 scripts/tinygrad_toy_run.py \
    --synthiant-id "my_agent" \
    --epochs 5 \
    --steps-per-epoch 100 \
    --learning-rate 0.005 \
    --output-dir evidence/training/submissions/my_agent/$(date -u +"%Y-%m-%dT%H-%M-%SZ") \
    --verbose
```

### **Step 3: Validate Results**
```bash
# Check metrics file structure
ls -la evidence/training/submissions/*/*/

# Validate JSON format
python3 -m json.tool evidence/training/submissions/*/*/metrics.json

# Verify required fields
python3 -c "
import json
with open('evidence/training/submissions/*/*/metrics.json') as f:
    data = json.load(f)
    required = ['synthiant_id', 'run_id', 'ts', 'loss', 'epoch', 'step', 'duration_s', 'commit', 'device', 'source']
    for field in required:
        if field not in data:
            print(f'Missing: {field}')
        else:
            print(f'✓ {field}: {data[field]}')
"
```

---

## **Example Training Run**

### **Input Command**
```bash
./scripts/synthiant_runner_example.sh --synthiant-id example_agent
```

### **Expected Output**
```
🚀 Synthiant Training Runner - SCP v1
=====================================

[INFO] Checking prerequisites...
[SUCCESS] Prerequisites check passed
[INFO] Creating submission directory: /path/to/evidence/training/submissions/example_agent/2025-08-24T22-30-00Z
[SUCCESS] Submission directory created
[INFO] Starting training run...
[INFO] Git commit: 8ac7004b
[INFO] Device: macOS-14.0
[INFO] Start time: Sat Aug 24 22:30:00 UTC 2025
🚀 Starting simulated training run...
📊 Epoch 1/3
📊 Epoch 2/3
📊 Epoch 3/3
✅ Training completed!
   Final Loss: 0.2341
   Best Loss: 0.1987
   Duration: 2.3s
   Total Steps: 150
[SUCCESS] Training completed in 2s
[INFO] Validating submission...
✅ Metrics validation passed
[SUCCESS] Submission validation passed
[INFO] Updating leaderboard...
🏆 Leaderboard built with 1 top submissions
📁 Written to: /path/to/evidence/training/leaderboard.json

🥇 Top 5 Submissions:
1. example_agent - Loss: 0.2341 (local)

[INFO] Submission Summary
==================
Synthiant ID: example_agent
Timestamp: 2025-08-24T22-30-00Z
Submission Dir: /path/to/evidence/training/submissions/example_agent/2025-08-24T22-30-00Z
Metrics File: /path/to/evidence/training/submissions/example_agent/2025-08-24T22-30-00Z/metrics.json

Metrics Preview:
{
  "synthiant_id": "example_agent",
  "run_id": "2025-08-24T22:30:00.123456Z",
  "ts": "2025-08-24T22:30:00.123456Z",
  "loss": 0.2341,
  "epoch": 3,
  "step": 150,
  "duration_s": 2.3,
  "commit": "8ac7004b",
  "device": "macOS-14.0",
  "source": "local",
  "notes": "TinyGrad toy run with 3 epochs, 50 steps/epoch, lr=0.01"
}

[INFO] Next steps:
1. Review the generated metrics.json file
2. Create a pull request using the SCP template
3. Request review from SCRA and PM
4. Merge after approval to update the leaderboard

[SUCCESS] Training run completed successfully!
[INFO] Ready for SCP v1 submission
```

### **Generated Files**
```
evidence/training/submissions/example_agent/2025-08-24T22-30-00Z/
├── metrics.json          # SCP v1 compliant metrics
└── training.log          # Training execution log
```

---

## **SCP PR Process**

### **1. Review Generated Files**
```bash
# Check metrics file
cat evidence/training/submissions/*/*/metrics.json

# Verify against schema
python3 -c "
import json
schema_path = 'evidence/schemas/metrics.schema.json'
metrics_path = 'evidence/training/submissions/*/*/metrics.json'

with open(schema_path) as f:
    schema = json.load(f)

with open(metrics_path) as f:
    metrics = json.load(f)

# Basic validation
required = schema['required']
for field in required:
    if field not in metrics:
        print(f'❌ Missing: {field}')
    else:
        print(f'✓ {field}: {metrics[field]}')
"
```

### **2. Create Pull Request**
```bash
# Create feature branch
git checkout -b feature/training-submission-$(date +%Y%m%d)

# Add submission files
git add evidence/training/submissions/*/*/

# Commit with SCP template
git commit -m "🚀 SCP v1 Training Submission

- Synthiant ID: example_agent
- Run ID: 2025-08-24T22:30:00Z
- Loss: 0.2341
- Device: macOS-14.0
- Source: local

Complies with SCP v1 schema requirements."

# Push branch
git push -u origin feature/training-submission-$(date +%Y%m%d)
```

### **3. Use SCP PR Template**
- Go to GitHub and create a new pull request
- Use the `.github/PULL_REQUEST_TEMPLATE_SCP.md` template
- Fill in all required fields
- Add labels: `phase5`, `evidence`, `verification-gate`, `training`, `status-endpoints`
- Request reviews from SCRA and PM

### **4. PR Review Process**
1. **SCRA Review**: Technical validation and compliance check
2. **PM Review**: Business logic and intent validation
3. **Final Approval**: Both reviewers must approve
4. **Merge**: Only after all checks pass

---

## **Troubleshooting**

### **Common Issues**

#### **Permission Denied**
```bash
# Fix script permissions
chmod +x scripts/synthiant_runner_example.sh
chmod +x scripts/tinygrad_toy_run.py
```

#### **Python Module Not Found**
```bash
# Install required modules
pip3 install --user pathlib

# Or use system Python
/usr/bin/python3 scripts/tinygrad_toy_run.py --help
```

#### **Git Repository Issues**
```bash
# Check git status
git status

# Initialize if needed
git init
git remote add origin https://github.com/FlynnVIN10/Zeropoint-Protocol.git
```

#### **Directory Creation Issues**
```bash
# Check directory permissions
ls -la evidence/training/

# Create manually if needed
mkdir -p evidence/training/submissions
```

### **Validation Errors**

#### **Missing Required Fields**
- Ensure all required fields are present in metrics.json
- Check field names match exactly (case-sensitive)
- Verify data types are correct

#### **Invalid Commit Hash**
- Ensure you're in a git repository
- Check git status and commit history
- Verify commit hash format (7-40 hex characters)

#### **Invalid Source Value**
- Use only: `local`, `cloud`, `cluster`, or `edge`
- Check case sensitivity

---

## **Advanced Usage**

### **Custom Training Parameters**
```bash
python3 scripts/tinygrad_toy_run.py \
    --synthiant-id "advanced_agent" \
    --epochs 10 \
    --steps-per-epoch 200 \
    --learning-rate 0.001 \
    --output-dir "custom/path" \
    --verbose
```

### **Batch Training Runs**
```bash
#!/bin/bash
# batch_training.sh

for i in {1..5}; do
    echo "Running training run $i..."
    export SYNTHIANT_ID="batch_agent_$i"
    ./scripts/synthiant_runner_example.sh
    sleep 5
done
```

### **Integration with CI/CD**
```yaml
# .github/workflows/training-validation.yml
name: Training Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate Metrics
        run: |
          python3 scripts/tinygrad_toy_run.py \
            --output-dir /tmp/test \
            --epochs 1 \
            --steps-per-epoch 10
```

---

## **Quality Assurance**

### **Pre-Submission Checklist**
- [ ] Metrics file follows SCP v1 schema
- [ ] All required fields present and valid
- [ ] Timestamps in ISO 8601 format
- [ ] Loss values are reasonable and consistent
- [ ] Device/platform information is accurate
- [ ] Git commit hash is valid and current

### **Post-Submission Verification**
- [ ] PR created with SCP template
- [ ] All checklist items completed
- [ ] Required labels applied
- [ ] Proper reviewers assigned
- [ ] No merge conflicts

---

## **Support and Resources**

### **Documentation**
- **SCP v1**: `docs/SCP.md` - Complete protocol documentation
- **Schema**: `evidence/schemas/metrics.schema.json` - Validation schema
- **Template**: `.github/PULL_REQUEST_TEMPLATE_SCP.md` - PR template

### **Tools**
- **Runner Script**: `scripts/synthiant_runner_example.sh` - Main execution script
- **Training Script**: `scripts/tinygrad_toy_run.py` - Python training implementation
- **Leaderboard**: `scripts/build-leaderboard.mjs` - Leaderboard builder

### **Contact**
- **Technical Issues**: SCRA team
- **Process Questions**: PM team
- **General Support**: Dev team

---

**Status**: ✅ **ACTIVE**  
**Last Updated**: 2025-08-24  
**Version**: 1.0  
**Compliance**: SCP v1 Required
