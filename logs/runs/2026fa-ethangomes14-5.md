## 2026-10-03 — data-engineer-h1b sponsor screen v0.4.0: timeline gate restored (sample + break test + post-deadline)

- **Recipe:** recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md v0.4.0
- **Change:** visa-timeline gate (G3) restored from the original v0.1.0 code; the release gate is G4 again. Two typed TODOs added to the recipe.
- **Inputs:** same as runs 2–4 (persona `visa_timeline` used again).
- **Commands:**
  - `node …/sponsor-screen.mjs --today 2026-10-03`
  - the ghost run (`--out-dir course/2026fa/submissions/ethangomes14/runs/screen-ghost`)
  - `node …/sponsor-screen.mjs --today 2027-06-01 --out-dir /tmp/de-h1b-late`
  - `node --test …/sponsor-screen.test.mjs`
- **Outputs:** course/2026fa/submissions/ethangomes14/runs/screen-sample/ · runs/screen-ghost/ (regenerated)
- **Result:**
  - Sample: Apply 3 · Consider 1 · Skip 1 · unscored 2; timeline factor 1 (slack 80 days).
  - Ghost: Skip (API 404).
  - Post-deadline: Skip 5 · unscored 2 (slack −57).
  - Tests 15/15. Invariant violations 0.
- **Gate decisions:** Ethan Gomes re-ran `sponsor-screen.mjs` and the 15 tests on his own laptop on 2026-10-03, with identical results; the attestation in `WORKED-RUN.md` covers v0.4.0.
- **Open issues:** the two recipe TODOs (alias table; dated visa data).
