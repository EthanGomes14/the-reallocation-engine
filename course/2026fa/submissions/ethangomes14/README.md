# EthanGomes14 — Reallocation Engine recipe submission (INFO 7375, Fall 2026)

## Executive summary

**What this is.** The submission folder for "The Reallocation Engine — Recipe Design Assignment". It holds a recipe and working prototype that help an international student who will need H-1B sponsorship decide which Data Engineer-type job postings deserve their time, plus the plan, test evidence, worked run and honest logs.

**Why read it.** It is the map: what each file is, and the commands to run and test the work.

**What it delivers.** A runnable sample-stage tool. On seven real postings it produced 3 Apply, 1 Consider, 1 Skip and 2 unscored (company name not found). It comes with 15 passing offline tests and a clear list of what it cannot verify.

## Contents

| File | What it is |
|---|---|
| `CHANGE-BRIEF.md` | Predict step: situation, layers, reuse, gates, failure cases, predictions (frozen at `ab51f69`) and dated revisions |
| `JUSTIFICATION.md` | One-page domain justification |
| `WORKED-RUN.md` | The worked run with pasted output, the verified-vs-inferred split, the reflection, and the attestation |
| `TEST-REPORT.md` | Toolchain before and after, the clean-checkout run, failure cases, privacy scans, diff scope |
| `FRICTIONAL.md` | Honest process log, human vs. AI |
| `SOURCES.md` | Credits and contributions |
| `SUBMISSION.md` | Canvas cover sheet |
| `runs/screen-sample/` | Outputs of the sample run (JSON log, Markdown report with a priority list, scorer input and output) |
| `runs/screen-ghost/` | Break test: an invented Airbnb job ID the liveness checker calls active, closed by the Greenhouse API cross-check |
| `runs/role-scores.*` | First run of the stock scorer on `data/examples/ch11-roles.json` (orientation step) |

Elsewhere in the branch:
- recipe: `recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md`
- card: `…h1b.card.md`
- prototype: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/`
- run logs: `logs/runs/2026fa-ethangomes14-1.md` (v0.1.0), `logs/runs/2026fa-ethangomes14-2.md` (v0.2.0), `logs/runs/2026fa-ethangomes14-3.md` (v0.3.0), `logs/runs/2026fa-ethangomes14-4.md` (v0.3.1, rename), `logs/runs/2026fa-ethangomes14-5.md` (v0.4.0, timeline gate restored)

> **Name note:** the program was called `triage.mjs` until v0.3.1. Older sections of `TEST-REPORT.md`, `WORKED-RUN.md`, the run logs and `FRICTIONAL.md` show that name as it was run.

## Run, test, check (from the repository root, Node 20+)

```bash
npm install
node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs --today 2026-10-03
node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.test.mjs
node scripts/conformance.mjs scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/ recipes/cases/2026fa/
npm run verify && npm run doctor && node scripts/pii-scan.mjs --diff upstream/main
```

## Credits

Built on `nikbearbrown/the-reallocation-engine`. Drafted with Claude (Claude Code). Details in `SOURCES.md`.
