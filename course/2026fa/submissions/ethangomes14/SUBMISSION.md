Assignment: The Reallocation Engine — Recipe Design Assignment
Student: Ethan Gomes
GitHub handle: EthanGomes14
Domain / situation: International F-1 master's student in the final semester before post-completion OPT, seeking new-grad Data Engineer (and same-work titles) roles anywhere in the US, needing H-1B sponsorship. Worked example uses the fictional persona "Electrifier" (OPT 2027-03-01, practical deadline 2027-05-20).
Recipe path: recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md (+ .card.md)
Prototype command: node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs --today 2026-10-03
  Test command: node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.test.mjs
GitHub repository / branch / PR URL: https://github.com/EthanGomes14/the-reallocation-engine / contrib/2026fa-ethangomes14-data-engineer-h1b / ✍️ (PR URL after opening)
Submitted commit SHA: ✍️ (final commit hash after the last push; do not put it in the same commit)
Lifecycle stage claimed: RUNNABLE-SAMPLE (2 open TODOs, both proposed additions off the sample path; caveat stated in the recipe)
Summary of my changes:
  - Recipe and card for Data Engineer H-1B sponsor screen: title-family sponsorship vote from the 80 Days to Stay CSV, liveness gate from ats:liveness output plus a Greenhouse API cross-check, OPT timeline gate with a "cannot start before OPT" floor.
  - Offline prototype that calls the existing role-scorer.mjs unchanged and writes a JSON log plus a Markdown report, with every value labelled record / model-judgment / your-input.
  - v0.2.0: Greenhouse liveness cross-check (the only network step, host boards-api.greenhouse.io) that closes postings the liveness checker wrongly calls active, plus a priority list at the top of the report.
  - v0.3.0 removed the visa-timeline gate; v0.4.0 restored it so the recipe meets the assignment's "liveness and visa timeline are gates" requirement. v0.3.1 renamed the program to sponsor-screen.
  - 15 offline tests (F1–F7, the cross-check, and four break attempts including a BROKEN scorer).
  - Sample run on 7 real postings (Apply 3 · Consider 1 · Skip 1 · unscored 2), a clean-checkout test report, worked run, justification, run log, Frictional log and sources.
Known limitations:
  - Approvals are undated and company-wide.
  - Sponsor data covers companies headquartered in 6 states only.
  - Exact name matching misses brand vs. legal names (Gemini would have been an Apply).
  - The liveness checker can call a redirected dead posting active; the API cross-check catches this only for Greenhouse links.
  - Fit is Claude's rating from titles only.
  - The sample was biased toward sponsors.
  - Not run locally on Node 20 (CI's version); CI runs when the PR is opened.
  - E-Verify, funding and wages are out of scope.
