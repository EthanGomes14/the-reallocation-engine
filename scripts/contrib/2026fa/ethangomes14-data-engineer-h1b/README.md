---
owner: EthanGomes14
term: 2026fa
component: data-engineer-h1b
status: RUNNABLE-SAMPLE
promoted_to: null
---

# Data Engineer H-1B sponsor triage — prototype

## Executive summary

**What this is.** A small offline program that helps an international student who will need visa sponsorship decide which Data Engineer job postings are worth their time. For each posting it checks three things: whether the company has a public record of sponsoring visas for Data Engineer-type roles, whether the posting is still open, and whether hiring can finish before the student's work-authorization window closes. It then asks the repository's existing scorer for an Apply / Consider / Skip recommendation and writes two files: a detailed log for software and a readable report for a person.

**Why read it.** It has the single command that runs everything, the command that tests it, and an honest list of what it cannot check.

**What it does not do.** It never applies, emails or contacts anyone, never goes online, and never invents a number when evidence is missing. Missing evidence is reported as missing, with a reason.

## Run it (from the repository root)

```bash
node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03
```

- Reads: the sponsor file `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv`, the persona `fixtures/persona-electrifier.json` (fictional), the candidate postings `samples/candidates-2026-10-03.json`, the saved liveness output `samples/liveness-2026-10-03.txt`, and the decision rules `rules.json`.
- Calls: the existing scorer `scripts/score/role-scorer.mjs` (not a copy).
- Writes to `course/2026fa/submissions/ethangomes14/runs/triage-sample/`:
  - `triage-log.json`: JSON log for the agent
  - `triage-report.md`: Markdown report for the person
  - `roles.json`: the evidence handed to the scorer
  - `role-scores.json` / `role-scores.md`: the scorer's own output
- `--today` pins the evaluation date so the sample run is reproducible. Without it, the program uses today's date, and the 7-day liveness freshness rule will eventually mark the 2026-10-03 sample stale. That is intended.

Options: `--candidates`, `--liveness`, `--persona`, `--csv`, `--rules`, `--out-dir`, `--today`, `--scorer` (see the header of `triage.mjs`). `--out-dir` must stay inside this folder, `course/2026fa/submissions/ethangomes14/`, or the system temp directory; anything else is refused.

### Using your own candidate list

1. Write a candidates file shaped like `samples/candidates-2026-10-03.json`: `role_id`, `company`, `title`, `url`, and `fit` with `p` (0–1) and `reason`.
2. Check liveness with the repository's own checker and save its output with a date header:

   ```bash
   { echo "# checked: $(date +%F)"; npm run ats:liveness -- <url1> <url2> ... || true; } > my-liveness.txt
   ```

3. Run the triage with `--candidates <file> --liveness my-liveness.txt`.

## Test it (offline, fixtures only)

```bash
node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.test.mjs
node scripts/conformance.mjs scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/
```

The 12 tests cover:
- the CSV parser
- name normalization
- the title family
- the tier rule
- the timeline gate
- liveness parsing
- one full run per named failure case (F1–F7) through the real scorer
- three break attempts:
  - a deliberately broken scorer (`fixtures/BROKEN-apply-everything-scorer.mjs`) must be caught
  - writing outside this folder must be refused
  - a missing data file must stop the run with no output

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Run complete. Unscored rows are a normal outcome, listed with reasons. |
| 2 | Stopped on bad input (missing file, bad date, out-dir outside the allowed folders). Nothing scored, nothing written. |
| 3 | The scorer failed, or its output broke the gate rule (a closed gate that is not a Skip). Do not use that run. |

## Files

| File | Purpose |
|---|---|
| `triage.mjs` | The program (command line) |
| `lib.mjs` | Pure helpers: CSV parsing, name matching, title family, tier rule, timeline gate, liveness parsing |
| `rules.json` | Every decision rule, each with its source label |
| `triage.test.mjs` | Offline tests |
| `fixtures/` | Fictional persona, test CSV, test candidates, test liveness output, the BROKEN scorer |
| `samples/` | The real 2026-10-03 sample: 7 public postings and their saved liveness output |

## What it cannot verify

See the "can and can't verify" section in `recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md`. In short: past sponsorship is not current intent; approvals are company-wide and undated; the sponsor file covers companies headquartered in only six states; name matching is exact after normalization; the liveness checker can call a redirected dead posting "active"; and fit ratings are Claude's judgment from titles only.

## Credits

Built on The Reallocation Engine (`nikbearbrown/the-reallocation-engine`): the 80 Days to Stay sponsor file, `scripts/score/role-scorer.mjs`, and `scripts/ats/check-liveness.mjs`. Code drafted with Claude (Claude Code); see `course/2026fa/submissions/ethangomes14/SOURCES.md` for who decided and checked what.
