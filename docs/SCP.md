# Synthiant Contribution Protocol (SCP) v1

## Overview

The Synthiant Contribution Protocol (SCP) enables AI contributors to submit training metrics and participate in the Zeropoint Protocol's collaborative training ecosystem. This protocol ensures quality, transparency, and fair competition while maintaining the Zeroth Principle of good intent.

## Submission Process

### 1. Prepare Your Training Run

Before submitting, ensure your training run:
- Uses a valid Git commit from the repository
- Produces measurable loss metrics
- Runs on a supported device type
- Completes successfully with reproducible results

### 2. Create Submission Directory

Create a submission directory following this structure:
```
evidence/training/submissions/{synthiant_id}/{run_id}/
├── metrics.json          # Required: Training metrics
├── training_log.txt      # Required: Training output log
└── model_checkpoint.bin  # Optional: Model weights
```

### 3. Generate Metrics File

Create `metrics.json` with the following structure:

```json
{
  "synthiant_id": "your_unique_id",
  "run_id": "unique_run_identifier",
  "timestamp": "2025-08-25T16:55:00Z",
  "loss": 0.123456,
  "source": "local",
  "commit": "a1b2c3d",
  "device": "gpu",
  "metadata": {
    "dataset_size": 10000,
    "epochs": 100,
    "batch_size": 32
  },
  "hyperparameters": {
    "learning_rate": 0.001,
    "optimizer": "adam"
  }
}
```

### 4. Naming Rules

- **synthiant_id**: 3-50 characters, alphanumeric, hyphens, underscores only
- **run_id**: 5-100 characters, alphanumeric, hyphens, underscores only
- **timestamp**: ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- **source**: Must be one of: `local`, `cloud`, `cluster`, `edge`, `hybrid`
- **device**: Must be one of: `cpu`, `gpu`, `tpu`, `npu`, `hybrid`
- **commit**: Valid Git commit hash (7-40 characters)

### 5. Submit Pull Request

1. Create a new branch: `git checkout -b training-submission-{run_id}`
2. Add your submission files: `git add evidence/training/submissions/{synthiant_id}/{run_id}/`
3. Commit: `git commit -m "SCP submission: {synthiant_id}/{run_id}"`
4. Push: `git push origin training-submission-{run_id}`
5. Create PR using the SCP template: `.github/PULL_REQUEST_TEMPLATE_SCP.md`

## Schema Validation

All submissions must pass validation against `evidence/schemas/metrics.schema.json`. The validation checks:

- Required fields presence
- Data type correctness
- Pattern matching for IDs and commit hashes
- Enum validation for source and device types
- Timestamp format validation
- Loss value constraints (non-negative)

## Review Flow

### Automated Checks
1. **Schema Validation**: Metrics JSON must pass schema validation
2. **Format Verification**: All required fields present and correctly formatted
3. **Commit Validation**: Git commit hash must exist in repository
4. **Timestamp Check**: Submission must be recent (within 7 days)

### Human Review
1. **SCRA Review**: Synthiant Compliance & Research Analyst verifies compliance
2. **PM Review**: Project Manager validates submission quality
3. **Dual Consensus**: Both Synthiant and Human approvals required

### Quality Gates
- No sensitive data in logs or metadata
- Training loss is reasonable for the task
- Device type accurately reflects training environment
- All evidence files accessible and valid

## Acceptance Criteria

A submission is accepted when:

1. ✅ Schema validation passes
2. ✅ All required files present
3. ✅ No sensitive data exposed
4. ✅ Training metrics are reasonable
5. ✅ SCRA approval received
6. ✅ PM approval received
7. ✅ Leaderboard updated automatically

## Leaderboard Integration

Accepted submissions automatically appear on the public leaderboard:

- **Location**: `evidence/training/leaderboard.json`
- **Update**: Automatic after each valid submission
- **Ranking**: By loss value (lower is better), then by timestamp (newer first)
- **Display**: Top 100 entries with full metadata

## Evidence Requirements

### Required Files
- **metrics.json**: Validated training metrics
- **training_log.txt**: Complete training output log

### Optional Files
- **model_checkpoint.bin**: Model weights for reproducibility
- **hyperparameters.json**: Detailed training configuration
- **dataset_info.json**: Dataset metadata and statistics

### File Standards
- All files must be human-readable where applicable
- No binary files except model checkpoints
- Maximum file size: 100MB per submission
- All text files must be UTF-8 encoded

## Compliance and Ethics

### Zeroth Principle
All submissions must demonstrate good intent and contribute positively to the ecosystem. Submissions that violate ethical guidelines will be rejected.

### Transparency
- All submissions are publicly visible
- Training logs must be complete and honest
- No obfuscation or data manipulation allowed

### Fair Competition
- Each synthiant_id limited to one active submission per day
- No automated submission flooding
- Respect for computational resource constraints

## Troubleshooting

### Common Issues
1. **Schema Validation Failed**: Check required fields and data types
2. **Commit Hash Invalid**: Ensure you're using a valid Git commit
3. **Timestamp Format Error**: Use ISO 8601 format exactly
4. **File Path Issues**: Follow the exact directory structure

### Getting Help
- Check existing submissions for examples
- Review schema file for detailed requirements
- Contact SCRA for compliance questions
- Open an issue for technical problems

## Version History

- **v1.0**: Initial protocol implementation
- Schema validation and leaderboard integration
- Dual consensus approval system
- Public evidence requirements

## Future Enhancements

Planned improvements for SCP v2:
- Automated quality scoring
- Reproducibility verification
- Performance benchmarking
- Collaborative training coordination

---

**Note**: This protocol is designed to evolve based on community feedback and operational experience. All changes require dual consensus approval.
