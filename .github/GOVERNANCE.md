# Zeropoint Protocol Governance Enforcement

## Branch Protection Rules (GitHub Settings)

### Main Branch Protection
**Branch:** `main`
**Required Approvals:** 2
**Required Status Checks:** All CI workflows must pass
**Restrictions:**
- Require pull request reviews before merging
- Require status checks to pass before merging
- Include administrators in restrictions
- Require conversation resolution before merging

### Required Status Checks
- `truth-to-repo` - Truth-to-Repo validation
- `verification-gate` - Verification gate compliance
- `test` - Unit tests (if applicable)

## Dual Consensus Requirements

### Code Changes
- **Synthient Approval:** Automated CI validation
- **Human Approval:** Code review by team member
- **Evidence:** All changes logged with audit trail

### Material Changes
- **Proposal Reviews:** Require Synthient consensus
- **Architecture Changes:** Require CTO approval
- **Security Updates:** Require immediate dual consensus

## MOCKS_DISABLED=1 Enforcement

### Environment Variables
- **Production:** `MOCKS_DISABLED=1`
- **Staging:** `MOCKS_DISABLED=1`
- **Development:** Optional (can use mocks for testing)

### Runtime Validation
```javascript
// In application code
if (process.env.MOCKS_DISABLED !== '1') {
  throw new Error('Production must have MOCKS_DISABLED=1');
}
```

### CI Validation
- Workflow checks `MOCKS_DISABLED=1` in production
- Fails deployment if mocks are enabled
- Logs validation results

## CODEOWNERS Configuration

### Current Owners
```
# All files require CEO (temporary) until CTO handle is added.
# Replace or append the CTO GitHub handle when available.
* @FlynnVIN10

evidence/** @FlynnVIN10
docs/** @FlynnVIN10
scripts/** @FlynnVIN10
.github/** @FlynnVIN10
```

### Required Reviews
- **All Changes:** Require review from CODEOWNERS
- **Critical Files:** Require additional scrutiny
- **Security Changes:** Require security team review

## Governance Gates

### Training Gate
- ✅ **Requirement:** Database integration complete
- ✅ **Validation:** `/api/healthz` returns `db: "ok"`
- ✅ **Evidence:** Database connectivity verified

### Proposal Gate
- ⏳ **Requirement:** Proposal system operational
- ⏳ **Validation:** Proposals created and consensus logged
- ⏳ **Evidence:** `/evidence/consensus/` populated

### Website Gate
- ⏳ **Requirement:** Live site reflects canonical state
- ⏳ **Validation:** `/status/version.json` shows correct commit
- ⏳ **Evidence:** Evidence endpoints serve JSON

### Consensus Gate
- ⏳ **Requirement:** Human consensus responses logged
- ⏳ **Validation:** Dual consensus enforced
- ⏳ **Evidence:** Consensus evidence files written

### Verification Gate
- ⏳ **Requirement:** CI green, Lighthouse ≥95
- ⏳ **Validation:** All automated checks pass
- ⏳ **Evidence:** Compliance report filed

## Escalation Procedures

### Blocker Identification
- **Definition:** Any issue preventing gate advancement
- **Timeframe:** Address within 30 minutes
- **Escalation:** Page CTO if unresolved

### Gate Failure
- **Definition:** Automated checks fail 2x consecutively
- **Response:** Immediate investigation and fix
- **Escalation:** Page CEO if systemic issue

## Audit Trail Requirements

### Evidence Storage
- **Location:** `/evidence/` directory structure
- **Format:** JSON with timestamps and metadata
- **Retention:** Maintain complete history

### Compliance Logging
- **Location:** `/evidence/compliance/` reports
- **Frequency:** Post-gate advancement
- **Validation:** Machine-checkable format

## Security Headers Enforcement

### Required Headers
```
Content-Type: application/json; charset=utf-8
Cache-Control: no-store
X-Content-Type-Options: nosniff
```

### Validation Points
- **API Endpoints:** All `/api/*` routes
- **Status Endpoints:** `/status/*.json`
- **Evidence Endpoints:** `/evidence/**/*.json`

### CI Checks
- Automated header validation in workflows
- Fail deployment if headers missing
- Log header verification results

## Final Authority

**Zeroth Principle:** GOD FIRST - All governance serves ethical AI development
**Dual Consensus:** Synthient + Human approval required for material changes
**Evidence First:** All decisions supported by verifiable evidence
**Transparency:** Complete audit trail maintained and publicly accessible

---

*This governance configuration ensures Truth-to-Repo compliance and maintains the highest standards of ethical AI development and transparent governance.*
