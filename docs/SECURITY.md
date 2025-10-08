# Security Policy
**Zeropoint Protocol - Local Runtime**

---

## Security Principles

### 1. No Secrets in Repository ✅

- **Never commit** `.env` files with real credentials
- **Use** `.env.local.example` as template only
- **Store** secrets in `.env.local` (gitignored)

### 2. Local Development Security

**Default Security Posture:**
- Runs on localhost:3000 (not exposed to network)
- No authentication required (single-user local)
- SQLite database with standard file permissions
- No TLS (local HTTP only)

### 3. Reporting Security Issues

**Process:**
1. Create GitHub issue with tag `security`
2. Tag `@CTO` in PR comment
3. Do not disclose vulnerabilities publicly until patched

**Response Time:**
- Critical: 24 hours
- High: 72 hours
- Medium: 1 week

---

## CI Security Gates

### Pre-Merge Checks

CI will **block merge** if:
- ✅ Secrets detected (`.env` files, API keys, passwords)
- ✅ Backup files present (`*.backup.*`)
- ✅ Database files committed (`*.db`)
- ✅ Build fails
- ✅ Type check fails

### Detection Rules

```bash
# Secrets detection
git diff --cached | grep -E 'API_KEY|PASSWORD|SECRET|TOKEN'

# Backup files
git ls-files | grep '\.backup\.'

# Database files
git ls-files | grep '\.db$'
```

---

## Local Security Checklist

### Development

- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Never commit `.env.local`
- [ ] Use random secrets for JWT/session (if implemented)
- [ ] Keep `dev.db` in `.gitignore`
- [ ] Run on localhost only (not 0.0.0.0)

### Production (Tinybox Green)

- [ ] Use strong secrets
- [ ] Enable firewall rules
- [ ] Consider reverse proxy (nginx)
- [ ] Implement rate limiting
- [ ] Add authentication
- [ ] Enable HTTPS
- [ ] Regular security updates

---

## Sensitive Data

### Never Commit

- `.env*` files (except `.env.local.example`)
- `*.db` database files
- `*.pem`, `*.key` certificate files
- API keys, tokens, passwords
- Session secrets

### Always `.gitignore`

```gitignore
.env*
!.env.local.example
*.db
*.db-shm
*.db-wal
*.pem
*.key
```

---

## Dependency Security

### Audit Commands

```bash
# NPM audit
npm audit

# Check for outdated packages
npm outdated

# Update dependencies
npm update
```

### CI Automation

- **npm audit** runs on every PR
- **Dependency Review** (GitHub Action)
- **CodeQL** scanning for vulnerabilities

---

## Security Advisories

### Active Vulnerabilities (2025-10-07)

| Package | Installed | CVE | Severity | Path | Fixed Version | Action Taken |
|---------|-----------|-----|----------|------|---------------|--------------|
| next | 15.0.4 | CVE-2025-XXXXX | Critical | Direct dependency | 15.1.0+ (when available) | Monitoring upstream; DoS mitigation via rate limiting planned |

**Details:**
- **Vulnerability:** Next.js Server Actions Denial of Service
- **Impact:** Potential DoS attack vector via Server Actions
- **Mitigation:** Local-only deployment (not exposed to public internet), rate limiting to be implemented
- **Status:** Monitoring Next.js releases for patch
- **Evidence:** `/public/evidence/compliance/2025-10-07/npm-audit.json`

**Last Audit:** 2025-10-07  
**Next Review:** Weekly (Fridays) or on Next.js release

---

## Incident Response

### If Secrets Committed

1. **Immediately rotate** the exposed secret
2. **Remove from git history:**
   ```bash
   git filter-repo --path .env --invert-paths
   ```
3. **Force push** (if absolutely necessary)
4. **Notify team** via issue

### If Vulnerability Found

1. **Create security issue** (private if critical)
2. **Tag @CTO** for review
3. **Implement fix** ASAP
4. **Deploy patch** immediately
5. **Document** in CHANGELOG

---

## Best Practices

### Code

- ✅ Validate all user inputs
- ✅ Use parameterized queries (Prisma handles this)
- ✅ Sanitize output for XSS prevention
- ✅ Implement CSRF protection (if adding auth)

### Dependencies

- ✅ Regular updates (`npm update`)
- ✅ Audit before merge (`npm audit`)
- ✅ Minimal dependencies
- ✅ Pin versions in production

### Operations

- ✅ Run as non-root user
- ✅ Limit file permissions (chmod 600 .env.local)
- ✅ Monitor logs for suspicious activity
- ✅ Regular backups of dev.db

---

## Future Security Enhancements

### Authentication & Authorization

- [ ] JWT-based authentication
- [ ] Role-based access control (RBAC)
- [ ] Session management
- [ ] Password hashing (bcrypt/argon2)

### Network Security

- [ ] HTTPS (Let's Encrypt)
- [ ] CORS configuration
- [ ] Rate limiting (express-rate-limit)
- [ ] DDoS protection

### Data Security

- [ ] Encryption at rest (SQLCipher)
- [ ] Encryption in transit (TLS)
- [ ] Secure session storage
- [ ] Data anonymization

---

## Compliance

### Current Status

- ✅ No secrets in repository
- ✅ `.gitignore` comprehensive
- ✅ CI security gates active
- ✅ Dependency audit automated

### SCRA Requirements

- ✅ Dual-consensus governance
- ✅ Evidence trail maintained
- ✅ Audit logs preserved
- ✅ Truth-to-repo alignment

---

## Contact

**Security Issues:** Create GitHub issue with `security` tag  
**CTO Escalation:** Tag `@CTO` in issue/PR  
**Emergency:** Contact CTO directly via approved channels

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-07  
**Platform:** Local macOS Runtime  
**Status:** Post-Cloudflare Migration

