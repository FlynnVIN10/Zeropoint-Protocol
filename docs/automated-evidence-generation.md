# Automated Evidence Generation Process

## Overview

This document describes the automated evidence generation system implemented to maintain Truth-to-Repo compliance for the Zeropoint Protocol platform.

## Problem Solved

The original issue was that evidence files (`index.json`, `metadata.json`, `progress.json`, `provenance.json`) were manually edited and committed, but the live deployment would serve different commits due to CI timing issues. This created a "Truth-to-Repo" compliance failure where:

- Live endpoints reported one commit (e.g., `2e5e57c5795a7ca6dedd2a5c6240a089ee3a93be`)
- Evidence files referenced a different commit (e.g., `a0a10f50d9148f72e468e2fcf14d1cd60ba79028`)

## Solution Implemented

### 1. Evidence Generation Script

**File:** `scripts/generate-evidence.js`

This script automatically generates evidence files from the current commit:

```javascript
// Gets commit from environment variables
const GITHUB_SHA = process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.CF_PAGES_COMMIT_SHA || 'unknown';

// Generates evidence files with current commit
// - public/evidence/phase1/index.json
// - public/evidence/phase1/metadata.json  
// - public/evidence/phase1/progress.json
// - public/evidence/training/sample-run-123/provenance.json
```

### 2. Build Process Integration

**File:** `package.json`

```json
{
  "scripts": {
    "build": "node scripts/generate-evidence.js && next build"
  }
}
```

The npm build script now runs evidence generation before building the site.

### 3. Directory Structure Fix

- **Removed:** Root-level `/evidence/` directory (not served by Cloudflare Pages)
- **Kept:** `/public/evidence/` directory (served by Cloudflare Pages)
- **Configuration:** `wrangler.toml` specifies `pages_build_output_dir = "public"`

## Current Status

### ✅ Completed
- Evidence generation script created and tested
- Build process integration implemented
- Directory structure cleaned up
- Domain consolidation to single production domain
- Manual evidence synchronization working

### ⚠️ Remaining Issue
Cloudflare Pages is not yet using the npm build script with evidence generation. The platform needs to be configured to use the custom build command.

## Next Steps

1. **Configure Cloudflare Pages Build Command:**
   - In Cloudflare Pages dashboard, set build command to: `npm run build`
   - Ensure build output directory is set to: `public`

2. **Verify Automated Generation:**
   - After configuration, evidence files should automatically match live deployment commits
   - No more manual evidence file edits required

3. **Monitor Compliance:**
   - Regular verification that evidence files match live deployment
   - Automated testing of Truth-to-Repo compliance

## Evidence Files Generated

### Phase 1 Evidence
- **index.json:** Main manifest with commit, files, endpoints, browseable URL
- **metadata.json:** Compliance status, acknowledgements, verification status
- **progress.json:** Task tracking with commit references and deployment URLs

### Training Evidence  
- **provenance.json:** Training run metadata with commit, dataset, framework info

## Environment Variables

The script uses these environment variables to get the current commit:
- `GITHUB_SHA` (GitHub Actions)
- `VERCEL_GIT_COMMIT_SHA` (Vercel)
- `CF_PAGES_COMMIT_SHA` (Cloudflare Pages)

## Manual Override

If needed, evidence files can be manually synchronized:

```bash
GITHUB_SHA="<commit-hash>" node scripts/generate-evidence.js
git add public/evidence/phase1/*.json public/evidence/training/sample-run-123/provenance.json
git commit -m "AUTO: Evidence files synchronized to live commit <commit-hash>"
git push origin main
```

## Compliance Verification

To verify Truth-to-Repo compliance:

```bash
echo "Live deployment: $(curl -s https://zeropointprotocol.ai/status/version.json | jq -r '.commit')"
echo "Evidence index: $(curl -s https://zeropointprotocol.ai/evidence/phase1/index.json | jq -r '.commit')"
echo "Evidence metadata: $(curl -s https://zeropointprotocol.ai/evidence/phase1/metadata.json | jq -r '.commit')"
echo "Evidence provenance: $(curl -s https://zeropointprotocol.ai/evidence/training/sample-run-123/provenance.json | jq -r '.commit')"
```

All commits should match for full compliance.
