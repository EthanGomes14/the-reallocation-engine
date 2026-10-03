# Data Engineer H-1B sponsor triage — human card

**Audience:** the international student (or their adviser) deciding which Data Engineer postings deserve the next block of job-search hours.
**Agent twin:** `recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md`
**Engine layers:** 80 Days to Stay (sponsorship vote) · Job-Ops (liveness gate) · visa timeline (gate, from the persona)

## Purpose

Answer, for each posting: *does the public record show this company sponsoring visas for Data Engineer-type work, is the posting really open, and can hiring finish before my OPT clock runs out?* Then say Apply, Consider or Skip, with every number traceable. If the record doesn't support an answer, the tool must say `missing` and why.

## What it can verify

- The company **has a row** in the shipped sponsor file under its normalized name. Its approvals, denials, approval rate and listed top titles are shown exactly as the file has them.
- One of those titles **matches the Data Engineer family rule**: Data Engineer, Analytics Engineer, ETL Developer, BI Engineer, Data Platform/Infrastructure Engineer, "Software Engineer, Data" and similar, with no Manager, Director, Analyst, Specialist, Architect or Scientist.
- The repo's liveness checker **said** active / expired / uncertain for the URL on a stated date, no more than 7 days ago.
- The OPT arithmetic: you cannot start before OPT begins, and must be employed by OPT start + 90 days − buffer.
- The existing scorer got complete, labelled evidence and **respected the gates**. A closed gate is always a Skip; a broken scorer is caught (exit 3).

## What it cannot verify

- That the company **sponsors now**. Approvals have no year.
- **How many** sponsorships were for Data Engineers. Approvals are company-wide; only ~5 titles are listed.
- Anything about companies **headquartered outside CA, NY, MA, WA, TX, IL**. The file's H-1B rows cover only those six states. "Not found" there is not "doesn't sponsor".
- Matches hidden by **brand vs. legal names** ("Gemini" vs "GEMINI SPACE STATION LLC").
- That an "active" link is **this job**. Redirects to a general careers page have been called active.
- **Fit**. It is Claude's rating from the title and level, not from the description or your résumé.
- E-Verify (STEM OPT), funding, wages and role quality. Out of scope.

## Dependencies

- Node 20+ (no extra packages for the prototype; `npm install` for the repo's liveness checker).
- `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` (shipped; read-only).
- `scripts/score/role-scorer.mjs` (shipped; called, not copied).
- `scripts/ats/check-liveness.mjs` via `npm run ats:liveness` (needs network and Playwright; run before the triage).
- Persona, rules, sample and fixtures in `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/`.

## Annotated commands

Sample run on seven real postings, date pinned. Expected: 7 candidates → Apply 3 · Consider 1 · Skip 1 · unscored 2 (`not-in-csv` × 2); timeline factor 1, slack 80 days.

```bash
node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03
```

Offline tests. Expected: 12 pass, including the broken-scorer break attempt.

```bash
node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.test.mjs
```

The same sample after the OPT deadline. Expected: timeline factor 0, and every scored posting is Skip.

```bash
node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2027-06-01 --out-dir /tmp/de-h1b-late
```

Refusal demo. Expected: `STOP … outside this contribution's folders`, exit 2, nothing written.

```bash
node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --out-dir data/examples
```

Liveness for your own list (the checker exits 1 if any URL isn't active; `|| true` keeps the output):

```bash
{ echo "# checked: $(date +%F)"; npm run ats:liveness -- <url1> <url2> || true; } > my-liveness.txt
```

## What it produces

- `triage-report.md`, for you:
  - a plain summary
  - one row per posting with its result, the scorer's arithmetic, evidence, fit, liveness and a next action
  - the timeline
  - a "you must confirm" checklist
  - companies to network into
  - what the run can't tell you
- `triage-log.json`, for software: every value as `{ value, source }`, every gate result, input hashes, and invariant violations.
- `roles.json` and the scorer's `role-scores.json` / `role-scores.md`.

## Your gates (the tool stops here)

| Gate | You look at | You decide |
|---|---|---|
| G1 | Input company name vs. matched CSV name; the matched titles | Same employer? Really Data Engineer work? |
| G2 | Each "active" URL, opened in a browser | Is it this job, not a careers landing page? |
| G3 | OPT start, hiring lag, buffer, slack | Are these still true for me? |
| G4 | The whole report | Act on the Apply rows, or not |

## Named failure modes

1. **Brand-name miss (seen in the sample).** You type the brand ("Gemini", "Robinhood"); the visa filings use the legal entity ("GEMINI SPACE STATION LLC", "ROBINHOOD MARKETS INC"). The tool says `not-in-csv` and is honest about it, but a strong sponsor drops out of the scored list. *Hardest to catch for:* a student new to the US who doesn't know a company's legal name. **Check:** for every `not-in-csv`, search the company's legal name by hand.
2. **Stale sponsor looks current.** Undated approvals let a company that stopped sponsoring years ago rate "Proven". *Hardest to catch for:* anyone. Nothing in the report looks wrong. **Check:** ask a current employee or recruiter before investing heavily; this is a networking question, not a data question.
3. **Ghost posting passes liveness.** A dead job ID redirects to the company's careers page, which loads normally, so the checker says active (observed with an invented Airbnb Greenhouse ID on 2026-10-03). *Hardest to catch for:* someone batch-checking many links without opening them. **Check:** G2, open the link.
4. **Six-state blind spot.** For a nationwide search, a sponsor headquartered in, say, Georgia or Virginia is invisible. A missing record is then misread as "doesn't sponsor". *Hardest to catch for:* a student relocating anywhere, who is exactly this persona.
5. **Title-family drift.** Widening the family (e.g. adding "Architect") quietly upgrades many companies to Proven. **Mitigation:** the rules live in `rules.json` with sources; any change is logged in the change brief's revisions, and tests pin the include/exclude behaviour.
