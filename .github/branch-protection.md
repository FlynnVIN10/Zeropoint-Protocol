# Branch Protection Configuration

**© [2025] Zeropoint Protocol (C Corp). All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.**

## Required Branch Protection Settings

### Main Branch Protection Rules

Configure the following settings in GitHub repository settings:

#### **General Settings**
- **Branch name pattern**: `main`
- **Require a pull request before merging**: ✅ **ENABLED**
- **Require approvals**: ✅ **ENABLED** (Minimum: 2)
- **Dismiss stale PR approvals when new commits are pushed**: ✅ **ENABLED**
- **Require review from code owners**: ✅ **ENABLED**

#### **Status Checks**
- **Require status checks to pass before merging**: ✅ **ENABLED**
- **Require branches to be up to date before merging**: ✅ **ENABLED**
- **Status checks that are required**:
  - `License & Copyright Header Check`
  - `Build and Test`
  - `Security Scan`

#### **Restrictions**
- **Restrict pushes that create files that cannot be reviewed**: ✅ **ENABLED**
- **Require conversation resolution before merging**: ✅ **ENABLED**
- **Require signed commits**: ✅ **ENABLED**
- **Require linear history**: ✅ **ENABLED**

#### **Team Restrictions**
- **Restrict who can push to matching branches**: ✅ **ENABLED**
- **Allowed to push**: `zeropoint-maintainers` team only
- **Allowed to merge**: `zeropoint-maintainers` team only
- **Allowed to dismiss reviews**: `zeropoint-maintainers` team only

### Develop Branch Protection Rules

#### **General Settings**
- **Branch name pattern**: `develop`
- **Require a pull request before merging**: ✅ **ENABLED**
- **Require approvals**: ✅ **ENABLED** (Minimum: 1)
- **Dismiss stale PR approvals when new commits are pushed**: ✅ **ENABLED**

#### **Status Checks**
- **Require status checks to pass before merging**: ✅ **ENABLED**
- **Require branches to be up to date before merging**: ✅ **ENABLED**
- **Status checks that are required**:
  - `License & Copyright Header Check`
  - `Build and Test`

#### **Restrictions**
- **Restrict pushes that create files that cannot be reviewed**: ✅ **ENABLED**
- **Require conversation resolution before merging**: ✅ **ENABLED**
- **Require signed commits**: ✅ **ENABLED**

#### **Team Restrictions**
- **Restrict who can push to matching branches**: ✅ **ENABLED**
- **Allowed to push**: `zeropoint-maintainers` team only
- **Allowed to merge**: `zeropoint-maintainers` team only

## Required Teams

### zeropoint-maintainers
- **Description**: Core maintainers with full repository access
- **Permission**: Admin
- **Members**: [Add authorized team members]
- **Responsibilities**:
  - Code review and approval
  - Merge pull requests
  - Manage repository settings
  - Enforce license compliance

### zeropoint-reviewers
- **Description**: Code reviewers with limited access
- **Permission**: Write
- **Members**: [Add authorized reviewers]
- **Responsibilities**:
  - Code review
  - Suggest changes
  - Cannot merge without maintainer approval

## Required Status Checks

### License & Copyright Header Check
- **Workflow**: `.github/workflows/license-check.yml`
- **Required for**: All branches
- **Checks**:
  - Copyright headers in all TypeScript/JavaScript files
  - LICENSE.md file exists and contains required elements
  - CONTRIBUTING.md file exists and contains required elements
  - README.md contains view-only notices

### Build and Test
- **Workflow**: `.github/workflows/build-test.yml`
- **Required for**: All branches
- **Checks**:
  - TypeScript compilation
  - Unit tests
  - Integration tests
  - Code coverage

### Security Scan
- **Workflow**: `.github/workflows/security-scan.yml`
- **Required for**: Main branch only
- **Checks**:
  - Dependency vulnerability scan
  - Code security analysis
  - License compliance check

## Enforcement Actions

### Automatic Actions
- **Failed status checks**: Block merge automatically
- **Missing copyright headers**: Block merge automatically
- **License violations**: Block merge automatically
- **Security vulnerabilities**: Block merge automatically

### Manual Actions
- **License agreement verification**: Manual review required
- **Legal compliance check**: Manual review required
- **Access control verification**: Manual review required

## Monitoring and Reporting

### Automated Monitoring
- **Daily compliance reports**: Sent to legal@zeropointprotocol.ai
- **Weekly security reports**: Sent to security@zeropointprotocol.ai
- **Monthly access reviews**: Sent to compliance@zeropointprotocol.ai

### Violation Handling
- **Immediate action**: Block access and notify legal team
- **Investigation**: 24-hour response time
- **Resolution**: Legal action if necessary
- **Documentation**: All violations logged and tracked

## Configuration Commands

### GitHub CLI Commands
```bash
# Create teams
gh api --method POST /orgs/{org}/teams -f name=zeropoint-maintainers -f description="Core maintainers with full repository access" -f privacy=closed
gh api --method POST /orgs/{org}/teams -f name=zeropoint-reviewers -f description="Code reviewers with limited access" -f privacy=closed

# Set branch protection
gh api --method PUT /repos/{owner}/{repo}/branches/main/protection -f required_status_checks='{"strict":true,"contexts":["License & Copyright Header Check","Build and Test","Security Scan"]}' -f enforce_admins=true -f required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' -f restrictions='{"users":[],"teams":["zeropoint-maintainers"]}'

# Set develop branch protection
gh api --method PUT /repos/{owner}/{repo}/branches/develop/protection -f required_status_checks='{"strict":true,"contexts":["License & Copyright Header Check","Build and Test"]}' -f enforce_admins=false -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' -f restrictions='{"users":[],"teams":["zeropoint-maintainers"]}'
```

### Web Interface Steps
1. Go to repository Settings > Branches
2. Add rule for `main` branch
3. Configure all required settings as listed above
4. Add rule for `develop` branch
5. Configure settings as listed above
6. Save changes

## Compliance Verification

### Monthly Checks
- [ ] Branch protection rules are active
- [ ] Required status checks are passing
- [ ] Team permissions are correct
- [ ] License compliance is maintained
- [ ] Access logs are reviewed
- [ ] Security scans are up to date

### Quarterly Reviews
- [ ] Legal compliance audit
- [ ] Security assessment
- [ ] Access control review
- [ ] Policy updates
- [ ] Team member verification

---

**© [2025] Zeropoint Protocol (C Corp). All Rights Reserved.**
**View-Only License: No clone, modify, run or distribute without signed license.**
**Contact legal@zeropointprotocol.ai for licensing inquiries.** 