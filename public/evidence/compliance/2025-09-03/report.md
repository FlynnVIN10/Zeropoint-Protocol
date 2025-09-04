# Stage 1 Compliance Report — 2025-09-03

## Summary
- Goal: Eliminate commit-lag and align evidence with deployed commit.
- Outcome: Pass. Evidence generated at build-time with deployed short SHA.

## Findings
- `/status/version.json` served and valid.
- Evidence index exists at `/evidence/verify/<SHORT>/index.json`.
- Commits match: `7cbbfdc`.
- Headers meet gate on both endpoints.

## Evidence
**A. /status/version.json headers**
```
HTTP/1.1 200 OK
Date: Thu, 04 Sep 2025 00:02:26 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Cache-Control: no-store
Content-Disposition: inline
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
content-security-policy: default-src 'self'; connect-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests
permissions-policy: accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
Vary: accept-encoding
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=E1i0cDTx0sP2i9kOnVHM9obY1an5WC%2B4HJ4SKv%2FRwgxV9WwokXdSlyTpejn6lR%2FLkxYI5iygzEiUI6nnxtmmEKjTBFzGEOkyuL1SXra5BC3hpUS6"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
cf-cache-status: DYNAMIC
CF-RAY: 979937d5ba886c44-DFW
alt-svc: h3=":443"; ma=86400
```

**B. /evidence/verify/<SHORT>/index.json headers**
```
HTTP/1.1 200 OK
Date: Thu, 04 Sep 2025 00:02:28 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Cache-Control: no-store
Content-Disposition: inline
ETag: "bb4fe39d9d368e8c33ab699134801e6c"
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
content-security-policy: default-src 'self'; connect-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests
permissions-policy: accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
x-content-type-options: nosniff
x-frame-options: DENY
Vary: accept-encoding
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=5HqPtzm%2BcQEVf2Y2FQtFnF4eOFIvkKDkhuJ5%2FPKqIZxYDgcEt6ptxYYaOMpw6KiwOpNgC4LXZe60NRhFuCJ2diYeLBTTW2tZauwE%2FHMsnmXrLmzb"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
cf-cache-status: DYNAMIC
CF-RAY: 979937ddc8997411-IAD
alt-svc: h3=":443"; ma=86400
```

**C. /status/version.json body (first 120 chars)**
```
{"phase":"stage1","commit":"7cbbfdc2a0b771de4e4ac3cc82b7b5045fdb4f37","ciStatus":"green","buildTime":"20
```

**D. /evidence/verify/<SHORT>/index.json body (first 120 chars)**
```
{"commit":"7cbbfdc","branch":"main","deployment_url":"https://210fd24c.zeropoint-protocol.pages.dev/evidence
```

## Risks
- Low: Cloudflare edge caching regressions if `_headers` modified.

## Recommendations
- Keep generator in `postbuild`.
- Keep `.gitignore` in `public/evidence/verify/`.
- Leave CI `verify-evidence.yml` required.

## Owners
- Evidence generator: DevOps
- Headers: Web
- CI gate: SCRA

