#!/usr/bin/env python3
"""
Synthiant Training Script - Phase 4 Training Runway

@fileoverview Provides training functionality for synthiant agents with TinyGrad or PyTorch fallback
@author Dev Team
@version 1.0.0
"""

import os
import json
import time
import argparse
from pathlib import Path
from typing import Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

try:
    import tinygrad as tg
    from tinygrad import Tensor
    TINYGRAD_AVAILABLE = True
    logger.info("✅ TinyGrad available")
except ImportError:
    TINYGRAD_AVAILABLE = False
    logger.warning("⚠️ TinyGrad not available, falling back to PyTorch")

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    PYTORCH_AVAILABLE = True
    logger.info("✅ PyTorch available")
except ImportError:
    PYTORCH_AVAILABLE = False
    logger.warning("⚠️ PyTorch not available")

class SynthiantModel:
    """Base class for synthiant models with framework abstraction"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model = None
        self.optimizer = None
        self.framework = self._select_framework()
        self._build_model()
    
    def _select_framework(self) -> str:
        """Select the best available framework"""
        if TINYGRAD_AVAILABLE:
            return "tinygrad"
        elif PYTORCH_AVAILABLE:
            return "pytorch"
        else:
            raise RuntimeError("No supported framework available (TinyGrad or PyTorch)")
    
    def _build_model(self):
        """Build the model using the selected framework"""
        if self.framework == "tinygrad":
            self._build_tinygrad_model()
        elif self.framework == "pytorch":
            self._build_pytorch_model()
    
    def _build_tinygrad_model(self):
        """Build model using TinyGrad"""
        input_size = self.config.get('input_size', 64)
        hidden_size = self.config.get('hidden_size', 128)
        output_size = self.config.get('output_size', 32)
        
        # Simple feedforward network
        self.weights1 = Tensor.randn(input_size, hidden_size)
        self.weights2 = Tensor.randn(hidden_size, hidden_size)
        self.weights3 = Tensor.randn(hidden_size, output_size)
        self.bias1 = Tensor.zeros(hidden_size)
        self.bias2 = Tensor.zeros(hidden_size)
        self.bias3 = Tensor.zeros(output_size)
        
        logger.info(f"Built TinyGrad model: {input_size} -> {hidden_size} -> {hidden_size} -> {output_size}")
    
    def _build_pytorch_model(self):
        """Build model using PyTorch"""
        input_size = self.config.get('input_size', 64)
        hidden_size = self.config.get('hidden_size', 128)
        output_size = self.config.get('output_size', 32)
        
        self.model = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, output_size)
        )
        
        self.optimizer = optim.Adam(self.model.parameters(), lr=self.config.get('learning_rate', 0.001))
        
        logger.info(f"Built PyTorch model: {input_size} -> {hidden_size} -> {hidden_size} -> {output_size}")
    
    def forward(self, x):
        """Forward pass through the model"""
        if self.framework == "tinygrad":
            return self._forward_tinygrad(x)
        elif self.framework == "pytorch":
            return self._forward_pytorch(x)
    
    def _forward_tinygrad(self, x):
        """TinyGrad forward pass"""
        x = x.matmul(self.weights1) + self.bias1
        x = x.relu()
        x = x.matmul(self.weights2) + self.bias2
        x = x.relu()
        x = x.matmul(self.weights3) + self.bias3
        return x
    
    def _forward_pytorch(self, x):
        """PyTorch forward pass"""
        return self.model(x)
    
    def train_step(self, x, y):
        """Single training step"""
        if self.framework == "tinygrad":
            return self._train_step_tinygrad(x, y)
        elif self.framework == "pytorch":
            return self._train_step_pytorch(x, y)
    
    def _train_step_tinygrad(self, x, y):
        """TinyGrad training step"""
        # Forward pass
        output = self.forward(x)
        
        # Simple MSE loss
        loss = ((output - y) ** 2).mean()
        
        # Backward pass (simplified)
        loss.backward()
        
        # Update weights (simplified SGD)
        lr = self.config.get('learning_rate', 0.001)
        self.weights1 -= lr * self.weights1.grad
        self.weights2 -= lr * self.weights2.grad
        self.weights3 -= lr * self.weights3.grad
        self.bias1 -= lr * self.bias1.grad
        self.bias2 -= lr * self.bias2.grad
        self.bias3 -= lr * self.bias3.grad
        
        # Zero gradients
        self.weights1.grad = None
        self.weights2.grad = None
        self.weights3.grad = None
        self.bias1.grad = None
        self.bias2.grad = None
        self.bias3.grad = None
        
        return loss.numpy()
    
    def _train_step_pytorch(self, x, y):
        """PyTorch training step"""
        self.optimizer.zero_grad()
        
        # Forward pass
        output = self.forward(x)
        
        # MSE loss
        loss = nn.MSELoss()(output, y)
        
        # Backward pass
        loss.backward()
        
        # Update weights
        self.optimizer.step()
        
        return loss.item()

def load_dataset(config: Dict[str, Any]) -> tuple:
    """Load training dataset"""
    dataset_path = config.get('dataset_path', 'data/sample/training_data.jsonl')
    
    if not os.path.exists(dataset_path):
        logger.warning(f"Dataset not found at {dataset_path}, generating synthetic data")
        return generate_synthetic_data(config)
    
    data = []
    with open(dataset_path, 'r') as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line))
    
    # Convert to tensors
    if TINYGRAD_AVAILABLE:
        x = Tensor([d['input'] for d in data])
        y = Tensor([d['output'] for d in data])
    elif PYTORCH_AVAILABLE:
        x = torch.tensor([d['input'] for d in data], dtype=torch.float32)
        y = torch.tensor([d['output'] for d in data], dtype=torch.float32)
    
    logger.info(f"Loaded dataset: {len(data)} samples")
    return x, y

def generate_synthetic_data(config: Dict[str, Any]) -> tuple:
    """Generate synthetic training data"""
    input_size = config.get('input_size', 64)
    output_size = config.get('output_size', 32)
    num_samples = config.get('num_samples', 1000)
    
    logger.info(f"Generating {num_samples} synthetic samples")
    
    if TINYGRAD_AVAILABLE:
        x = Tensor.randn(num_samples, input_size)
        y = Tensor.randn(num_samples, output_size)
    elif PYTORCH_AVAILABLE:
        x = torch.randn(num_samples, input_size)
        y = torch.randn(num_samples, output_size)
    
    return x, y

def save_checkpoint(model: SynthiantModel, metrics: Dict[str, Any], config: Dict[str, Any]):
    """Save model checkpoint and metrics"""
    checkpoint_dir = Path(config.get('checkpoint_dir', 'artifacts/checkpoints'))
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = int(time.time())
    checkpoint_path = checkpoint_dir / f"synthiant_checkpoint_{timestamp}.json"
    
    checkpoint_data = {
        'timestamp': timestamp,
        'config': config,
        'metrics': metrics,
        'framework': model.framework,
        'model_info': {
            'input_size': config.get('input_size', 64),
            'hidden_size': config.get('hidden_size', 128),
            'output_size': config.get('output_size', 32)
        }
    }
    
    with open(checkpoint_path, 'w') as f:
        json.dump(checkpoint_data, f, indent=2)
    
    logger.info(f"Checkpoint saved to {checkpoint_path}")
    return str(checkpoint_path)

def save_metrics(metrics: Dict[str, Any], config: Dict[str, Any]):
    """Save training metrics"""
    metrics_dir = Path(config.get('metrics_dir', 'evidence/phase4/training'))
    metrics_dir.mkdir(parents=True, exist_ok=True)
    
    metrics_path = metrics_dir / 'metrics.json'
    
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    logger.info(f"Metrics saved to {metrics_path}")

def main():
    """Main training function"""
    parser = argparse.ArgumentParser(description='Train Synthiant Model')
    parser.add_argument('--config', default='config/train.dev.yaml', help='Configuration file path')
    parser.add_argument('--steps', type=int, default=100, help='Number of training steps')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
    parser.add_argument('--learning-rate', type=float, default=0.001, help='Learning rate')
    
    args = parser.parse_args()
    
    # Load configuration
    config = {
        'input_size': 64,
        'hidden_size': 128,
        'output_size': 32,
        'learning_rate': args.learning_rate,
        'batch_size': args.batch_size,
        'steps': args.steps,
        'dataset_path': 'data/sample/training_data.jsonl',
        'checkpoint_dir': 'artifacts/checkpoints',
        'metrics_dir': 'evidence/phase4/training'
    }
    
    # Override with command line args
    config['steps'] = args.steps
    config['batch_size'] = args.batch_size
    config['learning_rate'] = args.learning_rate
    
    # Infer model input/output sizes from dataset if available
    try:
        ds_path = Path(config['dataset_path'])
        if ds_path.exists():
            with open(ds_path, 'r') as f:
                for line in f:
                    s = line.strip()
                    if not s:
                        continue
                    sample = json.loads(s)
                    if isinstance(sample.get('input'), list) and isinstance(sample.get('output'), list):
                        inferred_in = len(sample['input'])
                        inferred_out = len(sample['output'])
                        if inferred_in > 0 and inferred_out > 0:
                            config['input_size'] = inferred_in
                            config['output_size'] = inferred_out
                            logger.info(f"Inferred dimensions from dataset: input_size={inferred_in}, output_size={inferred_out}")
                        break
    except Exception as e:
        logger.warning(f"Could not infer dataset dimensions: {e}")

    logger.info(f"Training configuration: {config}")
    
    try:
        # Load dataset first so sizes are coherent with model config
        x, y = load_dataset(config)
        # Initialize model (after dataset-driven inference)
        model = SynthiantModel(config)
        logger.info(f"Model initialized using {model.framework}")
        
        # Training loop
        metrics = {
            'loss_history': [],
            'step_times': [],
            'framework': model.framework,
            'config': config
        }
        
        logger.info(f"Starting training for {config['steps']} steps")
        
        for step in range(config['steps']):
            step_start = time.time()
            
            # Simple batch training (for demo purposes)
            batch_x = x[:config['batch_size']]
            batch_y = y[:config['batch_size']]
            
            loss = model.train_step(batch_x, batch_y)
            
            step_time = time.time() - step_start
            
            metrics['loss_history'].append(loss)
            metrics['step_times'].append(step_time)
            
            if step % 10 == 0:
                logger.info(f"Step {step}/{config['steps']}: Loss = {loss:.6f}, Time = {step_time:.4f}s")
        
        # Calculate final metrics
        final_loss = sum(metrics['loss_history'][-10:]) / min(10, len(metrics['loss_history']))
        avg_step_time = sum(metrics['step_times']) / len(metrics['step_times'])
        
        metrics['final_loss'] = final_loss
        metrics['avg_step_time'] = avg_step_time
        metrics['total_training_time'] = sum(metrics['step_times'])
        
        logger.info(f"Training completed!")
        logger.info(f"Final loss: {final_loss:.6f}")
        logger.info(f"Average step time: {avg_step_time:.4f}s")
        logger.info(f"Total training time: {metrics['total_training_time']:.2f}s")
        
        # Save checkpoint and metrics
        checkpoint_path = save_checkpoint(model, metrics, config)
        save_metrics(metrics, config)
        
        # Save checkpoint path for evidence
        checkpoint_path_file = Path(config['metrics_dir']) / 'checkpoint_path.txt'
        with open(checkpoint_path_file, 'w') as f:
            f.write(checkpoint_path)
        
        logger.info("Training completed successfully!")
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise

if __name__ == "__main__":
    main()
