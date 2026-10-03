# EthanGomes14 — Reallocation Engine recipe submission (INFO 7375, Fall 2026)

## Executive summary

**What this is.** The submission folder for "The Reallocation Engine — Recipe Design Assignment". It holds a recipe and working prototype that help an international student who will need H-1B sponsorship decide which Data Engineer-type job postings deserve their time, plus the plan, test evidence, worked run and honest logs.

**Why read it.** It is the map: what each file is, and the commands to run and test the work.

**What it delivers.** A runnable sample-stage tool. On seven real postings it produced 3 Apply, 1 Consider, 1 Skip and 2 unscored (company name not found). It comes with 12 passing offline tests and a clear list of what it cannot verify.

## Contents

| File | What it is |
|---|---|
| `CHANGE-BRIEF.md` | Predict step: situation, layers, reuse, gates, failure cases, predictions (frozen at `35c1bcb`) and dated revisions |
| `JUSTIFICATION.md` | One-page domain justification |
| `WORKED-RUN.md` | The worked run with pasted output, the verified-vs-inferred split, the reflection, and the attestation |
| `TEST-REPORT.md` | Toolchain before and after, the clean-checkout run, failure cases, privacy scans, diff scope |
| `FRICTIONAL.md` | Honest process log, human vs. AI |
| `SOURCES.md` | Credits and contributions |
| `SUBMISSION.md` | Canvas cover sheet |
| `runs/triage-sample/` | Outputs of the sample run (JSON log, Markdown report, scorer input and output) |
| `runs/role-scores.*` | First run of the stock scorer on `data/examples/ch11-roles.json` (orientation step) |

Elsewhere in the branch:
- recipe: `recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md`
- card: `…h1b.card.md`
- prototype: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/`
- run log: `logs/runs/2026fa-ethangomes14-1.md`

## Run, test, check (from the repository root, Node 20+)

```bash
npm install
node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03
node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.test.mjs
node scripts/conformance.mjs scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/ recipes/cases/2026fa/
npm run verify && npm run doctor && node scripts/pii-scan.mjs --diff upstream/main
```

## Credits

Built on `nikbearbrown/the-reallocation-engine`. Drafted with Claude (Claude Code). Details in `SOURCES.md`.
