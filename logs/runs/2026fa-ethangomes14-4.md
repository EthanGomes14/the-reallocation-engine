## 2026-10-03 — data-engineer-h1b sponsor screen v0.3.1: rename re-run (sample + break test)

- **Recipe:** recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md v0.3.1
- **Change:** program renamed `triage.mjs` → `sponsor-screen.mjs` (tests, outputs and output folders renamed to match). No logic change.
- **Inputs:** same as runs 2 and 3.
- **Commands:**
  - `node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs --today 2026-10-03`
  - the ghost run with `--out-dir course/2026fa/submissions/ethangomes14/runs/screen-ghost`
  - `node --test …/sponsor-screen.test.mjs`
- **Outputs:** course/2026fa/submissions/ethangomes14/runs/screen-sample/ · runs/screen-ghost/
- **Result:** identical to run 3. Apply 3 · Consider 1 · Skip 1 · unscored 2; ghost Skip (API 404); timeline not evaluated; tests 13/13.
- **Gate decisions:** Ethan Gomes re-ran `sponsor-screen.mjs` and the 13 tests on his own laptop on 2026-10-03, with identical results. The attestation in `WORKED-RUN.md` now covers v0.3.1.
- **Open issues:** none new. The sample stays at 7 postings (expansion to 20–30 considered and deferred by Ethan Gomes).
