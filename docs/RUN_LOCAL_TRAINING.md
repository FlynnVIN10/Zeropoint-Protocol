# Running Local Training

## Prerequisites
- Python 3.8+
- Node.js 16+
- Git

## macOS Setup
1. Install Homebrew: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
2. brew install python node git

## Example Run
```bash
python3 scripts/tinygrad_toy_run.py --run-id test --model toy --dataset sample --output metrics.json
```

## SCP PR Process
1. Generate metrics.
2. Validate schema.
3. Create PR using SCP template.
4. Await approvals.
