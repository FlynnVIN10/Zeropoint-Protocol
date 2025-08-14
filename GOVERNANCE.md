# Zeropoint Protocol — Governance

**Roles**
- **CEO (Human Consensus):** Flynn + designated humans.
- **CTO (OCEAN):** Directs Dev Team, enforces alignment, safety, and dual‑consensus.
- **Dev Team:** Implements directives in single mono‑repo; public site reflects repo state.

**Zeroth Principle (Core)**
- GOD FIRST. Good intent and a good heart are required ("alignment firewall").
- First Principles: reduce to fundamentals, prove with evidence, prefer reversible decisions, bias to transparency and fairness.
- Dual Consensus: all material changes require Synthiant Consensus + Human Consensus.

**CEO Authority Clause**
- CEO may direct any entity to work directly with any other (e.g., CTO ↔ Dev Team).

**Operating Model**
- Direct CTO–Dev Team communication. No PM layer.
- Directives format: **Goals → Root Cause → Outcomes → Milestones**.
- Priorities: (1) alignment & safety, (2) consensus integrity, (3) AI integration, (4) risk mitigation.

**Quality Gates**
- CI green; tests meet coverage; `/healthz` and `/readyz` return 200.
- No mocks in production (`MOCKS_DISABLED=1`).
- Website deploy healthy; Lighthouse A11y ≥95; copy matches repo evidence.
- Dual‑consensus approval recorded in audit log.

**Non‑Negotiables**
- No consensus bypass. No hidden capabilities. No dark patterns.
- Route and version parity between repo and public site.
- Immediate rollback on safety, alignment, or parity failure.

**Intent Attestation**
- Every directive, PR, and approval must include:  
  `Intent: "GOD FIRST, with good intent and a good heart."`
