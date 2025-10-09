# Repository Guard Configuration

**Date**: 2025-10-09T19:05:00Z  
**Repository**: https://github.com/FlynnVIN10/Zeropoint-Protocol

## Branch Protection (main)

**Status**: ⏳ Manual GitHub UI configuration required

### Required Settings
- [x] Require pull request before merging
- [ ] Require status checks to pass: `ci-local`
- [ ] Require at least 1 approving review (CTO or SCRA)
- [ ] Dismiss stale reviews on new commits
- [ ] Require review from Code Owners
- [ ] Block force pushes
- [ ] Block deletions

### Coverage Gate
- Fail merge if coverage < baseline
- Enforce via CI workflow

## Secret Scanning

**Status**: ⏳ Manual GitHub repository settings required

### Configuration
- [ ] Enable secret scanning
- [ ] Enable push protection
- [ ] Alert on token/credential detection

### Ignore Patterns (`.gitignore`)
```
.env*
*.pem
*.key
*.backup.*
id_*
.venv*/
petals-*.log
petals-*.pid
```

## CI Workflow

**File**: `.github/workflows/ci-local.yml`  
**Scope**: build/test/lint/typecheck/coverage only (no deploy)

### Jobs
1. Build: `npm run build`
2. Test: `npm test`
3. Lint: `npm run lint`
4. Typecheck: `tsc --noEmit`
5. Coverage: Report to PR, fail if < baseline

## Toolchain Pins

### Node.js
- **Version**: 20.x
- **Source**: `.nvmrc`
- **Manager**: nvm

### npm
- **Version**: 10.x
- **Lock**: `package-lock.json`
- **Install**: `npm ci` only (no `npm install`)

## Evidence

Per CTO directive, the following manual steps are required:

1. Navigate to: https://github.com/FlynnVIN10/Zeropoint-Protocol/settings/branches
2. Add rule for `main` branch with protections listed above
3. Navigate to: https://github.com/FlynnVIN10/Zeropoint-Protocol/settings/security_analysis
4. Enable secret scanning and push protection
5. Screenshot configuration and save as `repo-guards.png`

**Current Status**: Configuration verified in code; GitHub UI steps pending CEO/CTO approval.

---

**Note**: All local enforcement (gitignore, CI workflow) is complete. Only GitHub organization-level settings require manual intervention.

