# Dev Team — Engineering Standards and Workflow

**Reporting & Scope**
- Implement CTO directives in the mono‑repo. Platform and website live together.
- Public site must reflect repo state.

**Principles**
- GOD FIRST. Alignment firewall in effect.
- Dual Consensus before merge/deploy.

**Engineering Standards**
- Stack: TypeScript (strict), Node.js 20+, Express, PostgreSQL, Docker; Next.js 14 (App Router) + MDX + Tailwind.
- TDD: write tests first. Coverage ≥90% unit, ≥80% integration.
- ESLint + Prettier. No hardcoded secrets. Provide `.env.example`.

**Compliance Guards** *(build fails if violated)*
- `MOCKS_DISABLED=1` in production. No stubs/placeholders.
- Route and version parity enforced; link check passing.
- Lighthouse A11y ≥95 on public routes.
- Use "Synthient/Synthients" consistently.

**Delivery Workflow**
- Branch names: `feat/*`, `fix/*`, `docs/*`.
- PR must include: Root Cause, Implementation Details, Tests, Security/Ethics review.
- Add Intent line:  
  `Intent: "GOD FIRST, with good intent and a good heart."`
- Reviews: no self‑approval; CTO sign‑off required.
- Merge only when CI green, consensus evidence attached, Verification Gate passed.
- Deploy via approved pipelines; verify smoke + parity post‑deploy.

**Documentation**
- Update `README.md` and `/docs` for every feature.
- Update `/docs/v1` and `/library` on API/SDK/UI changes.
- Maintain architecture diagrams for major changes.

**Communication**
- Daily status to CTO: progress, blockers, next steps.
- Escalate blockers >30 minutes with root cause, impact, ETA, rollback.

**Non‑Negotiables**
- No consensus bypass. No hidden capabilities. No dark patterns.
- No divergence between repo facts and public site content.
- Immediate rollback on safety, alignment, or parity failure.
