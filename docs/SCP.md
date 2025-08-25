# Synthiant Contribution Protocol (SCP) v1

## Overview

The Synthiant Contribution Protocol (SCP) v1 is a standardized framework for collecting, validating, and ranking training metrics from Synthiant contributors. This protocol ensures data quality, consistency, and fair competition while maintaining transparency and ethical standards.

## Core Principles

1. **Transparency**: All submissions are publicly visible and verifiable
2. **Fairness**: Standardized metrics and validation ensure equal evaluation
3. **Quality**: Schema validation prevents invalid or misleading submissions
4. **Community**: Open participation encourages collaboration and innovation

## Submission Process

### 1. Prepare Training Metrics

Create a `metrics.json` file with the following structure:

```json
{
  "synthiant_id": "your_unique_id",
  "run_id": "2025-08-25T04:00:00.000Z",
  "epoch": 1,
  "step": 120,
  "loss": 0.3452,
  "duration_s": 95.1,
  "commit": "09d884e7",
  "ts": "2025-08-25T04:00:00.000Z",
  "source": "tinygrad",
  "device": "macOS-14.0",
  "notes": "Training run description"
}
```

### 2. Directory Structure

Place your submission in the following structure:
```
evidence/training/submissions/
└── [synthiant_id]/
    └── [timestamp]/
        └── metrics.json
```

Example:
```
evidence/training/submissions/
└── synthiant_alpha/
    └── 2025-08-25T04-00-00Z/
        └── metrics.json
```

### 3. Schema Validation

All submissions must conform to the schema defined in `evidence/schemas/metrics.schema.json`. The schema enforces:

- Required fields: `synthiant_id`, `run_id`, `epoch`, `step`, `loss`, `duration_s`, `commit`, `ts`, `source`
- Data types and validation rules
- Format requirements (ISO timestamps, valid commit hashes)

### 4. Pull Request Submission

1. Create a new branch: `git checkout -b submit/[synthiant_id]-[timestamp]`
2. Add your metrics file: `git add evidence/training/submissions/[synthiant_id]/[timestamp]/metrics.json`
3. Commit: `git commit -m "SCP v1: Submit training metrics from [synthiant_id]"`
4. Push: `git push origin submit/[synthiant_id]-[timestamp]`
5. Create PR using the SCP template

## Naming Conventions

### Synthiant ID
- Use lowercase letters, numbers, and underscores only
- Minimum 3 characters, maximum 50 characters
- Must be unique across all contributors
- Examples: `synthiant_alpha`, `researcher_001`, `ai_agent_beta`

### Timestamp Format
- Use ISO 8601 format: `YYYY-MM-DDTHH-MM-SSZ`
- Replace colons with hyphens for directory compatibility
- Examples: `2025-08-25T04-00-00Z`, `2025-08-25T14-30-15Z`

### Source Values
- `tinygrad`: TinyGrad framework
- `pytorch`: PyTorch framework
- `tensorflow`: TensorFlow framework
- `jax`: JAX framework
- `other`: Other frameworks

## Review Flow

### 1. Automated Validation
- Schema validation against `metrics.schema.json`
- Commit hash verification
- Timestamp format validation

### 2. Manual Review
- SCRA (Synthiant Compliance & Research Analyst) review
- PM approval
- Quality gate validation

### 3. Acceptance Criteria
- Passes all automated validations
- No duplicate submissions
- Reasonable loss values (0-1000 range)
- Valid training parameters

## Leaderboard System

### Ranking Criteria
- **Primary**: Loss value (lower is better)
- **Secondary**: Training duration (shorter is better)
- **Tertiary**: Submission timestamp (newer is better)

### Leaderboard Updates
- Generated automatically after each PR merge
- Top 100 submissions displayed
- Summary statistics included
- Real-time updates via CI/CD

### Leaderboard Access
- JSON format: `/evidence/training/leaderboard.json`
- Web interface: `/status/training/`
- API endpoint: `/api/training/status`

## Quality Gates

### Pre-Merge Checks
- Schema validation passes
- No duplicate submissions
- Valid commit references
- Proper directory structure

### Post-Merge Validation
- Leaderboard rebuilds successfully
- Evidence index updates
- Training status reflects new data
- All endpoints return consistent information

## Troubleshooting

### Common Issues

1. **Schema Validation Failed**
   - Check required fields are present
   - Verify data types match schema
   - Ensure timestamps are ISO 8601 format

2. **Commit Hash Invalid**
   - Use `git rev-parse --short HEAD` for current commit
   - Ensure hash is 7-40 hexadecimal characters

3. **Directory Structure Error**
   - Follow exact naming convention
   - Use hyphens instead of colons in timestamps
   - Place metrics.json in correct subdirectory

### Getting Help

- Check existing submissions for examples
- Review schema documentation
- Contact PM for clarification
- Submit issues for technical problems

## Future Enhancements

### SCP v2 Roadmap
- Advanced validation rules
- Hyperparameter tracking
- Model architecture metadata
- Performance benchmarking
- Automated testing integration

### Community Features
- Discussion forums
- Best practices sharing
- Collaborative training
- Mentorship programs

## Compliance and Ethics

### Data Privacy
- No personal information in submissions
- Training data not included
- Only metrics and metadata shared

### Fair Competition
- No artificial manipulation of metrics
- Transparent training processes
- Reproducible results encouraged

### Ethical Standards
- Follow Zeroth Principle: "Only with good intent and a good heart does the system function"
- No harmful or malicious submissions
- Community guidelines enforcement

---

**SCP v1 Version**: 1.0.0  
**Last Updated**: 2025-08-25T04:05:00Z  
**Maintainer**: PM Team  
**Schema Version**: Draft-07
