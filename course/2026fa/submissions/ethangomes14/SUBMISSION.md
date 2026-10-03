Assignment: The Reallocation Engine — Recipe Design Assignment
Student: ✍️ (your name, as on Canvas)
GitHub handle: EthanGomes14
Domain / situation: International F-1 master's student in the final semester before post-completion OPT, seeking new-grad Data Engineer (and same-work titles) roles anywhere in the US, needing H-1B sponsorship. Worked example uses the fictional persona "Electrifier" (OPT 2027-03-01, practical deadline 2027-05-20).
Recipe path: recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md (+ .card.md)
Prototype command: node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03
  Test command: node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.test.mjs
GitHub repository / branch / PR URL: https://github.com/EthanGomes14/the-reallocation-engine / contrib/2026fa-ethangomes14-data-engineer-h1b / ✍️ (PR URL after opening)
Submitted commit SHA: ✍️ (final commit hash after the last push; do not put it in the same commit)
Lifecycle stage claimed: RUNNABLE-SAMPLE (with the SPECIFIED caveat stated in the recipe: 3 open TODOs, all v0.2 proposals off the sample path)
Summary of my changes:
  - Recipe and card for Data Engineer H-1B sponsor triage: title-family sponsorship vote from the 80 Days to Stay CSV, liveness gate from ats:liveness output, OPT timeline gate with a "cannot start before OPT" floor.
  - Offline prototype that calls the existing role-scorer.mjs unchanged and writes a JSON log plus a Markdown report, with every value labelled record / model-judgment / your-input.
  - 12 offline tests (F1–F7 and three break attempts, including a BROKEN scorer).
  - Sample run on 7 real postings (Apply 3 · Consider 1 · Skip 1 · unscored 2), a clean-checkout test report, worked run, justification, run log, Frictional log and sources.
Known limitations:
  - Approvals are undated and company-wide.
  - Sponsor data covers companies headquartered in 6 states only.
  - Exact name matching misses brand vs. legal names (Gemini would have been an Apply).
  - The liveness checker can call a redirected dead posting active.
  - Fit is Claude's rating from titles only.
  - The sample was biased toward sponsors.
  - Not run on Node 20 or in CI before the PR.
  - E-Verify, funding and wages are out of scope.
