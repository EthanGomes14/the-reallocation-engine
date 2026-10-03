# Test Report — Data Engineer H-1B sponsor triage

## Executive summary

**What this is.** The record of running the prototype and its checks, including once from a completely fresh copy of the branch, with the real terminal output pasted in.

**Why read it.** It shows the tool runs with one command on a fresh copy, that the repository's own checks still pass, what each named failure case actually did, and which files the work touches.

**What it found.**
- Everything passes from a fresh copy: 12 of 12 tests, the repo's conformance and doctor checks, and the full-history privacy scan.
- The fresh-copy run caught one real bug in the tool's "only write to my own folders" safety check. It was fixed and re-tested.
- Two limits remain open. The sample was not a fair test of how often the tool says Skip. And one privacy-scan finding comes from a file the instructor's repository already contained.

---

## Record

| Field | Value |
|---|---|
| Branch | `contrib/2026fa-ethangomes14-data-engineer-h1b` |
| Base | `upstream/main` = `015843d` |
| Commits tested | `2ca709e` (first clean-checkout run), `4b3c9de` (after the fix) |
| Environment | macOS, Node v25.8.0, Python 3.9.6. **Not run on Node 20**, which is what CI uses (see "Not tested"). |
| Clean checkout | `git clone --branch contrib/2026fa-ethangomes14-data-engineer-h1b <local repo> <scratch dir>/clean`, then `npm install` (55 packages) |
| Run by | Claude (Claude Code), in a session directed by EthanGomes14. EthanGomes14 to re-run the commands below before signing the attestation in `WORKED-RUN.md`. |

---

## 1. Toolchain baseline: before (base commit `015843d`, 2026-10-03 05:09 EDT)

```
$ npm run doctor
...
PRIVACY (no personal data committed)
  ✓ no private/PII paths are tracked

RECIPES (33)
  with lifecycle frontmatter: 33   missing: 0
  by status: DRAFT 28 · RUNNABLE-SAMPLE 4 · RUNNABLE-LIVE  # DRAFT | SPECIFIED | RUNNABLE-SAMPLE | RUNNABLE-LIVE | VERIFIED 1
  open TODOs: 318 declared (in frontmatter) · 318 [TODO markers in bodies

SUMMARY
  environment: ✓ runnable
  recipes: 33/33 carry lifecycle frontmatter — all tracked
  next: continue
[exit 0]
```

```
$ npm run verify
conformance: 158 files (85 md · 36 py · 30 js · 4 sh · 3 json)
✓ all conform (machine half of P4). Adequacy is still the human gate.
MANIFEST CHECK — The Reallocation Engine
WARN (3):
  W1 ignore path not in .gitignore: archive/
  W2 private path not gitignored (PII/secret risk): private/
  W2 private path not gitignored (PII/secret risk): data/ats/
✓ manifest check passed (3 warnings)
[exit 0]
```

Both warnings and the odd `RUNNABLE-LIVE  # DRAFT | …` status line existed before this branch. The W2 warning does not match reality: `git check-ignore -v private/x` reports `.gitignore:37:/private/*`.

## 2. Toolchain: after (clean checkout of `2ca709e`)

```
$ npm run doctor
...
PRIVACY (no personal data committed)
  ✓ no private/PII paths are tracked

RECIPES (33)
  with lifecycle frontmatter: 33   missing: 0
  by status: DRAFT 28 · RUNNABLE-SAMPLE 4 · RUNNABLE-LIVE  # DRAFT | SPECIFIED | RUNNABLE-SAMPLE | RUNNABLE-LIVE | VERIFIED 1
  open TODOs: 318 declared (in frontmatter) · 318 [TODO markers in bodies

SUMMARY
  environment: ✓ runnable
  recipes: 33/33 carry lifecycle frontmatter — all tracked
  next: continue
[exit 0]
```

Doctor's recipe count is unchanged at 33, because it reads only top-level `recipes/*.md`, not `recipes/cases/`.

```
$ npm run verify
conformance: 169 files (88 md · 36 py · 34 js · 7 json · 4 sh)
✓ all conform (machine half of P4). Adequacy is still the human gate.
MANIFEST CHECK — The Reallocation Engine
WARN (3):
  W1 ignore path not in .gitignore: archive/
  W2 private path not gitignored (PII/secret risk): private/
  W2 private path not gitignored (PII/secret risk): data/ats/
✓ manifest check passed (3 warnings)
```

Conformance grew from 158 to 169 files. The new files are this contribution's scripts, recipe, card and README; all conform. The warnings are the same three as before.

```
$ node scripts/conformance.mjs scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/ recipes/cases/2026fa/
conformance: 11 files (3 md · 4 js · 4 json)
✓ all conform (machine half of P4). Adequacy is still the human gate.
```

## 3. The real sample run (clean checkout)

```
$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03
triage: 7 candidates → Apply 3 · Consider 1 · Skip 1 · unscored 2 (skip+unscored 43%)
  unscored: not-in-csv × 2
  timeline gate: factor 1 [your-input] · earliest start 2027-03-01 · practical deadline 2027-05-20 · slack 80 days
  course/2026fa/submissions/ethangomes14/runs/triage-sample/triage-log.json  +  course/2026fa/submissions/ethangomes14/runs/triage-sample/triage-report.md
[exit 0]
```

```
$ git status --short   # after the run: regenerated outputs only
 M course/2026fa/submissions/ethangomes14/runs/triage-sample/triage-log.json
 M course/2026fa/submissions/ethangomes14/runs/triage-sample/triage-report.md

$ git diff --stat -- course/
 .../runs/triage-sample/triage-log.json  | 2 +-
 .../runs/triage-sample/triage-report.md | 2 +-
 2 files changed, 2 insertions(+), 2 deletions(-)
```

The only difference from the committed outputs is one line in each file: the `generated_at` timestamp. All results are identical. No tracked file outside this contribution's folders was written.

Full per-posting output: `runs/triage-sample/triage-report.md`, pasted in `WORKED-RUN.md`.

## 4. Offline tests (clean checkout of `4b3c9de`)

```
$ node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.test.mjs
✔ CSV parser handles quoted commas and doubled quotes (0.804417ms)
✔ name normalization strips legal suffixes but never fuzzes (0.133666ms)
✔ title family includes Data Engineer-type titles and excludes wrong levels (0.398917ms)
✔ sponsorship tiers follow the rule; empty H-1B fields are missing, not zero (0.678625ms)
✔ timeline: cannot start before OPT; closes after the practical deadline (0.750542ms)
✔ liveness: reads ats:liveness output, flags stale checks, refuses missing evidence (0.405333ms)
✔ G0 rejects a row without a fit rating and reason (0.599ms)
✔ full run on fixtures: every named failure case is reported, nothing defaulted (121.455375ms)
✔ F5: after the OPT deadline every scored role is Skip (timeline gate closed) (122.847333ms)
✔ break: a scorer that ignores the gates is caught (exit 3) (121.464542ms)
✔ break: refuses to write outside its own folders (61.639ms)
✔ break: a missing sponsor CSV stops the run without inventing anything (60.314083ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 567.458416
```

## 5. Each named failure case, exercised

| # | Failure case (CHANGE-BRIEF §4) | How it was exercised | Observed | Matches prediction? |
|---|---|---|---|---|
| F1 | Company not in CSV | Fixture "Not A Real Company"; **and real**: "Gemini", "Robinhood" in the sample | `not-in-csv`, unscored, never sent to the scorer | Yes |
| F2 | In CSV, H-1B fields empty | Fixture `EMPTYCO INC` | `no-h1b-record`; `p` undefined, not 0 | Yes |
| F3 | Approvals but no family title | Fixture `BIGSPONSOR CORP`; **real**: Airbnb, Stripe | Tier `Possible` with the "absence is not proof" note | Yes |
| F4 | Dead posting reported active | **Real**: `npm run ats:liveness -- https://boards.greenhouse.io/airbnb/jobs/1` (output below) | Checker says ✅ active for an invented ID. The prototype cannot detect this; it shows the URL in the G2 "you must confirm" list. | Yes. The gate correctly depends on a person. |
| F5 | Deadline passed | Test plus a real run with `--today 2027-06-01` (output below) | Timeline factor 0; all 5 scored postings Skip | Yes |
| F6 | Name variant | Fixture "Acme Data Holdings" vs `ACME DATA INC`; **real**: Gemini and Robinhood | `not-in-csv` (false negative, by design of exact matching) | Yes, and it cost a real Apply (see `WORKED-RUN.md` what-if) |
| F7 | Liveness evidence missing | Fixture URL absent from the liveness log | `url-not-in-liveness-log`, unscored. The scorer never saw it, so it could not default the gate to open. | Yes |
| F8 | Title over-match | Tests pin includes and excludes | Not seen in the sample. The test confirms "Manager, Data Engineering" is excluded. | Not exercised on real data |

F4: the repo's liveness checker on an invented job ID (2026-10-03 05:10 EDT):

```
$ npm run ats:liveness -- https://careers.airbnb.com/positions/8224032?gh_jid=8224032 https://boards.greenhouse.io/airbnb/jobs/1
Checking 2 URL(s)...

✅ active     https://careers.airbnb.com/positions/8224032?gh_jid=8224032
✅ active     https://boards.greenhouse.io/airbnb/jobs/1

Results: 2 active  0 expired  0 uncertain
```

Cross-check of the redirect. `curl -sIL https://boards.greenhouse.io/airbnb/jobs/1` showed: 301 → `job-boards.greenhouse.io/airbnb/jobs/1` → 302 `/airbnb?error=true` → 302 `careers.airbnb.com/positions/` → 200. The Greenhouse JSON API returned **404** for job 1 and **200** for job 8224032.

F5: the same sample evaluated after the OPT deadline:

```
$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2027-06-01 --out-dir /tmp/de-h1b-late
triage: 7 candidates → Apply 0 · Consider 0 · Skip 5 · unscored 2 (skip+unscored 100%)
  unscored: not-in-csv × 2
  timeline gate: factor 0 [your-input] · earliest start 2027-07-16 · practical deadline 2027-05-20 · slack -57 days
[exit 0]
```

Refusal to write outside the contribution's folders (clean checkout, after the fix):

```
$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --out-dir data/examples
STOP: --out-dir data/examples is outside this contribution's folders; refusing to write there
Nothing was scored and no outputs were written.
[exit 2]
```

## 6. Privacy scans

```
$ node scripts/pii-scan.mjs --diff origin/main      # full branch history, as CI runs it
pii-scan: clean ✓
[exit 0]
```

```
$ node scripts/pii-scan.mjs                         # working tree
pii-scan: 1 finding(s) — see DATA_CONTRACT.md §Zero-Conditions

  [email] package-lock.json — <glob maintainer contact address, redacted here so this report does not re-trigger the scan>
```

The working-tree finding is a deprecation notice inside the **instructor's unchanged** `package-lock.json` (`package-lock.json:606`, the `glob` package's maintainer contact). `git diff upstream/main -- package-lock.json` is empty. It is not from this branch and is not edited here, because the file is outside this contribution's namespace. CI's working-tree scan may report it for every contributor.

Commit identity: all branch commits use GitHub's noreply address (`181416688+EthanGomes14@users.noreply.github.com`), set repo-locally before the first commit so no personal email enters history.

## 7. Scope of the diff

```
$ git diff --stat origin/main...HEAD     (at 2ca709e)
 .../submissions/ethangomes14/CHANGE-BRIEF.md       | 197 +++++
 .../submissions/ethangomes14/runs/role-scores.json | 241 ++++++
 .../submissions/ethangomes14/runs/role-scores.md   |  15 +
 .../runs/triage-sample/role-scores.json            | 238 ++++++
 .../ethangomes14/runs/triage-sample/role-scores.md |  15 +
 .../ethangomes14/runs/triage-sample/roles.json     | 112 +++
 .../runs/triage-sample/triage-log.json             | 882 +++++++++++++++++++++
 .../runs/triage-sample/triage-report.md            |  77 ++
 .../2026fa/ethangomes14-data-engineer-h1b.card.md  |  96 +++
 .../cases/2026fa/ethangomes14-data-engineer-h1b.md | 247 ++++++
 .../ethangomes14-data-engineer-h1b/README.md       |  92 +++
 .../fixtures/BROKEN-apply-everything-scorer.mjs    |  16 +
 .../fixtures/candidates-fixture.json               |  17 +
 .../fixtures/liveness-fixture.txt                  |  17 +
 .../fixtures/persona-electrifier.json              |  48 ++
 .../fixtures/sponsors-fixture.csv                  |  10 +
 .../2026fa/ethangomes14-data-engineer-h1b/lib.mjs  | 217 +++++
 .../ethangomes14-data-engineer-h1b/rules.json      |  53 ++
 .../samples/candidates-2026-10-03.json             |  62 ++
 .../samples/liveness-2026-10-03.txt                |  19 +
 .../ethangomes14-data-engineer-h1b/triage.mjs      | 404 ++++++++++
 .../ethangomes14-data-engineer-h1b/triage.test.mjs | 179 +++++
 22 files changed, 3254 insertions(+)
```

Every path is under `course/2026fa/submissions/ethangomes14/`, `recipes/cases/2026fa/ethangomes14-*` or `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/`. Later commits add only `logs/runs/2026fa-ethangomes14-1.md` and more files in the submissions folder. No maintained file is patched. `logs/RUN_LOG.md` is untouched.

## 8. What the gates require a human to judge

| Gate | The human judges | Why a machine can't |
|---|---|---|
| G1 | Is `SIGMA COMPUTING INC` the "Sigma Computing" of the posting? Is "Business Intelligence Engineer" really Data Engineer-type evidence for Klaviyo and Gusto? | Exact name matching can't tell two companies with one name apart, and title meaning is a judgment |
| G2 | Do the six "active" URLs open the actual job? | The checker called an invented job ID active (F4) |
| G3 | Are OPT start, hiring lag and buffer still true? | They are the persona's inputs, not records |
| G4 | Act on the three Apply rows, or not | Release is a human decision (SNICKERDOODLE P1) |

## 9. Broke during testing, fixed

1. **Test bug.** The CSV-quoting test checked `board_directors`, but the fixture row put the quoted text in `total_funding`. The fixture's columns were miscounted, not the parser. Assertion corrected (commit `09c3fd6`).
2. **The out-dir check refused `/tmp` on macOS.** `/tmp` is a symlink to `/private/tmp` and is not `os.tmpdir()`. Found by trying the card's own example command. Fixed with real-path comparison (commit `09c3fd6`).
3. **The out-dir check let everything through when the repo lived under `/tmp`.** Found **only** by the clean-checkout run: the test "refuses to write outside its own folders" failed (`0 !== 2`). Fixed so that paths inside the repo must be in this contribution's folders and the temp directory counts only outside it. Re-tested 12/12 in the clean checkout (commit `4b3c9de`).

## 10. Not tested

- **Node 20**, which CI uses. Run only on Node 25.8.0. No Node-21+ APIs are used knowingly, but this is unverified.
- **CI itself.** The branch has not been pushed, so the contrib-gate workflow has not run.
- A **live** run with a person clearing every gate (that would be RUNNABLE-LIVE).
- **Prediction P3** (six-state blind spot) on real postings. All seven sample companies are headquartered in CA, NY or MA.
- **F8** (title over-match) on real postings.
- Liveness for `expired` on a real posting. Only the fixture and the invented-ID case were exercised.
- Large inputs. The largest candidate list run was 12 rows (fixture).
