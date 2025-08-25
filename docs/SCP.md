# Synthiant Contribution Protocol (SCP) v1

## Overview

The Synthiant Contribution Protocol (SCP) v1 is a standardized framework for collecting, validating, and ranking training metrics from AI models. This protocol ensures transparency, reproducibility, and fair comparison across different training runs.

## Submission Process

### 1. Training Run Execution

Execute your training run using your preferred framework (PyTorch, TensorFlow, JAX, etc.) and collect the required metrics.

### 2. Metrics Collection

Collect the following metrics during training:
- **run_id**: Unique identifier for the training run
- **model**: Model architecture identifier
- **started_at**: ISO 8601 timestamp when training began
- **ended_at**: ISO 8601 timestamp when training completed
- **dataset**: Dataset identifier used for training
- **metrics**: Training performance metrics
  - **loss**: Training loss value (lower is better)
  - **accuracy**: Training accuracy value (higher is better)
- **notes**: Optional additional information

### 3. Schema Validation

Ensure your metrics conform to the SCP v1 schema:
```bash
# Validate against schema
node scripts/build-leaderboard.mjs --validate
```

### 4. Submission

Place your metrics file in the appropriate directory:
```
evidence/training/submissions/<model_name>/<timestamp>/metrics.json
```

### 5. Leaderboard Update

The leaderboard is automatically updated when new submissions are added:
```bash
# Build leaderboard
node scripts/build-leaderboard.mjs
```

## Schema Reference

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `run_id` | string | Unique run identifier | "run_2025_08_25_001" |
| `model` | string | Model architecture | "gpt-3.5-turbo" |
| `started_at` | string | Training start time | "2025-08-25T10:00:00Z" |
| `ended_at` | string | Training end time | "2025-08-25T12:00:00Z" |
| `dataset` | string | Dataset identifier | "wikitext-103" |
| `metrics.loss` | number | Training loss | 0.234 |
| `metrics.accuracy` | number | Training accuracy | 0.876 |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `notes` | string | Additional information |

## Example Submission

```json
{
  "run_id": "run_2025_08_25_001",
  "model": "gpt-3.5-turbo",
  "started_at": "2025-08-25T10:00:00Z",
  "ended_at": "2025-08-25T12:00:00Z",
  "dataset": "wikitext-103",
  "metrics": {
    "loss": 0.234,
    "accuracy": 0.876
  },
  "notes": "Training run with improved hyperparameters"
}
```

## Leaderboard

The leaderboard ranks submissions by training loss (ascending) and provides:
- Top 100 submissions
- Summary statistics
- Model and dataset breakdowns
- Performance metrics

## Validation Rules

1. **Schema Compliance**: All submissions must conform to the SCP v1 schema
2. **Required Fields**: All required fields must be present and valid
3. **Data Types**: Fields must match the specified data types
4. **Timestamps**: All timestamps must be in ISO 8601 format
5. **Metrics Range**: Loss and accuracy values must be reasonable (0-1000 for loss, 0-1 for accuracy)

## Review Process

1. **Automated Validation**: Schema validation runs automatically
2. **Manual Review**: SCRA reviews submissions for quality and compliance
3. **Leaderboard Update**: Valid submissions are added to the leaderboard
4. **Evidence Logging**: All submissions are logged to Soulchain for transparency

## Best Practices

1. **Unique Identifiers**: Use descriptive, unique run IDs
2. **Detailed Notes**: Include relevant training details in notes
3. **Consistent Formatting**: Follow the schema exactly
4. **Reproducibility**: Ensure training runs can be reproduced
5. **Transparency**: Document any special conditions or modifications

## Support

For questions or issues with SCP v1:
- Check the schema validation output
- Review the example submissions
- Contact the SCRA team for assistance

## Version History

- **v1.0**: Initial release with basic metrics collection and leaderboard
- **Future**: Enhanced validation, additional metrics, and advanced ranking algorithms
