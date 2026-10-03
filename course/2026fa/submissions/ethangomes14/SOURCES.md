# Sources and contributions

## Executive summary

**What this is.** Credits for everything this submission builds on, and a plain account of what the AI assistant did versus what I (EthanGomes14) decided, checked, changed or rejected.

**Why read it.** So a reviewer can tell borrowed material from new work, and AI output from human judgment.

**What it says.** The data, scorer, liveness checker and governing rules all come from the instructor's repository. The new code and documents were drafted by Claude (Claude Code) in a session I directed. The scope, persona, rules and labelling decisions were mine.

---

## Starting point

| Source | What was used | Changed? |
|---|---|---|
| The Reallocation Engine, `github.com/nikbearbrown/the-reallocation-engine` @ `015843d` (forked to `EthanGomes14/the-reallocation-engine`) | The whole repo as the base | Only new files in my namespaces |
| `SNICKERDOODLE.md`, `DOMAIN.md`, `CONTRIBUTING.md`, `DATA_CONTRACT.md`, `recipes/_shared.md` | Governing rules, lifecycle, labels, run-log template, privacy rules | No |
| `recipes/local-wage-adjustment.md` and `.card.md`, `recipes/scan.md` | Style models for the recipe and card | No |
| `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` (80 Days to Stay) | Sponsorship records | No (read-only) |
| `scripts/score/role-scorer.mjs` | The scorer, called through its CLI | No |
| `scripts/ats/check-liveness.mjs` (`npm run ats:liveness`) | Posting liveness | No |
| `data/examples/ch11-roles.json` | Input shape and the tier p values (0.9 / 0.6 / 0.4) | No |
| `scripts/conformance.mjs`, `scripts/doctor.mjs`, `scripts/pii-scan.mjs` | Checks | No |
| Assignment brief: INFO 7375, "The Reallocation Engine — Recipe Design Assignment" | Requirements and rubric | — |
| Public Greenhouse job-board API, `boards-api.greenhouse.io` | Finding the 7 sample postings (2026-10-03), and the 404/200 cross-check of the liveness false positive | — |
| 8 CFR 214.2(f)(10)(ii)(E) | The 90-day OPT unemployment limit. Cited from general knowledge; not independently re-verified in this session. | — |

No other students' work and no human collaborators were used.

## Tools

- **Claude (Claude Code, model Claude Opus 5.5).** Repo research, code, tests, documents, running commands.
- Node.js (v25.8.0 locally), Python 3.9 (an independent CSV cross-check script, not committed), git, curl.

## What the AI contributed

- Read the assignment, the policy pages and the repo; summarized requirements and pointed out the conflicting path rule.
- Measured the data: Data Engineer-family sponsor counts, the six-state coverage, and the zero Form D overlap.
- Found and documented:
  - the liveness false positive
  - the scorer's silent defaults (missing gate = open, missing vote dropped, "authorized" profile switches sponsorship off)
  - the PII scanner's `profile.yml` rule
  - the upstream `package-lock.json` scan finding
- Drafted `CHANGE-BRIEF.md`, the persona file, the recipe and card, all prototype code, the tests and fixtures, and every report in this folder.
- Rated the fit of the 7 sample postings (labelled `model-judgment`).
- Proposed the title family, exclusions and tier rule.
- Ran every command whose output is pasted in `TEST-REPORT.md` and `WORKED-RUN.md`, including the clean-checkout run, and fixed the three bugs it found.
- Built the v0.2.0 Greenhouse liveness cross-check at my request (`fetch-greenhouse-status.mjs`, the API check in gate G2, 3 new tests) and the priority list at the top of the report, which I asked for.

## What I decided, checked, changed or rejected

- **Decided:**
  - the domain (H-1B sponsorship for Data Engineer roles) and the branch name
  - to exclude STEM OPT / E-Verify
  - to use a fictional persona with none of my personal details
  - to widen the target to every title doing Data Engineer work
  - to keep the tier rule
  - to list the brand → legal-name alias table and dated visa data as the recipe's two proposed additions
  - to have Claude rate fit
  - to label the sponsorship score `model-judgment`
  - to set a 90-day limit with a 10-day buffer (later, in v0.3.0, to remove the visa-timeline gate against Claude's advice, then in v0.4.0 to restore it after checking the recipe against the assignment)
- **Confirmed:** the failure cases and predictions before they were frozen (commit `ab51f69`).
- **Corrected by Claude, accepted by me:** "80 days" vs. the 90-day regulation.
- **Changed by Claude against my wording, then accepted by me:** I originally asked for fit to use both the sponsorship tier and the job role. Claude made it role-only because sponsorship already has its own vote in the scorer, and counting it again inside fit would double-count the same evidence. I kept the role-only version.
- **Rejected:** Claude's multiple-choice question form, in favour of giving the information myself.
- **Checked myself so far:**
  - read the change brief in my editor before confirming the failure cases and predictions
  - asked Claude to explain each git command (`remote add upstream`, renaming a branch) before letting it run
  - opened the sample run's JSON log and the worked run to see the actual output
  - confirmed which GitHub account and remote would be used before allowing any push
  - re-ran the screen and the tests on my own laptop twice: at v0.1.0 (12 tests) and again at v0.3.1 after the changes and the rename (13 tests), and at v0.4.0 after the timeline gate was restored (15 tests), with the same results every time: same results (Apply 3 · Consider 1 · Skip 1 · unscored 2; 12/12 pass)
  - hand-checked the top Apply result against the raw CSV: `SIGMA COMPUTING INC` shows 136.0 approvals and "Senior Analytics Engineer" among its titles, matching the report
  - opened all six "active" job links from the report (gate G2); each opened the listed job
- **Still open for me:**
  - whether the code behaves the same on Node 20, which CI uses
  - where the scorer's own weights (0.35 sponsorship, 0.30 fit) and the 0.30 Apply threshold come from (they are the repo's, from the book's Chapter 11, not mine)

I am responsible for everything submitted here and can be asked to explain any gate, number or line.
