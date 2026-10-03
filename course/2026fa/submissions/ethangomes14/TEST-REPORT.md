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
| Commits tested | `03681eb` (first clean-checkout run), `acd2286` (after the fix) |
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

## 2. Toolchain: after (clean checkout of `03681eb`)

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

## 4. Offline tests (clean checkout of `acd2286`)

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

## 7. Scope of the diff

```
$ git diff --stat origin/main...HEAD     (at 03681eb)
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

1. **Test bug.** The CSV-quoting test checked `board_directors`, but the fixture row put the quoted text in `total_funding`. The fixture's columns were miscounted, not the parser. Assertion corrected (commit `c1d3abc`).
2. **The out-dir check refused `/tmp` on macOS.** `/tmp` is a symlink to `/private/tmp` and is not `os.tmpdir()`. Found by trying the card's own example command. Fixed with real-path comparison (commit `c1d3abc`).
3. **The out-dir check let everything through when the repo lived under `/tmp`.** Found **only** by the clean-checkout run: the test "refuses to write outside its own folders" failed (`0 !== 2`). Fixed so that paths inside the repo must be in this contribution's folders and the temp directory counts only outside it. Re-tested 12/12 in the clean checkout (commit `acd2286`).

## 10. Not tested

- **Node 20**, which CI uses. Run only on Node 25.8.0. No Node-21+ APIs are used knowingly, but this is unverified.
- **CI itself.** The branch has not been pushed, so the contrib-gate workflow has not run.
- A **live** run with a person clearing every gate (that would be RUNNABLE-LIVE).
- **Prediction P3** (six-state blind spot) on real postings. All seven sample companies are headquartered in CA, NY or MA.
- **F8** (title over-match) on real postings.
- Liveness for `expired` on a real posting. Only the fixture and the invented-ID case were exercised.
- Large inputs. The largest candidate list run was 12 rows (fixture).

## 11. Addendum — v0.2.0: Greenhouse liveness cross-check (2026-10-03)

Built at the author's request to close the recipe's `[TODO: DEV]` for the liveness false positive (§5, F4). New network step: `fetch-greenhouse-status.mjs`, allowed host `boards-api.greenhouse.io` only. The triage itself stays offline and reads the saved answers.

**The false positive, reproduced first:**

```
$ npm run ats:liveness -- https://boards.greenhouse.io/airbnb/jobs/1   # invented job ID
Checking 1 URL(s)...

✅ active     https://boards.greenhouse.io/airbnb/jobs/1

Results: 1 active  0 expired  0 uncertain
```

**The API answers:**

```
$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/fetch-greenhouse-status.mjs --candidates …/samples/candidates-2026-10-03.json --candidates …/samples/candidates-ghost-2026-10-03.json
200  exists   sigmacomputing/7809974003  https://job-boards.greenhouse.io/sigmacomputing/jobs/7809974003
200  exists   klaviyo/7737707003  https://www.klaviyo.com/careers/jobs/7737707003?gh_jid=7737707003
200  exists   gusto/8099751  https://job-boards.greenhouse.io/gusto/jobs/8099751
200  exists   gemini/8076827  https://boards.greenhouse.io/embed/job_app?for=gemini&token=8076827&gh_jid=8076827
200  exists   airbnb/8224032  https://careers.airbnb.com/positions/8224032?gh_jid=8224032
200  exists   robinhood/4738660  https://boards.greenhouse.io/robinhood/jobs/4738660?t=gh_src=&gh_jid=4738660
200  exists   stripe/7230670  https://stripe.com/jobs/search?gh_jid=7230670
404  gone     airbnb/1  https://boards.greenhouse.io/airbnb/jobs/1

8 checked · 0 skipped → scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/greenhouse-status-2026-10-03.json
[exit 0]
```

**The triage with the cross-check:**

```
$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03
triage: 7 candidates → Apply 3 · Consider 1 · Skip 1 · unscored 2 (skip+unscored 43%)
  unscored: not-in-csv × 2
  greenhouse cross-check: 7 checked (status file 2026-10-03)
  timeline gate: factor 1 [your-input] · earliest start 2027-03-01 · practical deadline 2027-05-20 · slack 80 days
[exit 0]

$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03 --candidates …/samples/candidates-ghost-2026-10-03.json --liveness …/samples/liveness-ghost-2026-10-03.txt --out-dir course/2026fa/submissions/ethangomes14/runs/triage-ghost
triage: 1 candidates → Apply 0 · Consider 0 · Skip 1 · unscored 0 (skip+unscored 100%)
  greenhouse cross-check: 1 checked (status file 2026-10-03) · closed 1 redirected dead posting(s): airbnb-ghost-invented-id
  timeline gate: factor 1 [your-input] · earliest start 2027-03-01 · practical deadline 2027-05-20 · slack 80 days
[exit 0]
```

**Done-condition met.** The sample results are unchanged and all 7 links were API-checked. The invented ID, which `ats:liveness` calls active, is now closed and skipped.

**Tests (15, was 12):**

```
$ node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.test.mjs
✔ CSV parser handles quoted commas and doubled quotes
✔ name normalization strips legal suffixes but never fuzzes
✔ title family includes Data Engineer-type titles and excludes wrong levels
✔ sponsorship tiers follow the rule; empty H-1B fields are missing, not zero
✔ timeline: cannot start before OPT; closes after the practical deadline
✔ liveness: reads ats:liveness output, flags stale checks, refuses missing evidence
✔ Greenhouse URL parsing covers the four link shapes and never guesses a board
✔ cross-check: only a definite API 404 closes an open gate; nothing is assumed
✔ G0 rejects a row without a fit rating and reason
✔ full run on fixtures: every named failure case is reported, nothing defaulted
✔ F5: after the OPT deadline every scored role is Skip (timeline gate closed)
✔ break: a scorer that ignores the gates is caught (exit 3)
✔ break: refuses to write outside its own folders
✔ break: a named Greenhouse status file that does not exist stops the run
✔ break: a missing sponsor CSV stops the run without inventing anything
ℹ tests 15
ℹ pass 15
ℹ fail 0
```

**Broke during this change, fixed.** My first version of the "stale API file" test had a convoluted assertion that checked the wrong thing and failed (`'stale' !== 'liveness-stale'`). The code was right. I rewrote the test to check directly: an API file older than 7 days is labelled `stale` and its 404 is ignored (the gate stays open).

**New observation.** Stripe's link is `uncertain` to the liveness checker (no visible apply button) but `200` to the API. The cross-check only ever *closes* gates, so Stripe stays Skip. That may be a false negative a person should review.

**Not tested in v0.2.0:**
- Lever, Ashby and Workday links (not covered by design).
- A real Greenhouse posting that closes between the liveness check and the API check.
- API rate limiting under a large list (only 8 requests were made).
- The clean-checkout run was repeated for v0.1.0 only; v0.2.0 was tested in the working copy.

## 12. Addendum — v0.3.0: visa-timeline gate removed (2026-10-03)

The author decided to remove the timeline gate, so the tool answers only "has this company sponsored H-1Bs for this kind of work?" and "is the posting really open?". Changes:
- `timelineFactor` and the `timeline` rule block were deleted.
- The report's timeline section is gone; the "cannot tell you" section now says the hiring timeline is not checked.
- The scorer still receives `timeline: { factor: 1, note: 'not evaluated' }`, so it doesn't silently default it.
- Two tests were removed: the timeline unit test and F5 "after the OPT deadline". 15 tests became 13.

```
$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03
triage: 7 candidates → Apply 3 · Consider 1 · Skip 1 · unscored 2 (skip+unscored 43%)
  unscored: not-in-csv × 2
  greenhouse cross-check: 7 checked (status file 2026-10-03)
  timeline: not evaluated (gate removed in v0.3.0; factor 1 passed to the scorer, labelled)
[exit 0]

$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03 --candidates …/candidates-ghost-2026-10-03.json --liveness …/liveness-ghost-2026-10-03.txt --out-dir course/2026fa/submissions/ethangomes14/runs/triage-ghost
triage: 1 candidates → Apply 0 · Consider 0 · Skip 1 · unscored 0 (skip+unscored 100%)
  greenhouse cross-check: 1 checked (status file 2026-10-03) · closed 1 redirected dead posting(s): airbnb-ghost-invented-id
  timeline: not evaluated (gate removed in v0.3.0; factor 1 passed to the scorer, labelled)
[exit 0]

$ node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.test.mjs
ℹ tests 13
ℹ pass 13
ℹ fail 0
```

Results are unchanged from v0.2.0, as expected: every sample posting already had timeline factor 1. **What is lost:** the tool will no longer catch an Apply whose earliest start lands after the OPT deadline. The v0.1.0 run showed that case working (`--today 2027-06-01` → all Skip; §5, F5).

## 13. Addendum — v0.3.1: renamed to `sponsor-screen` (2026-10-03)

Renamed at the author's request, because "triage" described the sorting, not what the tool checks. Mapping: `triage.mjs` → `sponsor-screen.mjs`, `triage.test.mjs` → `sponsor-screen.test.mjs`, `triage-log.json` / `triage-report.md` → `screen-log.json` / `screen-report.md`, `runs/triage-sample` / `runs/triage-ghost` → `runs/screen-sample` / `runs/screen-ghost`. Behaviour is unchanged. **Sections 1–12 above show the old names exactly as they were run**; they were not rewritten.

```
$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs --today 2026-10-03
sponsor-screen: 7 candidates → Apply 3 · Consider 1 · Skip 1 · unscored 2 (skip+unscored 43%)
  unscored: not-in-csv × 2
  greenhouse cross-check: 7 checked (status file 2026-10-03)
  timeline: not evaluated (gate removed in v0.3.0; factor 1 passed to the scorer, labelled)
  course/2026fa/submissions/ethangomes14/runs/screen-sample/screen-log.json  +  course/2026fa/submissions/ethangomes14/runs/screen-sample/screen-report.md
[exit 0]

$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs --today 2026-10-03 --candidates scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/candidates-ghost-2026-10-03.json --liveness scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/liveness-ghost-2026-10-03.txt --out-dir course/2026fa/submissions/ethangomes14/runs/screen-ghost
sponsor-screen: 1 candidates → Apply 0 · Consider 0 · Skip 1 · unscored 0 (skip+unscored 100%)
  greenhouse cross-check: 1 checked (status file 2026-10-03) · closed 1 redirected dead posting(s): airbnb-ghost-invented-id
  timeline: not evaluated (gate removed in v0.3.0; factor 1 passed to the scorer, labelled)
  course/2026fa/submissions/ethangomes14/runs/screen-ghost/screen-log.json  +  course/2026fa/submissions/ethangomes14/runs/screen-ghost/screen-report.md
[exit 0]

$ node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.test.mjs
ℹ tests 13
ℹ pass 13
ℹ fail 0
```

## 14. Addendum — v0.4.0: visa-timeline gate restored, two TODOs added (2026-10-03)

After reviewing the assignment checklist, the author asked to close two gaps: the recipe had no typed proposed additions, and it had dropped the required visa-timeline gate. The timeline code was restored from the last commit, where it was the original, tested v0.1.0 code. Two typed TODOs were added to the recipe (`[TODO: DEV]` brand → legal-name alias table, `[TODO: DATA SOURCE]` dated DOL LCA data). The program name `sponsor-screen` is unchanged.

```
$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs --today 2026-10-03
sponsor-screen: 7 candidates → Apply 3 · Consider 1 · Skip 1 · unscored 2 (skip+unscored 43%)
  unscored: not-in-csv × 2
  greenhouse cross-check: 7 checked (status file 2026-10-03)
  timeline gate: factor 1 [your-input] · earliest start 2027-03-01 · practical deadline 2027-05-20 · slack 80 days
  course/2026fa/submissions/ethangomes14/runs/screen-sample/screen-log.json  +  course/2026fa/submissions/ethangomes14/runs/screen-sample/screen-report.md
[exit 0]

$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs --today 2026-10-03 --candidates scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/candidates-ghost-2026-10-03.json --liveness scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/liveness-ghost-2026-10-03.txt --out-dir course/2026fa/submissions/ethangomes14/runs/screen-ghost
sponsor-screen: 1 candidates → Apply 0 · Consider 0 · Skip 1 · unscored 0 (skip+unscored 100%)
  greenhouse cross-check: 1 checked (status file 2026-10-03) · closed 1 redirected dead posting(s): airbnb-ghost-invented-id
  timeline gate: factor 1 [your-input] · earliest start 2027-03-01 · practical deadline 2027-05-20 · slack 80 days
  course/2026fa/submissions/ethangomes14/runs/screen-ghost/screen-log.json  +  course/2026fa/submissions/ethangomes14/runs/screen-ghost/screen-report.md
[exit 0]

$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs --today 2027-06-01 --out-dir /tmp/de-h1b-late   # after the OPT deadline
sponsor-screen: 7 candidates → Apply 0 · Consider 0 · Skip 5 · unscored 2 (skip+unscored 100%)
  unscored: not-in-csv × 2
  greenhouse cross-check: 0 checked (status file 2026-10-03)
  timeline gate: factor 0 [your-input] · earliest start 2027-07-16 · practical deadline 2027-05-20 · slack -57 days
  /tmp/de-h1b-late/screen-log.json  +  /tmp/de-h1b-late/screen-report.md
[exit 0]

$ node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.test.mjs
ℹ tests 15
ℹ pass 15
ℹ fail 0
```

The sample results are unchanged. The post-deadline run shows the gate working again: all 5 scored postings Skip at slack −57 days. The cross-check reports "0 checked" there because the 2026-10-03 API file is more than 7 days older than the pretend date, so it is treated as stale and ignored, as designed.
