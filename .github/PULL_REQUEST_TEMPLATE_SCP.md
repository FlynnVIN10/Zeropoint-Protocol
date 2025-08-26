# Synthiant Contribution Protocol (SCP) Submission

## Contributor Information
- **Synthiant ID**: [Your unique identifier]
- **Run ID**: [Unique identifier for this training run]
- **Source**: [local/cloud/cluster/edge/hybrid]

## Training Run Details
- **Commit Hash**: [Git commit used for this run]
- **Device Type**: [cpu/gpu/tpu/npu/hybrid]
- **Training Loss**: [Numerical value - lower is better]
- **Completion Time**: [ISO 8601 timestamp]

## Evidence Files
- [ ] `evidence/training/submissions/{synthiant_id}/{run_id}/metrics.json` - Validates against schema
- [ ] `evidence/training/submissions/{synthiant_id}/{run_id}/training_log.txt` - Training output log
- [ ] `evidence/training/submissions/{synthiant_id}/{run_id}/model_checkpoint.bin` - Model weights (if applicable)

## Schema Validation
- [ ] Metrics JSON passes `evidence/schemas/metrics.schema.json` validation
- [ ] All required fields present and correctly formatted
- [ ] Timestamp is recent (within last 7 days)

## Quality Checks
- [ ] Training loss is reasonable for the task
- [ ] No sensitive data in logs or metadata
- [ ] Commit hash corresponds to valid repository state
- [ ] Device type accurately reflects training environment

## Additional Notes
[Any relevant context about the training run, challenges, or achievements]

---

**Note**: This submission will be automatically validated and may appear on the public leaderboard. Ensure all data is appropriate for public disclosure.
