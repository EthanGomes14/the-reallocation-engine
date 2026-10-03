## 2026-10-03 — data-engineer-h1b triage v0.3.0: timeline gate removed (sample + break test)

- **Recipe:** recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md v0.3.0
- **Inputs:** same as run 2 (samples/candidates-2026-10-03.json, liveness-2026-10-03.txt, greenhouse-status-2026-10-03.json, ghost files, sponsor CSV sha256 eccdee2addf4…)
- **Commands:** `node …/triage.mjs --today 2026-10-03` · the ghost run (as in run 2) · `node --test …/triage.test.mjs`
- **Outputs:** course/2026fa/submissions/ethangomes14/runs/triage-sample/ and runs/triage-ghost/ (regenerated)
- **Result:**
  - Sample: Apply 3 · Consider 1 · Skip 1 · unscored 2 (unchanged).
  - Ghost: Skip (closed by Greenhouse API 404).
  - Timeline not evaluated (factor 1, labelled).
  - Tests 13/13. Invariant violations 0.
- **Gate decisions:** the visa-timeline gate was removed by Ethan Gomes (author's decision). Gates are now G0 input, G1 company match, G2 liveness, G3 release. **v0.3.0 needs Ethan's re-run** of the triage and tests.
- **Open issues:**
  - The tool no longer checks whether hiring can finish before the OPT deadline.
  - This departs from the assignment's "liveness and visa timeline are gates"; stated in the recipe.
