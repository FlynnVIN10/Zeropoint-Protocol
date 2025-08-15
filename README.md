# Zeropoint Protocol — Agentic AI Platform

[![quality](https://github.com/FlynnVIN10/Zeropoint-Protocol/actions/workflows/quality.yml/badge.svg)](../../actions/workflows/quality.yml)
[![probes](https://github.com/FlynnVIN10/Zeropoint-Protocol/actions/workflows/probes.yml/badge.svg)](../../actions/workflows/probes.yml)
[![pr-alignment](https://github.com/FlynnVIN10/Zeropoint-Protocol/actions/workflows/pr-alignment.yml/badge.svg)](../../actions/workflows/pr-alignment.yml)

> Single repo. Platform + website. Public site mirrors repo state.

## Status
- Website: Astro SSR (current), migrating to **Nuxt 3 + Nuxt UI** per CTO directive D-032.
- Probes: `/api/healthz`, `/api/readyz` return JSON with `commit` and `buildTime`.
- A11y target ≥95. All nav links 200.

## Repo Layout (current)
```
/.cloudflare        # Cloudflare config
/.github            # CI: quality, probes, PR alignment
/directives         # CTO/CEO directives
/docs               # Public docs and governance
/logs/audit         # Audit artifacts
/public             # Static assets
/scripts            # Guards and tooling
/src                # App/site source (Astro, migrating to Nuxt)
astro.config.mjs    # Astro config (to be replaced by nuxt.config)
package.json
```

## Quickstart
```bash
# Node 20+
npm ci
npm run dev
npm run build
npm run preview
```

## Environment

* `MOCKS_DISABLED=1` in production.
* `CF_PAGES_COMMIT_SHA` is injected by Cloudflare; used by probes.
* Provide `.env` from `.env.example`. No hardcoded secrets.

## Probes

```http
GET /api/healthz -> { "status":"ok", "commit":"...", "buildTime":"..." }
GET /api/readyz  -> { "ready":true, "commit":"...", "buildTime":"..." }
```

## CI Gates

* **Type check**: `astro check` (then `nuxt typecheck` post-migration)
* **Build**: must succeed
* **Boolean-leak guard**: no `>true<` or `>false<` in HTML
* **A11y**: Lighthouse ≥0.95 on key routes
* **Link check**: all links 200
* **Post-deploy probes**: `/api/healthz` and `/api/readyz` must pass

## PR Requirements

* Link to directive. Include: Root Cause, Implementation, Tests, Security/Ethics review.
* CTO review required. No self-approval.
* **Alignment line must be present and auto-updated by CI:**

  ```
  Alignment: {Synthiant:{SYNTHIANT_ALIGN}% | Human:{HUMAN_CONSENSUS}% | Divergence:{DIVERGENCE}%} (live)
  ```

  * `{SYNTHIANT_ALIGN}` = required-checks pass ratio × 100 (rounded)
  * `{HUMAN_CONSENSUS}` = approvals / required approvals × 100 (capped at 100)
  * `{DIVERGENCE}` = absolute difference

## Migration Note (D-032)

* New website shell: **Nuxt 3 + Nuxt UI** on Cloudflare Pages (Nitro preset).
* Folder `web/` will contain the Nuxt app; cutover after parity and A11y checks.

## License

See `license/`.
