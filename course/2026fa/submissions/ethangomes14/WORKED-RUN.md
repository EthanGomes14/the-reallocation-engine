# Worked Run — Data Engineer H-1B sponsor triage, 2026-10-03

## Executive summary

**What this is.** One complete run of the tool on a realistic scenario: seven real, open Data Engineer-type job postings, checked for a fictional international student. The commands and their real output are pasted, not described.

**Why read it.** It shows which numbers came from records and which came from judgment, how the output was checked by hand, and what the run got wrong.

**What it found.**
- Three postings to apply to (Sigma Computing, Klaviyo, Gusto), one to consider (Airbnb) and one to skip (Stripe, whose posting the liveness checker could not confirm). Two (Gemini, Robinhood) could not be scored because their brand names didn't match the legal names in the sponsorship records.
- A follow-up run with legal names showed one of those two was a strong sponsor whose posting deserved an Apply. That is the run's most important lesson.
- The sample itself was biased toward sponsors, so it was not a fair test of how often the tool says Skip.

---

## 1. Inputs

| Input | Value | Label |
|---|---|---|
| Persona | "Electrifier" (fictional): F-1, final semester of an M.S. in Data Science, OPT starts 2027-03-01, 90-day limit, 10-day buffer, 45-day hiring lag, based in Chicago, relocating anywhere in the US. File: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/fixtures/persona-electrifier.json` | `your-input` |
| Candidate postings | 7 real public postings found 2026-10-03 through the public Greenhouse job-board API, filtered to Data Engineer-family titles: `samples/candidates-2026-10-03.json`. Company names typed as a job-seeker would (brand names). | postings: public; fit: `model-judgment` |
| Liveness evidence | Saved output of the repo's own checker: `samples/liveness-2026-10-03.txt` | `record` |
| Sponsor data | `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` (shipped file, 30,369 rows, sha256 `eccdee2addf4…`) | `record` |
| Rules | `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/rules.json` | `model-judgment` / `your-input` per block |
| Evaluation date | `--today 2026-10-03` | `your-input` |

How the postings were chosen: Claude queried `boards-api.greenhouse.io/v1/boards/<board>/jobs` for boards named after companies already known to sponsor Data Engineer-family roles (plus a few well-known boards), and kept postings whose titles matched the family. **This biases the sample toward sponsors** (see Reflection).

## 2. Commands and real output

### 2a. Liveness, using the repo's checker (network)

```
$ { echo "# checked: $(date +%F)"; echo "# command: npm run ats:liveness -- <the 7 URLs below>"; npm run ats:liveness -- <7 URLs> || echo "# ats:liveness exited non-zero (it exits 1 if any URL is expired or uncertain)"; } > samples/liveness-2026-10-03.txt
$ cat samples/liveness-2026-10-03.txt
# checked: 2026-10-03
# command: npm run ats:liveness -- <the 7 URLs below>

> the-reallocation-engine@1.0.0 ats:liveness
> node scripts/ats/check-liveness.mjs https://job-boards.greenhouse.io/sigmacomputing/jobs/7809974003 https://www.klaviyo.com/careers/jobs/7737707003?gh_jid=7737707003 https://job-boards.greenhouse.io/gusto/jobs/8099751 https://boards.greenhouse.io/embed/job_app?for=gemini&token=8076827&gh_jid=8076827 https://careers.airbnb.com/positions/8224032?gh_jid=8224032 https://boards.greenhouse.io/robinhood/jobs/4738660?t=gh_src=&gh_jid=4738660 https://stripe.com/jobs/search?gh_jid=7230670

Checking 7 URL(s)...

✅ active     https://job-boards.greenhouse.io/sigmacomputing/jobs/7809974003
✅ active     https://www.klaviyo.com/careers/jobs/7737707003?gh_jid=7737707003
✅ active     https://job-boards.greenhouse.io/gusto/jobs/8099751
✅ active     https://boards.greenhouse.io/embed/job_app?for=gemini&token=8076827&gh_jid=8076827
✅ active     https://careers.airbnb.com/positions/8224032?gh_jid=8224032
✅ active     https://boards.greenhouse.io/robinhood/jobs/4738660?t=gh_src=&gh_jid=4738660
⚠️ uncertain  https://stripe.com/jobs/search?gh_jid=7230670
           content present but no visible apply control found

Results: 6 active  0 expired  1 uncertain
# ats:liveness exited non-zero (it exits 1 if any URL is expired or uncertain)
```

### 2b. The triage, offline

```
$ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03
triage: 7 candidates → Apply 3 · Consider 1 · Skip 1 · unscored 2 (skip+unscored 43%)
  unscored: not-in-csv × 2
  timeline gate: factor 1 [your-input] · earliest start 2027-03-01 · practical deadline 2027-05-20 · slack 80 days
  course/2026fa/submissions/ethangomes14/runs/triage-sample/triage-log.json  +  course/2026fa/submissions/ethangomes14/runs/triage-sample/triage-report.md
[exit 0]
```

The scorer's own line, from `triage-log.json` → `scorer_stdout`:

```
✓ scored 5 roles → Apply 3 · Consider 1 · Skip 1 (skip 20%)
```

### 2c. The results table, pasted from `runs/triage-sample/triage-report.md`

| Posting | Result | Sponsorship evidence | Fit | Liveness | Next action |
|---|---|---|---|---|---|
| Sigma Computing — Data Engineer | **Apply** 0.525<br>composite 0.525 ≥ 0.3, gates healthy<br>`(0.9·0.35 + 0.7·0.3) × 1 × 1 = 0.525` | Proven, p 0.9 `model-judgment` · approvals 136 `record` · DE-family titles: Senior Analytics Engineer `model-judgment` | 0.7 `model-judgment` — Exact target title with no seniority marker; US location. Stack not checked (description not read). | active on 2026-10-03 → factor 1 `record` | Tailor an application (research-and-apply hours). |
| Klaviyo — Analytics Engineer | **Apply** 0.525<br>composite 0.525 ≥ 0.3, gates healthy<br>`(0.9·0.35 + 0.7·0.3) × 1 × 1 = 0.525` | Proven, p 0.9 `model-judgment` · approvals 154 `record` · DE-family titles: Business Intelligence Engineer `model-judgment` | 0.7 `model-judgment` — Data Engineer-family title (SQL/dbt modelling side, matching persona skills); no seniority marker; US location. | active on 2026-10-03 → factor 1 `record` | Tailor an application (research-and-apply hours). |
| Gusto — Senior Data Engineer | **Apply** 0.465<br>composite 0.465 ≥ 0.3, gates healthy<br>`(0.9·0.35 + 0.5·0.3) × 1 × 1 = 0.465` | Proven, p 0.9 `model-judgment` · approvals 218 `record` · DE-family titles: Business Intelligence Engineer `model-judgment` | 0.5 `model-judgment` — Right work, but 'Senior' is about one level above a new grad: a stretch. | active on 2026-10-03 → factor 1 `record` | Tailor an application (research-and-apply hours). |
| Gemini — Senior Data Engineer | **unscored** (not-in-csv) | missing: not-in-csv | 0.5 `model-judgment` — Right work, one level too senior; remote-in-US option helps a relocating candidate. | active on 2026-10-03 → factor 1 `record` | No sponsorship record found under this name. Check name variants by hand (legal vs brand name) before spending time. |
| Airbnb — Senior Staff Data Engineer, Foundational Data | **Consider** 0.230<br>composite 0.230 in the Consider band [0.2, 0.3)<br>`(0.4·0.35 + 0.3·0.3) × 1 × 1 = 0.230` | Possible, p 0.4 `model-judgment` · approvals 1000 `record` · DE-family titles: none `model-judgment` | 0.3 `model-judgment` — Senior Staff is several levels above new-grad; poor fit despite the right domain. | active on 2026-10-03 → factor 1 `record` | Check the soft spot named in "why"; if it holds up, talk to someone at the company before applying (networking hours). |
| Robinhood — Senior Software Engineer, Data Engineering | **unscored** (not-in-csv) | missing: not-in-csv | 0.5 `model-judgment` — Data engineering work at senior level: a stretch for a new grad. | active on 2026-10-03 → factor 1 `record` | No sponsorship record found under this name. Check name variants by hand (legal vs brand name) before spending time. |
| Stripe — Software Engineer, Data Orchestration | **Skip** 0.000<br>gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)<br>`(0.4·0.35 + 0.7·0.3) × 0 × 1 = 0.000` | Possible, p 0.4 `model-judgment` · approvals 1250 `record` · DE-family titles: none `model-judgment` | 0.7 `model-judgment` — Orchestration work lines up with the persona's Airflow skill; no seniority marker; location unknown. | uncertain on 2026-10-03 → factor 0 `record` | Skip. Time is better spent elsewhere. |

Timeline gate (the same for all postings): OPT 2027-03-01 + 90 days = 2027-05-30; minus the 10-day buffer = **2027-05-20**. Today + 45 days = 2026-11-17, which is before the OPT start, so the earliest start is **2027-03-01**. Slack is **80 days**, so the factor is **1**.

## 3. Verified vs. inferred, line by line (Sigma Computing row)

| Value | Label | Where it came from |
|---|---|---|
| `SIGMA COMPUTING INC` matched "Sigma Computing" | `record` + rule | CSV line 24191; exact match after removing "inc" |
| HQ state CA | `record` | CSV `state` |
| 136 approvals, 0 denials, 100% approval rate | `record` | CSV `Total Approvals`, `Total Denials`, `Approval_Rate` |
| Top titles `['Software Engineer', 'Senior Analytics Engineer', 'Engineering Manager', 'Field and Partner Marketing Manager']` | `record` | CSV `top_job_titles_sponsored` |
| "Senior Analytics Engineer" counts as Data Engineer-family | `model-judgment` | `rules.json` family patterns (Claude-proposed) |
| Tier Proven, p = 0.9 | `model-judgment` | Tier rule: family title + approvals ≥ 10; p copied from `ch11-roles.json` |
| Fit 0.7 | `model-judgment` | Claude's rating from title, level and location; description not read |
| Liveness "active" on 2026-10-03, factor 1 | `record` | `ats:liveness` output |
| Timeline factor 1 | `your-input` | Persona dates plus author-chosen rule |
| Composite 0.525 → Apply | output of the existing scorer | `(0.9·0.35 + 0.7·0.3) × 1 × 1`; weights 0.35 and 0.30 are the scorer's own |

**Across the whole run:** every number that says what a company *did* is a `record`. Every number that says what that *means* for a Data Engineer candidate (family match, tier, p, fit) is `model-judgment`. Every number about the candidate's clock is `your-input`. The Apply/Consider/Skip decision therefore rests on **two model-judgment votes multiplied by record and your-input gates**. A reader should weigh it accordingly.

## 4. Verification: how the output was checked

**(a) Hand cross-check against the source CSV with an independent parser.** Python's `csv` module, not the prototype's JavaScript parser:

```
$ python3 crosscheck.py   # independent parser (Python csv module), same CSV
line 1014: AIRBNB INC | state=CA | approvals=1000.0 | denials=10.0 | rate=99.009900990099 | titles=['Software Engineer', 'Senior Software Engineer', 'Data Scientist', 'Senior Data Scientist', 'Engineering Manager']
line 10834: GEMINI SPACE STATION LLC | state=NY | approvals=24.0 | denials=0.0 | rate=100.0 | titles=['Senior Data Scientist', 'Manager, Product Design', 'Senior Analytics Engineer', 'Associate Director, Product']
line 11750: GUSTO INC | state=CA | approvals=218.0 | denials=4.0 | rate=98.1981981981982 | titles=['Software Engineer', 'Senior Analyst, Marketing Insights & Analytics', 'Software Engineer Manager', 'Business Intelligence Engineer', 'Head of Product Management, Tax Credits']
line 14495: KLAVIYO INC | state=MA | approvals=154.0 | denials=4.0 | rate=97.46835443037976 | titles=['Business Intelligence Engineer', 'Software Engineer II', 'Engineering Manager Data Exchange', 'Engineering Manager II- SMS', 'Senior Software Engineer']
line 22735: ROBINHOOD MARKETS INC | state=CA | approvals=824.0 | denials=24.0 | rate=97.16981132075472 | titles=['Software Engineer', 'Senior Software Engineer', 'Senior Staff Software Engineer', 'Engineering Manager', 'Senior Corporate Accountant']
line 24191: SIGMA COMPUTING INC | state=CA | approvals=136.0 | denials=0.0 | rate=100.0 | titles=['Software Engineer', 'Senior Analytics Engineer', 'Engineering Manager', 'Field and Partner Marketing Manager']
line 25633: STRIPE INC | state=CA | approvals=1250.0 | denials=22.0 | rate=98.27044025157232 | titles=['Software Engineer', 'Backend Engineer', 'Risk Strategist', 'Product Manager', 'Engineering Manager']
```

All five scored companies match the report exactly: Sigma 136, Klaviyo 154, Gusto 218, Airbnb 1000, Stripe 1250. The matched family titles are the right ones, and the exclusions behaved as intended: Klaviyo's "Engineering Manager Data Exchange" and Airbnb's "Data Scientist" were correctly *not* counted. A first attempt with `grep | cut -d,` printed executive names instead of approvals, because quoted fields contain commas. That is why the prototype has a real CSV parser.

**(b) What-if: were the two `not-in-csv` rows real misses?** The same run, with only Gemini and Robinhood retyped as their legal names:

```
$ node …/triage.mjs --today 2026-10-03 --candidates /tmp/candidates-legal-names.json --out-dir /tmp/de-h1b-legal-names   # what-if: Gemini/Robinhood typed by legal name
triage: 7 candidates → Apply 4 · Consider 2 · Skip 1 · unscored 0 (skip+unscored 14%)
  timeline gate: factor 1 [your-input] · earliest start 2027-03-01 · practical deadline 2027-05-20 · slack 80 days
gemini-senior-data-engineer → Apply 0.465 | Proven | (0.9·0.35 + 0.5·0.3) × 1 × 1 = 0.465
robinhood-senior-swe-data-engineering → Consider 0.29 | Possible | (0.4·0.35 + 0.5·0.3) × 1 × 1 = 0.290
```

**(c) Tests:** 12/12 pass in a clean checkout (`TEST-REPORT.md` §4).

**(d) Deliberate break attempts:** see the Attestation below.

## 5. Reflection

**What worked.**
- Missing evidence stayed missing. Gemini and Robinhood were reported `not-in-csv` with a next step, not scored as non-sponsors.
- The gates behaved as gates. Stripe's "uncertain" liveness zeroed a posting with a 0.7 fit.
- The "cannot start before OPT" rule mattered: the 45-day lag alone would have implied an impossible November start.
- The existing scorer was used unchanged, and a mutant scorer that ignores gates was caught.

**What the run got wrong or missed. These are corrections.**
1. **Prediction P1 came true and cost an Apply.** Exact name matching hid a Proven sponsor (Gemini). The recipe reports this honestly, but the *outcome* for the user is a lost lead unless they follow the "check name variants" next step.
2. **Prediction P5 was not fairly tested.** Skip+unscored was 43%, below the predicted ≥ 50%, and only 14% once names were fixed. The cause is the sample: postings were found by browsing job boards of companies already known to sponsor, so non-sponsors were barely represented. A real search over arbitrary postings would include many `no-h1b-record` and `not-in-csv` rows. The original prediction stays as written in the change brief; this is the correction.
3. **The six-state blind spot (P3) was not exercised.** All seven companies are headquartered in CA, NY or MA.
4. **The "Consider" next action is wrong for Airbnb.** The report says "check the soft spot named in why", but Airbnb is a Consider because its score is low (0.23, in the Consider band), not because of a soft spot. Two different kinds of Consider share one next-action text. That is a defect to fix in v0.2.
5. **Fit leans on titles only.** "Senior" vs. "Senior Staff" drove the fit differences. No description was read, so the stack match is unchecked.
6. **Airbnb's approvals are exactly 1000.0.** That may be a cap or rounding in the source file. The tool can't tell, and it's now listed under "cannot verify".

**One concrete next improvement.** Add a small, reviewed **brand → legal-name alias table** (`aliases.json` in the contrib folder, every entry labelled `your-input` with a source note), checked *after* exact matching fails, with the alias shown in G1 for human confirmation. On this sample it would turn both `not-in-csv` rows into scored rows, including the hidden Apply, without introducing fuzzy matching.

---

## Attestation

- Recipe: ethangomes14-data-engineer-h1b v0.1.0
- By: EthanGomes14 · 2026-10-03. **Pending:** the commands below were run by Claude (Claude Code) in a session directed by EthanGomes14. EthanGomes14 signs this after re-running at least the sample run, the tests and one break attempt, and opening the G2 links.

### Tested

| Ran | Saw | Expected |
|---|---|---|
| `node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03` (clean checkout) | 7 → Apply 3 · Consider 1 · Skip 1 · unscored 2; exit 0; only `generated_at` differs from the committed outputs | Same results as the committed sample; nothing written outside own folders |
| `node --test …/triage.test.mjs` (clean checkout, `4b3c9de`) | 12 pass, 0 fail | All pass offline |
| Hand cross-check of 7 CSV rows with Python's `csv` module | Approvals, titles and states identical to the report | Identical |
| **Break:** `npm run ats:liveness -- https://boards.greenhouse.io/airbnb/jobs/1` (invented job ID) | ✅ active (redirect to the careers page) | Expected the checker to say expired. **It doesn't**, so G2 needs a human. Documented, not hidden. |
| **Break:** `--scorer fixtures/BROKEN-apply-everything-scorer.mjs` (a scorer that ignores gates) | exit 3, `FAILED-gate-invariant`, violation on `ghosthire-de` | Refuse the run |
| **Break:** `--out-dir data/examples` | `STOP … outside this contribution's folders`, exit 2 | Refuse; write nothing |
| **Break:** `--csv fixtures/does-not-exist.csv` | `STOP: sponsor CSV not found`, exit 2, no log written | Stop without inventing anything |
| **Break:** `--today 2027-06-01` (OPT deadline passed) | Timeline factor 0, slack −57 days, all 5 scored → Skip | Every scored role Skip |
| What-if: Gemini/Robinhood retyped as legal names | Gemini → Apply 0.465 (Proven); Robinhood → Consider 0.29 | Confirms both `not-in-csv` rows were name misses, not non-sponsors |

### Did not test

- Node 20 (CI's version); only Node 25.8.0.
- The CI workflow (branch not pushed yet).
- A live run with a person clearing every gate.
- The six-state blind spot (P3) and title over-match (F8) on real postings.
- A real `expired` verdict from the liveness checker (only a fixture, and the invented-ID case that came back active).
- Opening the six "active" links by hand (G2). **This is the human's job before acting.**
- Whether past sponsors still sponsor today. The data cannot say.

### Broke during testing, fixed

- The CSV-quoting test asserted the wrong column (a fixture column miscount, not a parser bug). Fixed the assertion. (`09c3fd6`)
- The out-dir check refused `/tmp` on macOS (a symlink to `/private/tmp`). Fixed with real-path comparison. (`09c3fd6`)
- The out-dir check allowed *any* repo path when the repo itself lived under `/tmp`. Found only by the clean-checkout run. Fixed: in-repo paths must be in the contribution's folders. (`4b3c9de`)
