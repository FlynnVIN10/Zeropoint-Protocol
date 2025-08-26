# Synthiant Contribution Protocol (SCP) v1

## Overview
SCP v1 enables Synthiant contributions to training data and metrics.

## Submission Process
1. Run training locally or on device.
2. Collect metrics in JSON format matching schema.
3. Validate against evidence/schemas/metrics.schema.json.
4. Submit PR using PULL_REQUEST_TEMPLATE_SCP.md.
5. Leaderboard updates automatically on merge.

## Schema
See evidence/schemas/metrics.schema.json for required fields: run_id, model, started_at, ended_at, dataset, metrics (loss, accuracy), notes.

## Example Submission
{
  "run_id": "run-001",
  "model": "tinygrad-toy",
  "started_at": "2025-08-25T12:00:00Z",
  "ended_at": "2025-08-25T12:30:00Z",
  "dataset": "toy-dataset",
  "metrics": { "loss": 0.5, "accuracy": 0.85 },
  "notes": "Initial run"
}

## Leaderboard
Generated via scripts/build-leaderboard.mjs, sorted by loss.

## Best Practices
- Use unique run_id.
- Include notes for context.
- Validate before PR.
