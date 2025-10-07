# Smoke Commands (Localhost Testing)

**Date:** 2025-10-07  
**Status:** ⏳ PENDING (requires `npm run dev`)

---

## Commands to Execute

### 1. Start Server
```bash
npm run dev
# Wait for: Ready on http://localhost:3000
```

### 2. Test /api/healthz
```bash
curl -si http://localhost:3000/api/healthz | grep -Ei 'HTTP/1.1 200|application/json|no-store|nosniff|content-disposition: inline'
```

**Expected Output:**
```
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-store
x-content-type-options: nosniff
content-disposition: inline
```

### 3. Test /api/readyz
```bash
curl -si http://localhost:3000/api/readyz | grep -Ei 'HTTP/1.1 200|application/json|no-store|nosniff|content-disposition: inline'
```

**Expected Output:**
```
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-store
x-content-type-options: nosniff
content-disposition: inline
```

### 4. Verify version.json
```bash
jq -r '.phase,.commit,.ciStatus,.buildTime' public/status/version.json
```

**Expected Output:**
```
Dev
local
local
2025-10-07T19:30:00.000Z
```

### 5. Test Full Responses
```bash
curl -s http://localhost:3000/api/healthz | jq .
curl -s http://localhost:3000/api/readyz | jq .
```

**Expected healthz:**
```json
{
  "ok": true,
  "service": "web",
  "now": "2025-10-07T..."
}
```

**Expected readyz:**
```json
{
  "ready": true,
  "checks": {
    "db": true
  },
  "now": "2025-10-07T..."
}
```

---

## Acceptance

**All tests must pass:**
- ✅ healthz returns 200 with all required headers
- ✅ readyz returns 200 with all required headers
- ✅ version.json fields present and correct
- ✅ JSON responses valid

**Once complete:**
1. Paste actual outputs into this file
2. Commit updated smoke.md
3. Reference in SCRA verification

---

**Status:** ⏳ Awaiting localhost test execution

