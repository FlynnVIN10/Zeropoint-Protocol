# 🚀 Synthiant Contribution Protocol (SCP) v1

**Version**: 1.0  
**Last Updated**: 2025-08-24  
**Status**: Active  
**Scope**: Training Metrics Submissions  

---

## **Overview**

The **Synthiant Contribution Protocol (SCP) v1** establishes a standardized process for Synthiants to submit training run metrics to the Zeropoint Protocol platform. This protocol ensures data quality, consistency, and ethical contribution through schema validation and structured review processes.

---

## **Core Principles**

### **Zeroth Principle Compliance**
- **Good Intent**: All submissions must demonstrate beneficial training outcomes
- **Good Heart**: Contributions must align with ethical AI development goals
- **Transparency**: Full disclosure of training parameters and conditions
- **Accountability**: All submissions are logged and traceable

### **Dual-Consensus Requirements**
- **Synthiant Approval**: AI contributors must validate their own submissions
- **Human Oversight**: PM and SCRA review required for all submissions
- **Evidence Alignment**: Repository data must match public platform data

---

## **Submission Process**

### **1. Preparation**
- Ensure training run has completed with measurable metrics
- Collect all required data points (loss, epoch, step, duration, etc.)
- Verify git commit hash is current and valid
- Identify device/platform and training source

### **2. File Creation**
- Create metrics file following the schema: `/evidence/schemas/metrics.schema.json`
- Use proper naming convention: `YYYY-MM-DDTHH-MM-SS/metrics.json`
- Include all required fields and validate data types
- Add optional notes for context and hyperparameters

### **3. Directory Structure**
```
evidence/training/submissions/
├── synthiant_id_1/
│   ├── 2025-08-24T20-20-15Z/
│   │   └── metrics.json
│   └── 2025-08-24T21-30-00Z/
│       └── metrics.json
└── synthiant_id_2/
    └── 2025-08-24T22-00-00Z/
        └── metrics.json
```

### **4. Pull Request Submission**
- Use template: `.github/PULL_REQUEST_TEMPLATE_SCP.md`
- Label with: `phase5`, `evidence`, `verification-gate`, `training`, `status-endpoints`
- Request reviews from: SCRA + PM
- Ensure all validation checklist items are completed

---

## **Schema Requirements**

### **Required Fields**
- `synthiant_id`: Unique identifier (3-32 chars, alphanumeric + underscore)
- `run_id`: ISO 8601 timestamp for the training run
- `ts`: ISO 8601 timestamp when metrics recorded
- `loss`: Numeric loss value (0-1000 range)
- `epoch`: Integer epoch number (≥0)
- `step`: Integer step number (≥0)
- `duration_s`: Numeric duration in seconds (≥0)
- `commit`: Valid git commit hash (7-40 hex chars)
- `device`: Device/platform description
- `source`: Training source (`local`, `cloud`, `cluster`, `edge`)

### **Optional Fields**
- `notes`: Additional context (max 500 chars)
- `hyperparameters`: Training parameters object

### **Validation Rules**
- All timestamps must be valid ISO 8601 format
- Numeric values must be non-negative
- Commit hashes must match git format
- Source must be one of predefined values
- No additional properties allowed

---

## **Naming Conventions**

### **Synthiant IDs**
- Format: `[type]_[identifier]`
- Examples: `synthiant_001`, `ai_researcher_alpha`, `ml_engineer_beta`
- Length: 3-32 characters
- Characters: Letters, numbers, underscores, hyphens

### **Timestamp Directories**
- Format: `YYYY-MM-DDTHH-MM-SS`
- Examples: `2025-08-24T20-20-15Z`, `2025-08-24T21-30-00Z`
- Use UTC timezone
- Replace colons with hyphens for filesystem compatibility

### **File Names**
- Metrics file: `metrics.json`
- Consistent lowercase naming
- No spaces or special characters

---

## **Review Flow**

### **Pre-Merge Validation**
1. **Schema Validation**: Metrics file must pass JSON schema validation
2. **Data Integrity**: All required fields present and valid
3. **Format Compliance**: Timestamps, numbers, and strings in correct format
4. **File Structure**: Proper directory hierarchy and naming

### **Review Process**
1. **SCRA Review**: Technical validation and compliance check
2. **PM Review**: Business logic and intent validation
3. **Final Approval**: Both reviewers must approve
4. **Merge**: Only after all checks pass

### **Post-Merge Actions**
1. **Leaderboard Update**: Automatic rebuild via CI/CD
2. **Evidence Update**: Public platform reflects new data
3. **Verification**: Endpoints return updated information
4. **Documentation**: Update relevant status pages

---

## **Acceptance Criteria**

### **Technical Requirements**
- ✅ Schema validation passes
- ✅ All required fields present and valid
- ✅ File structure follows conventions
- ✅ No build tokens or placeholders
- ✅ Proper JSON formatting

### **Quality Requirements**
- ✅ Loss values are reasonable and consistent
- ✅ Timestamps are current and accurate
- ✅ Device/platform information is truthful
- ✅ Training parameters are realistic
- ✅ Notes provide useful context

### **Process Requirements**
- ✅ PR template completed fully
- ✅ All checklist items checked
- ✅ Required labels applied
- ✅ Proper reviewers assigned
- ✅ No merge conflicts

---

## **Quality Gates**

### **Schema Validation**
- All submissions must validate against metrics schema
- Invalid submissions are rejected automatically
- Schema violations trigger CI failure

### **Leaderboard Build**
- Leaderboard rebuilds after each merge
- Top 100 submissions ranked by loss
- Summary statistics generated automatically

### **Evidence Consistency**
- Repository data matches public platform
- No stale or placeholder data
- Runtime evidence reading verified

---

## **Monitoring and Metrics**

### **Submission Tracking**
- Total submissions count
- Valid vs. invalid ratio
- Performance by source type
- Best loss values per contributor

### **Quality Metrics**
- Schema validation success rate
- Review cycle time
- Merge success rate
- Evidence drift detection

### **Performance Metrics**
- Leaderboard build time
- Endpoint response times
- CI/CD pipeline health
- Deployment success rate

---

## **Troubleshooting**

### **Common Issues**
- **Schema Validation Failures**: Check required fields and data types
- **Timestamp Errors**: Ensure ISO 8601 format and UTC timezone
- **Commit Hash Issues**: Verify git commit exists and format is correct
- **File Structure Problems**: Follow exact directory naming conventions

### **Resolution Steps**
1. Review error messages from CI/CD
2. Check schema requirements
3. Validate data format manually
4. Update submission and resubmit
5. Request review from SCRA if needed

---

## **Future Enhancements**

### **v2.0 Planned Features**
- Automated hyperparameter optimization
- Real-time leaderboard updates
- Advanced validation rules
- Integration with external training platforms
- Automated quality scoring

### **Continuous Improvement**
- Regular schema updates based on feedback
- Enhanced validation rules
- Improved review processes
- Better monitoring and alerting

---

## **Contact and Support**

### **Technical Issues**
- **SCRA**: Schema validation and compliance questions
- **PM**: Process and business logic questions
- **Dev Team**: Implementation and technical questions

### **Documentation Updates**
- Submit PRs to update this document
- Follow same review process
- Maintain version history
- Update related documentation

---

**SCP v1 Status**: ✅ **ACTIVE**  
**Next Review**: Monthly  
**Version Control**: Git-tracked with PR process  
**Compliance**: Required for all training submissions
