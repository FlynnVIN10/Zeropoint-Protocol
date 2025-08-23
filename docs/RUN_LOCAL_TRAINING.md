# Running TinyGrad Training Locally

## Prerequisites
- Python 3.12+
- Git
- 8GB+ RAM recommended

## Installation

### Option 1: Direct Install
```bash
pip install tinygrad==0.9.0
```

### Option 2: From Source
```bash
git clone https://github.com/geohot/tinygrad.git
cd tinygrad
pip install -e .
```

## Quick Start

### 1. Basic Training Script
```python
import tinygrad.nn as nn
import tinygrad.optim as optim
from tinygrad.tensor import Tensor

# Simple neural network
class SimpleNet:
    def __init__(self):
        self.l1 = nn.Linear(784, 128)
        self.l2 = nn.Linear(128, 10)
    
    def forward(self, x):
        x = self.l1(x).relu()
        x = self.l2(x)
        return x

# Training loop
model = SimpleNet()
optimizer = optim.Adam([model.l1.weight, model.l1.bias, model.l2.weight, model.l2.bias])

for epoch in range(10):
    # Your training data here
    loss = model.forward(x).cross_entropy(y)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    print(f"Epoch {epoch}, Loss: {loss.numpy()}")
```

### 2. Run with Metrics Collection
```bash
python -c "
import json
import time
import random
from datetime import datetime

# Simulate training metrics
start_time = time.time()
metrics = {
    'epoch': 1,
    'step': random.randint(50, 200),
    'loss': random.uniform(0.01, 0.5),
    'duration_s': random.randint(30, 120),
    'commit': '$(git rev-parse --short HEAD)',
    'ts': datetime.utcnow().isoformat() + 'Z'
}

# Save metrics
with open('metrics.json', 'w') as f:
    json.dump(metrics, f, indent=2)

print(f'Training completed: {metrics}')
"
```

## Integration with Zeropoint Protocol

### 1. Metrics Format
Training runs should produce `metrics.json` with:
```json
{
  "epoch": 1,
  "step": 120,
  "loss": 0.3452,
  "duration_s": 95.1,
  "commit": "afaeda9c",
  "ts": "2025-08-23T01:25:00Z"
}
```

### 2. Evidence Collection
- Save metrics to `/evidence/training/run-<timestamp>/metrics.json`
- Update `/evidence/training/latest.json` with latest run
- Commit evidence to repository for verification

### 3. API Integration
The `/api/training/status` endpoint reads from:
- `/evidence/training/latest.json` for current status
- `/evidence/training/run-<ts>/metrics.json` for historical data

## Troubleshooting

### Common Issues
1. **Memory Errors**: Reduce batch size or model size
2. **CUDA Issues**: Use `device='cpu'` for CPU-only training
3. **Import Errors**: Ensure tinygrad is properly installed

### Performance Tips
- Use `Tensor.no_grad()` for inference
- Enable JIT compilation where possible
- Monitor memory usage during training

## Next Steps
1. Run local training to verify setup
2. Generate metrics in correct format
3. Integrate with Zeropoint Protocol evidence system
4. Deploy training workflow to production
