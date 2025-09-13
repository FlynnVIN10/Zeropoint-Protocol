# undefined Deployment Report

**Date:** 2025-09-13T01:17:51.192Z
**Environment:** production
**URL:** https://zeropointprotocol.ai
**Status:** DEPLOYED

## Smoke Test Results

- **Tests Passed:** 3/3
- **Status:** ✅ PASS

| Endpoint | Status | Fields Present | Result |
|----------|--------|----------------|--------|
| /api/healthz | 200 | Yes | ✅ |
| /api/readyz | 200 | Yes | ✅ |
| /status/version.json | 200 | Yes | ✅ |

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
- **Tests Passed:** 3
- **Success Rate:** 38%
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

