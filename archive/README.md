# Archive

This directory contains deprecated or vendored code moved out of active production paths to satisfy repo hygiene and security constraints.

Rationale:
- Remove vendored TinyGrad from active tree to avoid drift and licensing/maintenance risks.
- Prefer installing TinyGrad via `pip` or using submodule in isolated areas only for development.
- Keep history intact while preventing accidental production coupling.

Refer to `docs/RUN_LOCAL_TRAINING.md` for installing TinyGrad and running local training jobs that write evidence under `evidence/training/`.


