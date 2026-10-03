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
- Set a repo-local GitHub noreply commit identity to keep a personal email out of public history.

## What I decided, checked, changed or rejected

- **Decided:**
  - the domain (H-1B sponsorship for Data Engineer roles) and the branch name
  - to exclude STEM OPT / E-Verify
  - to use a fictional persona with none of my personal details
  - to widen the target to every title doing Data Engineer work
  - to keep the tier rule
  - to have Claude rate fit
  - to label the sponsorship score `model-judgment`
  - to set a 90-day limit with a 10-day buffer
- **Confirmed:** the failure cases and predictions before they were frozen (commit `35c1bcb`).
- **Corrected by Claude, accepted by me:** "80 days" vs. the 90-day regulation.
- **Changed by Claude against my wording:** fit is role-only, not role plus sponsorship tier (to avoid double-counting). ✍️ my verdict:
- **Rejected:** Claude's multiple-choice question form, in favour of giving the information myself.
- ✍️ **Checked myself:** (list what you re-ran, read or looked up by hand)
- ✍️ **Still don't fully understand:**

I am responsible for everything submitted here and can be asked to explain any gate, number or line.
