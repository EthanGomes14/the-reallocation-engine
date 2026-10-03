---
status: RUNNABLE-SAMPLE
todos_open: 2
last_gate: null
attestation: null
recipe_version: 0.4.0
---

# ethangomes14-data-engineer-h1b — Data Engineer H-1B sponsor screen

## Executive summary

**What it does.** Takes a short list of job postings and, for each one, checks whether the company has a public record of sponsoring work visas for Data Engineer-type roles, whether the posting is still open, and whether hiring could finish before the candidate's post-graduation work window (OPT) closes. It then asks the engine's existing scorer for **Apply**, **Consider** or **Skip**, shows where every number came from, and stops so a person can decide.

**Who it's for.** An international master's student on an F-1 visa, in the final semester before post-completion work authorization (OPT) begins, looking for new-grad Data Engineer work anywhere in the US (including jobs with other titles that do the same work), who will need an employer willing to sponsor an H-1B. The worked example uses a fictional persona, "Electrifier".

**What it decides, and what it doesn't.** It decides where the next hours of job-search effort go: an application to tailor, a company to network into, or a skip. It does not decide whether a company *will* sponsor; it only shows what the public record supports. Missing evidence is reported as missing, never filled in.

Two customers: this file is for the agent; `recipes/cases/2026fa/ethangomes14-data-engineer-h1b.card.md` is for the person.

**Handoff condition (done when).** A run is complete when the prototype exits 0 and:
- `screen-log.json` and `screen-report.md` both exist in the output folder;
- every candidate row appears exactly once, either scored by `scripts/score/role-scorer.mjs` or listed as unscored with exactly one reason code;
- every row handed to the scorer carries numeric liveness and timeline factors and a source label on every term;
- the gate-invariant check reports zero violations (no closed gate came back as anything but Skip).

"Looks right" is not the condition; the row accounting and the invariant check are.

## Lifecycle claim

- **Claimed:** `RUNNABLE-SAMPLE`. A full sample run completed on 2026-10-03 on seven real public postings and the shipped sponsor file. Conformance passes. v0.1.0 had 12 offline tests; v0.2.0 added the Greenhouse cross-check (15 tests); v0.3.0 removed the visa-timeline gate (13 tests, all passing). v0.3.1 renamed the program from `triage.mjs` to `sponsor-screen.mjs` (outputs `screen-log.json` / `screen-report.md`); behaviour unchanged. Earlier run logs show the old name as it was run. v0.4.0 restored the visa-timeline gate (15 tests, all passing). Run evidence is in `logs/runs/2026fa-ethangomes14-1.md` (v0.1.0), `-2.md` (v0.2.0), `-3.md` (v0.3.0), `-4.md` (v0.3.1), `-5.md` (v0.4.0) and `course/2026fa/submissions/ethangomes14/TEST-REPORT.md`.
- **Not claimed:** `RUNNABLE-LIVE` or `VERIFIED`. No live run with a human clearing every gate has been logged. `attestation` stays `null`.
- **Honest caveat.** `SNICKERDOODLE.md` makes `SPECIFIED` (zero open TODO markers) the step before `RUNNABLE-SAMPLE`. This recipe lists two proposed additions as open TODOs (§Proposed additions), as the assignment asks. Neither is on the sample path that ran. Read strictly, the constitution would call this a DRAFT with a working sample path. The claim above is made under the assignment's lifecycle and is stated here so a reviewer can apply either reading.

## Required reads

1. `SNICKERDOODLE.md`: gates, provenance, labels.
2. `DOMAIN.md`: known gaps, especially the scorer's `role_quality: 0.0` and the planned-but-absent directories.
3. `course/2026fa/submissions/ethangomes14/CHANGE-BRIEF.md`: the predictions this recipe is checked against.
4. This recipe and its card.

## Purpose and source inventory

| Source | Exact path / command | Used for | Label |
|---|---|---|---|
| 80 Days to Stay sponsor file | `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` (30,369 rows; read-only) | `company_name`, `state`, `Total Approvals`, `Total Denials`, `Approval_Rate`, `median_salary_offered`, `top_job_titles_sponsored` | `record` |
| Existing scorer | `scripts/score/role-scorer.mjs`; the prototype runs it as `node scripts/score/role-scorer.mjs <roles.json> --out-dir <dir>` (equivalent to `npm run score -- …`) | Apply / Consider / Skip and the per-term trace | as passed in |
| Existing liveness checker | `npm run ats:liveness -- <url> …` (`scripts/ats/check-liveness.mjs`), run **before** the prototype; stdout saved with a `# checked: YYYY-MM-DD` header | Is the posting open? | `record` |
| Prototype | `node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs [--today YYYY-MM-DD] [options]` | Gates G0–G3, evidence assembly, scorer call, both outputs (G4 is the person's release) | — |
| Decision rules | `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/rules.json` | Title family, exclusions, tier thresholds and p values, timeline factors, liveness freshness, name suffixes | each block carries `_source` |
| Persona (fictional) | `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/fixtures/persona-electrifier.json` | OPT start, 90-day limit, days used, buffer, hiring lag (the `visa_timeline` block), plus needs-sponsorship, target titles and skills | `your-input` |
| Sample candidates | `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/candidates-2026-10-03.json` | Seven real postings found via the public Greenhouse job-board API on 2026-10-03; fit ratings by Claude | fit: `model-judgment` |
| Sample liveness output | `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/liveness-2026-10-03.txt` | Saved `ats:liveness` stdout for those seven URLs | `record` |
| Greenhouse API fetch (the **only network step**) | `node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/fetch-greenhouse-status.mjs --candidates <json> …`; allowed host: `boards-api.greenhouse.io` only; one request every 0.5 s | Does each Greenhouse job ID still exist? 200 = exists, 404 = gone | `record` |
| Sample Greenhouse status | `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/greenhouse-status-2026-10-03.json` | Saved API answers for the 7 sample links plus the invented-ID break test | `record` |
| Break-test input | `samples/candidates-ghost-2026-10-03.json` + `samples/liveness-ghost-2026-10-03.txt` | An invented Airbnb job ID that `ats:liveness` calls active | — |
| Tests | `node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.test.mjs` | Offline, fixtures only | — |
| Input-shape reference | `data/examples/ch11-roles.json` | Shape of the `roles.json` the prototype writes | — |

Not used, on purpose:
- **SEC Form D samples** (`data/sec/form-d/processed/sample/`). They have zero name overlap with the sponsor file (checked 2026-10-03).
- **BLS role quality** (`data/bls/compact/soc_occupation_compact.csv`). The scorer weights it `0.0`.
- **`npm run bls:local-wage`**. It feeds no decision and fails on a fresh clone.

## Inputs

| Input | Shape | Required |
|---|---|---|
| Candidates file | `{ "candidates": [ { role_id, company, title, url, fit: { p ∈ [0,1], reason }, location?, greenhouse_board? } ] }`. `greenhouse_board` is needed only for company-hosted links (`…?gh_jid=<id>`) whose URL carries no board name. | yes |
| Greenhouse status | output of `fetch-greenhouse-status.mjs` (`--greenhouse-status`, default `samples/greenhouse-status-2026-10-03.json`). If the default file is absent the cross-check is reported as **not run**; an explicitly named missing file stops the run. | no |
| Liveness output | text: a `# checked: YYYY-MM-DD` line, then `ats:liveness` lines (`✅ active <url>` / `❌ expired <url>` / `⚠️ uncertain <url>`) | yes |
| Persona | JSON with `needs_sponsorship: true` and a `visa_timeline` block (`opt_start`, `unemployment_limit_days`, `unemployment_days_used`, `buffer_days`, `assumed_hiring_lag_days`) | yes |
| `--today` | `YYYY-MM-DD`; defaults to the local date | no |

The persona deliberately has **no** `authorization` field, and the prototype never passes `--profile` to the scorer. `applyProfile` in `role-scorer.mjs` turns the sponsorship weight to 0 when that text contains words like "authorized", which would silently erase this recipe's main signal.

## Phase gates

Each row stops at its first failed gate. A failed gate produces a reason code, never a guessed value.

| Gate | Test (machine) | Pass | Fail | What the person must see to clear it |
|---|---|---|---|---|
| **G0 Input** | Row has non-empty `role_id`, `company`, `title`, `url`; `fit.p` is a number in [0,1]; `fit.reason` is non-empty. The posting title matches the Data Engineer family and no exclusion word. | continue | `invalid-input-row` or `posting-not-data-engineer-family` | The rejected rows and their reasons in `screen-log.json` → `roles[].gates.G0_input` |
| **G1 Company match** | Normalized company name (lowercase, punctuation and legal suffixes removed) matches **exactly one** CSV row, and that row has `Total Approvals ≥ 1` | sponsorship tier assigned | `not-in-csv`, `ambiguous-match`, `no-h1b-record` | The input name beside the matched `company_name`, the approvals, and the titles that counted as Data Engineer-family. Confirm it is the same employer and the titles really are Data Engineer work. |
| **G2 Liveness (gate)** | The URL appears in the saved `ats:liveness` output; the check is ≤ 7 days old; the verdict is `active`; **and**, for Greenhouse links with a fresh (≤ 7 days) API result, the API did not return 404 | factor 1 | verdict `expired`/`uncertain` or stale → factor 0 (Skip); `active` + API 404 → factor 0, `closed_by: greenhouse-api-404`; URL absent from the liveness output → `url-not-in-liveness-log` (unscored). The API check can only close a gate, never open one; a missing, stale or failed API check changes nothing. | Open each "active" URL and confirm the final page is **this job**, not a general careers page. The cross-check covers Greenhouse links only (see card, failure mode 3). |
| **G3 Timeline (gate)** | earliest start = later of (today + hiring lag) and OPT start; practical deadline = OPT start + (limit − used) − buffer. Slack ≥ 10 days → 1; 0–9 → 0.5; < 0 → 0 | factor 1 or 0.5 | factor 0 → Skip | OPT start, lag, buffer, earliest start and slack, all `your-input`, in the report's timeline section |
| **G4 Release** | Both outputs exist; invariant check has zero violations; every value has a source label | report handed to the person | exit 3, `status: FAILED-gate-invariant`; do not use the run | The person reads `screen-report.md` and ticks its "You must confirm" list before acting on any Apply. The tool never applies or contacts anyone. |

Gate decisions are recorded in `logs/runs/2026fa-<handle>-<n>.md`. `logs/gate-decisions/` does not exist in this repo, so it is not used.

## Workflow (verbatim)

1. Confirm the toolchain and data:

   ```bash
   npm run doctor
   test -f data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv
   ```

2. Check liveness for every candidate URL and save the output with its date (the checker exits 1 if any URL is not active, so `|| true` keeps the output):

   ```bash
   { echo "# checked: $(date +%F)"; npm run ats:liveness -- <url1> <url2> ... || true; } > scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/liveness-<date>.txt
   ```

3. Ask the Greenhouse API whether each Greenhouse job ID still exists (network; allowed host `boards-api.greenhouse.io` only):

   ```bash
   node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/fetch-greenhouse-status.mjs --candidates scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/candidates-2026-10-03.json --candidates scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/candidates-ghost-2026-10-03.json
   ```

4. Run the screen on the sample (pinned date, reproducible; offline), then on the break-test input:

   ```bash
   node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs --today 2026-10-03
   node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs --today 2026-10-03 --candidates scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/candidates-ghost-2026-10-03.json --liveness scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/liveness-ghost-2026-10-03.txt --out-dir course/2026fa/submissions/ethangomes14/runs/screen-ghost
   ```

5. Run the offline tests and conformance:

   ```bash
   node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.test.mjs
   node scripts/conformance.mjs scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/ recipes/cases/2026fa/
   ```

6. **Stop.** Hand `screen-report.md` to the person for G1, G2 and G3, and log the run (template below).

## Source labels

| Value | Label | Why |
|---|---|---|
| Approvals, denials, approval rate, salary, sponsored titles, HQ state | `record` | Read from the CSV row |
| Which sponsored titles count as Data Engineer-family | `model-judgment` | Title family and exclusions were proposed by Claude |
| Sponsorship score p (Proven 0.9 / Likely 0.6 / Possible 0.4) | `model-judgment` | Claude's rule applied to records (author's decision); p values copy `data/examples/ch11-roles.json` |
| Fit | `model-judgment` | Claude's rating from title, seniority and location; descriptions not read in v0.1 |
| Liveness verdict and factor | `record` | Output of `ats:liveness`, with check date |
| Greenhouse API status (200 / 404) | `record` | Saved output of `fetch-greenhouse-status.mjs`, with check date |
| OPT dates, buffer, hiring lag, timeline factor | `your-input` | Persona values and an author-chosen rule |

## What it can verify

- That a named company **has a row** in the shipped sponsor file under its normalized name, and what that row says: approvals, denials, rate, and up to ~5 top sponsored titles.
- That one of those listed titles **matches the Data Engineer family rule** (a rule, labelled as such).
- That the repo's liveness checker **said** `active` / `expired` / `uncertain` for a URL on a given date.
- That the timeline arithmetic for the persona's inputs gives the stated earliest start, deadline and slack.
- For Greenhouse links: whether the job ID **still exists** on that board per the public API on a given date (200 / 404). An "active" verdict with an API 404 is closed as a redirected dead posting (the invented Airbnb ID in the break test).
- That the existing scorer received complete, labelled evidence and that its output **respects the gates** (closed gate → Skip).
- Row accounting: every candidate is either scored or unscored with exactly one reason.

## What it cannot verify

- **Current intent to sponsor.** Approvals carry **no year**; a company that stopped sponsoring years ago looks the same as an active sponsor.
- **Data Engineer-specific sponsorship volume.** `Total Approvals` is **company-wide** across all titles. A Data Engineer title in the top ~5 says the company sponsored that kind of role, not how often.
- **Absence.** A missing family title is not proof the company never sponsored one; the list holds only ~5 titles.
- **Coverage outside six states.** Every row with H-1B data is headquartered in CA, NY, MA, WA, TX or IL. For a nationwide search, a company headquartered elsewhere comes back `not-in-csv` or `no-h1b-record` even if it sponsors. The `state` column is headquarters, not job location.
- **Brand vs. legal names.** Matching is exact after normalization. "Gemini" does not match "GEMINI SPACE STATION LLC", and "Robinhood" does not match "ROBINHOOD MARKETS INC" (both seen in the sample run). Those are false negatives, reported as `not-in-csv`.
- **Whether "active" means this job, outside Greenhouse.** The checker has reported a redirect to a general careers page as `active` (observed 2026-10-03). The API cross-check catches this for Greenhouse links only, not Lever, Ashby, Workday or other boards. G2 therefore still requires a person.
- **Whether an existing job is still being filled.** An API 200 means the job ID exists, not that the team is still hiring.
- **Whether "uncertain" is really closed.** Stripe's posting came back `uncertain` from the checker (no visible apply button) but **200** from the API. The cross-check never re-opens a gate, so it stays Skip; a person may decide otherwise.
- **Whether a round number is real.** Airbnb's row shows exactly `1000.0` approvals. The file may cap or round values; nothing local can confirm it.
- **Fit quality.** Fit is Claude's judgment from titles; job descriptions and the candidate's résumé were not read.
- **Out of scope:** E-Verify enrollment (needed for a STEM OPT extension), Form D funding, BLS role quality and wages, and what any employer will offer.

## Output contract

### Agent output — `screen-log.json`

Written to `--out-dir` (default `course/2026fa/submissions/ethangomes14/runs/screen-sample/`). Fields:

`workflow`, `recipe`, `recipe_version`, `mode`, `status` (`complete` | `FAILED-gate-invariant`), `generated_at`, `today`, `inputs` (path, sha256 and row count of each input; the liveness and Greenhouse check dates), `timeline_gate` (factor, source, detail), `counts` (candidates, unscored, apply, consider, skip, `skip_or_unscored_rate`), `unscored_reasons`, `gate_invariant_violations`, `roles[]` (per row: `gates.G0_input`, `gates.G1_company_match`, `gates.G2_liveness` (with `cross_check` status, HTTP status and `closed_by` when the API closed it), `location`, `sponsorship` with every evidence field as `{ value, source }`, `fit`, `posting_title_in_family`, `status`, `reason`, `scorer` (recommendation, composite, why, arithmetic, trace), `next_action`, `network_target`), `network_list`, `human_gates_pending`, `outputs`, `scorer_stdout`.

Also written beside it: `roles.json` (the scorer's input) and the scorer's own `role-scores.json` / `role-scores.md`.

### Human output — `screen-report.md`

Reader: the job-seeker (or their adviser) deciding what to do with the next block of search hours. Sections:
1. **Executive summary**, in plain language.
2. **Priority list (highest priority first)**: one row per posting with company, job, location, score, sponsorship record, fit, whether the posting is live (with the API status), what to do and a link. Order: Apply now → Consider → Research first (live posting, no usable record yet) → Network, don't apply → Skip → Out of scope; within a group, higher score first.
3. **Results table**: posting, result with the scorer's reason and arithmetic, sponsorship evidence, fit, liveness, next action. Every value is tagged with its label.
4. **Timeline gate**.
5. **You must confirm before acting**: the G1–G4 checklist plus one G2 line per live URL.
6. **Companies to network into**: from the candidates, plus the top Proven-tier Data Engineer-family sponsors not on the list.
7. **What this run cannot tell you**.
8. **Run record**: inputs with hashes, scorer summary, any invariant violations.

## Next action per result (the 3-3-2 connection)

| Result | Next action | Which hours it feeds |
|---|---|---|
| **Apply** | Tailor an application to this posting | the 2 research-and-apply hours |
| **Consider** | Check the soft spot in the scorer's "why" (Likely/Possible tier, tight timeline); if it holds, reach someone at the company first | networking (3) before applying |
| **Skip**, liveness gate closed, tier Proven or Likely | **Network into the company**: strong sponsor record, no open posting | networking (3) |
| **Skip**, otherwise | Skip | frees time |
| **unscored**: `not-in-csv` / `ambiguous-match` | Check legal and brand name variants by hand before spending more time | research (2), bounded |
| **unscored**: `no-h1b-record` | Treat sponsorship as unknown; skip unless there is a referral | — |
| **unscored**: `url-not-in-liveness-log` | Run `ats:liveness` for that URL and re-run | — |
| **unscored**: `posting-not-data-engineer-family` | Out of target; skip, or widen the family rule deliberately and log it | — |

## Stop conditions

Stop, write nothing, and exit 2 when:
- the sponsor CSV, candidates file, liveness output, persona or rules file is missing or unparseable;
- the CSV lacks `company_name`, `Total Approvals` or `top_job_titles_sponsored` (schema drift);
- the persona's timeline cannot be computed, or `needs_sponsorship` is not `true`;
- a Greenhouse status file is named with `--greenhouse-status` but does not exist or does not parse;
- `--out-dir` is outside this contribution's folders.

Stop with exit 3 when the scorer fails, or its output breaks the gate invariant.

Refuse, in this recipe, to:
- fill a missing sponsorship value with 0 or any default;
- let a missing liveness or timeline value reach the scorer (it would default the gate to open);
- fuzzy-match company names;
- pass `--profile` to the scorer;
- edit the sponsor CSV;
- add role-quality weight (the scorer's `role_quality: 0.0` is an open authorial decision, not this recipe's to make).

## Proposed additions

| Addition | Why it belongs | Tag |
|---|---|---|
| Brand → legal-name alias table: a small, reviewed `aliases.json` in the contrib folder mapping names job-seekers type ("Gemini") to the legal names in visa filings ("GEMINI SPACE STATION LLC"). Checked only after exact matching fails; every entry labelled `your-input` with a source note; the alias shown in G1 for the person to confirm. | Fixes the biggest real miss in the sample run (prediction P1): Gemini, a Proven sponsor, came back `not-in-csv` and would have been an Apply (0.465) under its legal name. Keeps the no-fuzzy-matching rule, because every alias is a checked human decision. | [TODO: DEV] |
| Dated, title-level H-1B data: the DOL LCA disclosure files by fiscal year, with SOC code and job title per filing | Would let the tier rule use recent Data Engineer filings instead of undated company-wide totals, and would cover companies outside the six HQ states | [TODO: DATA SOURCE] |

**Done in v0.2.0 (was a TODO):** the Greenhouse liveness cross-check (`fetch-greenhouse-status.mjs` plus the API check in G2). It caught the invented Airbnb job ID that `ats:liveness` called active.

Smaller idea, not tracked as a TODO: fit ratings that read the job description.

## Facts that bite, and how this recipe handles them

| Fact (assignment numbering) | Handling |
|---|---|
| 1. Role quality has weight 0.0 | Not used; not re-weighted. Listed under "cannot verify". |
| 2. `bls:local-wage` feeds nothing | Not used. |
| 3. Only SEC samples ship | Not used: zero overlap with the sponsor file, measured. |
| 4. `data/raw/`, `data/verified/`, `logs/gate-decisions/` don't exist | Every path in this recipe exists. Gate decisions go to `logs/runs/`. |
| 5. The `snickerdoodle` CLI is roadmap | Not referenced. Every command here is `node` or `npm run`. |
| 6. Every top-level recipe is DRAFT | Lifecycle claim states exactly what was run, plus the SPECIFIED caveat. |
| 7. `bls:local-wage` fails on a fresh clone | Not used. |
| 8. `validate-h1b-join-sample.py` needs full data | Not used. Uses the shipped CSV directly. |

## Verification checks

- `node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.test.mjs`: 15 tests, including F1–F7, the Greenhouse cross-check, and four break attempts.
- `node scripts/conformance.mjs scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/ recipes/cases/2026fa/`
- Hand check: pick one scored row in `screen-log.json` and find its `csv_company_name` in the CSV. `total_approvals` and `top_titles_sponsored` must match the row exactly.
- Row accounting: `counts.candidates == counts.unscored + counts.apply + counts.consider + counts.skip`.

## Logging rules and run-log template

Never edit `logs/RUN_LOG.md` (protected for contributors). Write `logs/runs/2026fa-<handle>-<n>.md`:

```markdown
## YYYY-MM-DD — data-engineer-h1b sponsor screen (<sample|live>)

- **Recipe:** recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md v<version>
- **Inputs:** <candidates file> · <liveness output, checked YYYY-MM-DD> · <persona> · sponsor CSV sha256 <first 12>
- **Command:** <exact command>
- **Outputs:** <out-dir>/screen-log.json · <out-dir>/screen-report.md · roles.json · role-scores.{json,md}
- **Result:** <n> candidates → Apply <a> · Consider <c> · Skip <s> · unscored <u> (<reasons>); invariant violations <0|n>
- **Gate decisions:** G1 <who, what was confirmed/rejected> · G2 <who, which URLs opened> · G3 <who confirmed the timeline inputs> · G4 <who read the report>
- **Open issues:** <what did not work or is still missing>
```

Do not log secrets, real contact details, résumés or private application notes.
