# Security Headers Documentation
**Zeropoint Protocol - Security Hardening**

---

## Overview

This document describes the security headers configured for Zeropoint Protocol to protect against common web vulnerabilities and ensure secure communication.

---

## Configured Headers

### Global Headers (All Routes)

#### Content-Security-Policy (CSP)
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
style-src 'self' 'unsafe-inline'; 
img-src 'self' data: https:; 
connect-src 'self' https:; 
font-src 'self' data:; 
object-src 'none'; 
base-uri 'self'; 
form-action 'self'; 
frame-ancestors 'none'; 
upgrade-insecure-requests;
```

**Purpose:** Prevents XSS attacks, clickjacking, and unauthorized resource loading

**Notes:**
- `'unsafe-inline'` and `'unsafe-eval'` currently allowed for Next.js compatibility
- Consider implementing nonce-based CSP in future for stricter security

#### Strict-Transport-Security (HSTS)
```
max-age=15552000; includeSubDomains; preload
```

**Purpose:** Forces HTTPS connections for 180 days (6 months)

**Compliance:**
- ✅ Meets SCRA requirement (≥15552000 seconds)
- ✅ includeSubDomains enabled
- ✅ preload flag set

#### Cross-Origin-Opener-Policy (COOP)
```
same-origin
```

**Purpose:** Isolates browsing context from cross-origin windows

#### Cross-Origin-Embedder-Policy (COEP)
```
require-corp
```

**Purpose:** Prevents loading cross-origin resources without explicit permission

#### Referrer-Policy
```
no-referrer
```

**Purpose:** Prevents leaking referrer information to third parties

#### X-Content-Type-Options
```
nosniff
```

**Purpose:** Prevents MIME type sniffing

#### X-Frame-Options
```
DENY
```

**Purpose:** Prevents clickjacking by blocking iframe embedding

#### Permissions-Policy
```
geolocation=(), microphone=(), camera=(), payment=(), usb=()
```

**Purpose:** Disables unnecessary browser APIs

#### Cache-Control
```
no-store
```

**Purpose:** Prevents caching of sensitive data

---

### API-Specific Headers (/api/*)

```
Content-Type: application/json; charset=utf-8
Cache-Control: no-store
X-Content-Type-Options: nosniff
Content-Disposition: inline
Strict-Transport-Security: max-age=15552000; includeSubDomains; preload
```

**Purpose:** Ensures API responses are properly typed, not cached, and secure

---

### Status Endpoint Headers (/status/*)

```
Content-Type: application/json; charset=utf-8
Cache-Control: no-store, no-cache, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0
X-Content-Type-Options: nosniff
X-Cache-Status: BYPASS
Strict-Transport-Security: max-age=15552000; includeSubDomains; preload
```

**Purpose:** Ensures status endpoints always return fresh data with no caching

---

## Implementation

### Configuration Files

**Primary:** `_headers` (root)  
**Public:** `public/_headers` (served by Cloudflare Pages)

**Note:** Cloudflare Pages may require additional configuration via dashboard or Next.js middleware for full header enforcement on edge functions.

---

## Verification

### Manual Verification
```bash
# Check homepage headers
curl -I https://zeropointprotocol.ai/

# Check API headers
curl -I https://zeropointprotocol.ai/api/healthz

# Check status headers
curl -I https://zeropointprotocol.ai/status/version.json
```

### Automated Verification

**Lighthouse CI:**
- Security audit runs on every PR
- Target score: A grade

**SecurityHeaders.com:**
```bash
curl -I https://zeropointprotocol.ai/ | grep -E "Content-Security|Strict-Transport|Referrer|X-Frame"
```

**Expected Grade:** A or A+

---

## Security Score Targets

| Tool | Current | Target |
|------|---------|--------|
| Lighthouse Security | Pending | A |
| SecurityHeaders.com | Pending | A+ |
| Mozilla Observatory | Pending | A+ |

---

## Compliance

### CTO Requirements ✅
- ✅ CSP defined
- ✅ HSTS ≥15552000 seconds
- ✅ COOP/COEP enabled
- ✅ Referrer-Policy: no-referrer
- ✅ X-Content-Type-Options: nosniff
- ✅ Permissions-Policy restrictive

### SCRA Requirements ✅
- ✅ Headers documented
- ✅ Verification process defined
- ✅ Targets established
- ✅ Compliance tracked

---

## Future Enhancements

### Stricter CSP (Nonce-Based)
```
script-src 'self' 'nonce-{RANDOM}';
style-src 'self' 'nonce-{RANDOM}';
```

**Benefit:** Removes need for 'unsafe-inline' and 'unsafe-eval'

**Implementation:** Requires Next.js middleware to inject nonces

### Subresource Integrity (SRI)
```html
<script src="..." integrity="sha384-..." crossorigin="anonymous"></script>
```

**Benefit:** Ensures third-party scripts haven't been tampered with

**Implementation:** Add to build process

### Report-URI / report-to
```
report-uri /api/csp-report;
report-to csp-endpoint;
```

**Benefit:** Monitor CSP violations

**Implementation:** Create `/api/csp-report` endpoint

---

## Incident Response

### CSP Violation
1. Check `/api/csp-report` logs
2. Identify violating resource
3. Either add to allowlist or remove resource
4. Update CSP directive

### HSTS Issues
1. Verify certificate validity
2. Check HTTPS redirect configuration
3. Verify max-age value
4. Check preload list submission

---

## References

- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN - Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [SecurityHeaders.com](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-07  
**Author:** Dev Team (AI)  
**Approval:** CTO ✔ | SCRA ✔

