# undefined Deployment Report

**Date:** 2025-09-13T01:17:44.179Z
**Environment:** staging
**URL:** https://staging.zeropointprotocol.ai
**Status:** DEPLOYED

## Smoke Test Results

- **Tests Passed:** 0/3
- **Status:** ❌ FAIL

| Endpoint | Status | Fields Present | Result |
|----------|--------|----------------|--------|
| /api/healthz | error | No | ❌ |
| /api/readyz | error | No | ❌ |
| /status/version.json | error | No | ❌ |

## Lighthouse Audit Results

- **Overall Score:** 94/100
- **Accessibility:** 98/100
- **Performance:** 95/100
- **Best Practices:** 92/100
- **SEO:** 90/100

## Environment Flags Verification

- **Tests Passed:** 0/5
- **Status:** ❌ FAIL

| Endpoint | Status | Compliance Message | Result |
|----------|--------|-------------------|--------|
| /api/training/metrics | error | No | ❌ |
| /api/ai/reasoning | error | No | ❌ |
| /api/ai/models | error | No | ❌ |
| /api/quantum/compute | error | No | ❌ |
| /api/ml/pipeline | error | No | ❌ |

## Overall Deployment Status

- **Total Tests:** 8
- **Tests Passed:** 0
- **Success Rate:** 0%
- **Overall Status:** ❌ FAILED

## Compliance Status

- **MOCKS_DISABLED:** ✅ Enabled
- **Dual Consensus:** ✅ Enabled
- **Evidence Generation:** ✅ Enabled

## Recommendations

- ❌ Deployment issues detected
- ❌ Some tests failed
- ❌ Environment flags need attention
- ❌ Additional work required

