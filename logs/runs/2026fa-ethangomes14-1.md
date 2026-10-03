## 2026-10-03 — data-engineer-h1b screen (sample)

- **Recipe:** recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md v0.1.0
- **Inputs:** scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/candidates-2026-10-03.json (7 real postings) · samples/liveness-2026-10-03.txt (checked 2026-10-03) · fixtures/persona-electrifier.json (fictional) · data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv (sha256 eccdee2addf4…, 30,369 rows) · rules.json
- **Command:** `node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03`
- **Outputs:** course/2026fa/submissions/ethangomes14/runs/screen-sample/screen-log.json · screen-report.md · roles.json · role-scores.json · role-scores.md
- **Result:** 7 candidates → Apply 3 (Sigma Computing, Klaviyo, Gusto) · Consider 1 (Airbnb) · Skip 1 (Stripe, liveness uncertain) · unscored 2 (`not-in-csv`: Gemini, Robinhood). Invariant violations 0. Timeline factor 1 (earliest start 2027-03-01, deadline 2027-05-20, slack 80 days). Clean-checkout re-run identical except `generated_at`. Tests 12/12.
- **Gate decisions:**
  - G1: Claude checked the 5 matched CSV rows with an independent parser; all match. Ethan Gomes hand-checked the Sigma Computing row (136 approvals, "Senior Analytics Engineer").
  - G2: cleared by Ethan Gomes on 2026-10-03. All 6 "active" links opened the listed job.
  - G3: persona inputs set by Ethan Gomes on 2026-10-03 (OPT 2027-03-01, 10-day buffer, 45-day lag).
  - G4: report read by Ethan Gomes; sample run and tests re-run on his laptop with identical results.
- **Open issues:**
  - Brand vs. legal name misses (Gemini would be Proven/Apply under its legal name).
  - Sample biased toward sponsors, so the skip-rate prediction was not fairly tested.
  - Six-state coverage not exercised.
  - "Consider" next-action text is wrong for band-Considers.
  - Liveness checker reports redirected dead postings as active.
  - Not run on Node 20.
  - The working-tree pii-scan finding is in the upstream `package-lock.json` (not this branch).
