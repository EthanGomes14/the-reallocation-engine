# Change Brief — Data Engineer H-1B Sponsor Triage

## Executive summary

**What this is.** The plan written *before* anything was built: who the tool is for, what data it will use, where it must stop and hand the decision to a person, and what is expected to go wrong.

**Why read it.** It is the "predict" half of predict-then-check. The later test report and worked run are judged against these predictions. Once this file is first committed, the predictions below are never edited; changes are added at the bottom, dated.

**What it decides.** The tool is built for a fictional international master's student, "Electrifier", in the last semester before work authorization starts, looking for Data Engineer jobs (and jobs with other titles that do the same work) anywhere in the US. For each job under consideration, it checks public records of which companies have actually sponsored work visas for this kind of role, confirms the posting is still open, and confirms the hiring timeline fits the student's limited post-graduation work window. It then says Apply, Consider, or Skip, shows where every number came from, and stops for a person to decide. Companies with strong sponsorship records but no open posting become a list to network with instead.

---

## Record

| Field | Value |
|---|---|
| Author | EthanGomes14 (GitHub handle) |
| Written | 2026-10-03 |
| Branch | `contrib/2026fa-ethangomes14-data-engineer-h1b` |
| Base commit | `015843d` (matches `upstream/main` on 2026-10-03) |
| Persona | `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/fixtures/persona-electrifier.json` (fictional; no real person's details) |
| Recipe (planned) | `recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md` + `.card.md` |
| Prototype (planned) | `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/` |
| Drafting | Drafted by Claude (Claude Code) from the author's decisions; reviewed and edited by the author. See `SOURCES.md` and `FRICTIONAL.md`. |

### How this brief covers the assignment's "Predict" requirements

| Requirement | Section |
|---|---|
| Career situation and engine layer(s) | §1 |
| Existing data/scripts reused (exact paths), and proposed additions with reasons | §2 |
| Gates, and what a human must see to clear each | §3 |
| At least two predicted failure cases, and how each is checked | §4 |
| A prediction about what the prototype will get wrong on the first pass | §5 |
| Keep original predictions; add revisions | §7 |

---

## 1. Career situation and engine layers

### The persona: Electrifier (fictional)

| Attribute | Value (all `your-input`, from the persona file) |
|---|---|
| Status | International student on an F-1 visa, **final semester** of an M.S. in Data Science |
| Program ends | 2026-12-18 |
| Post-completion OPT starts | 2027-03-01 (expected) |
| OPT unemployment limit | 90 days (8 CFR 214.2(f)(10)(ii)(E)) |
| Safety buffer | 10 days |
| Legal deadline to be employed | 2027-05-30 (OPT start + 90 days) |
| **Practical deadline** | **2027-05-20** (legal deadline − 10-day buffer) |
| Assumed hiring lag (apply → start date) | 45 days |
| Location | Based in Chicago, IL; open to relocating **anywhere in the USA** |
| Long-term need | An employer willing to sponsor an **H-1B** |
| Target role | **Data Engineer**, new-grad / early-career level |

**Target roles include other titles doing the same work.** The persona targets any role matching this general description: *builds and maintains batch and streaming data pipelines (ETL/ELT), data warehouses and lakehouses, and data platform tooling so analysts and ML teams get reliable, modeled data.*

| Data Engineer title family (counts as a match) | Excluded words (do not count) |
|---|---|
| Data Engineer · Analytics Engineer · ETL Developer/Engineer · Data Warehouse Engineer/Developer · Big Data Engineer/Developer · Data Platform Engineer · Data Pipeline Engineer · Data Integration Engineer/Developer · Data Infrastructure Engineer · Business Intelligence (BI) Engineer · Database Developer · Software Engineer, Data / Data Platform / Data Infrastructure | Manager · Director · Head of · VP · Analyst · Specialist · Architect · Scientist (wrong level or different job for a new grad) |

**Why this is specific, not generic.** Three constraints combine here and would not apply to "any international job-seeker":
1. The OPT clock **has not started**, so the earliest possible start date is fixed in the future. Applying too early is as useless as applying too late.
2. Sponsorship evidence must be for **Data Engineer–type work**. A company that sponsored 500 nurses is not evidence for a Data Engineer role.
3. Data Engineer work hides behind **many titles**, so a keyword search for "Data Engineer" alone misses real matches.

### Engine layers this recipe draws on

| Layer | Used? | Role in the decision |
|---|---|---|
| **80 Days to Stay** — H-1B sponsorship history (`data/80-days-to-stay/`) | **Yes** | **Vote:** has this company sponsored Data Engineer–family roles? |
| **Job-Ops** — ATS posting liveness (`scripts/ats/`) | **Yes** | **Gate:** is this posting real and still open? |
| **Visa timeline** (no repo layer; computed from persona inputs) | **Yes** | **Gate:** can hiring finish inside the OPT window? |
| 80 Days to Stay — SEC Form D funding (`data/sec/form-d/processed/sample/`) | No | Shipped samples have zero overlap with the sponsor file (§2) |
| The Cognitive Pivot — BLS/O\*NET role quality (`data/bls/compact/`) | No | Scorer weight is `0.0`; Data Engineer has no single SOC code |

---

## 2. What I will reuse, and what I'm proposing

### 2a. Existing data and scripts (exact paths)

| What | Path / command | How it is used |
|---|---|---|
| Sponsor file | `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` | Look up each company; read `company_name`, `state`, `Total Approvals`, `Total Denials`, `Approval_Rate`, `median_salary_offered`, `top_job_titles_sponsored`. **Read-only.** |
| Scorer | `scripts/score/role-scorer.mjs`, run as `npm run score -- <roles.json> --out-dir <my folder>` | Combines votes and gates into Apply / Consider / Skip with an audit trace. **Used as-is, not re-implemented.** |
| Input shape | `data/examples/ch11-roles.json` | Template for the `roles.json` the prototype writes |
| Liveness checker | `scripts/ats/check-liveness.mjs`, run as `npm run ats:liveness -- <url>` | Run separately before the prototype; its verdict and check date are recorded in the input file |
| Toolchain checks | `scripts/conformance.mjs`, `npm run verify`, `npm run doctor`, `scripts/pii-scan.mjs` | Before every commit and in the PR |

### 2b. What the data looked like on 2026-10-03

Claude counted these with one-off Python queries. They are **not yet output from the prototype**: the prototype must reproduce them, and at least one row will be hand-checked against the CSV.

| Observation | Count |
|---|---|
| Company rows in the sponsor CSV | 30,369 |
| Rows with any H-1B approval data | 1,557 |
| …headquarters states among those rows | **only 6**: CA 860 · NY 257 · MA 227 · WA 87 · TX 77 · IL 49 |
| Companies with a "data engineer" title in their top sponsored titles, before exclusions | 64 |
| Companies with a **Data Engineer–family** title, after exclusions | **78** (56 with a "Data Engineer" title, plus 22 with family-only titles such as "Business Intelligence Engineer", "Analytics Engineer" or "Software Engineer, Data") |
| …of those, approvals ≥ 10 / 1–9 | 59 / 19 |
| Titles removed by the exclusion list (all were manager or director roles) | 8 companies, e.g. "Manager, Data Engineering" |
| Companies in the four shipped Form D samples | 196 |
| Form D sample companies matching a CSV company by normalized name | **0** |

### 2c. Behaviour of existing scripts the design must work around

- **The scorer treats a missing gate as open.** `role-scorer.mjs` uses `liveness?.factor ?? 1` and `timeline?.factor ?? 1`. → The prototype always writes both factors, or refuses to score the role.
- **The scorer silently drops a missing vote.** A role with no sponsorship value just scores lower; with a fit of 0.7 it would land in *Consider*. → The prototype catches "no record" cases **before** the scorer and reports them separately.
- **The profile check can switch sponsorship off.** `applyProfile` sets the sponsorship weight to 0 when the profile's `authorization` text contains words like "authorized". → The prototype does not pass `--profile` (so the scorer defaults to "needs sponsorship"), and the persona file has no `authorization` field.
- **`ats:liveness` can report a dead posting as active.** On 2026-10-03, `https://boards.greenhouse.io/airbnb/jobs/1` (an invented job ID) redirected to Airbnb's general careers page and was reported ✅ active. Greenhouse's JSON API returned 404 for that ID and 200 for a real posting (`8224032`).
- **`pii-scan.mjs` flags any file named `profile.yml`** outside the shared persona folders, so the persona is stored as `persona-electrifier.json` in the contrib folder.

### 2d. Proposed additions (not in the repo yet)

| Addition | Why it belongs | Tag |
|---|---|---|
| **Prototype script** in the contrib folder. It reads a candidate-roles file, matches each company to the sponsor CSV, applies the title-family and tier rules, computes the timeline factor from the persona, writes `roles.json`, calls the existing scorer, and writes a JSON log for the agent and a Markdown report for the person. | No existing script turns sponsor-CSV rows into scorer evidence for a specific job family, or computes an OPT-window gate | `[TODO: DEV]` |
| **Title-family matcher:** a sponsored title counts if it contains a family term (§1) and none of the excluded words | "Data Engineer" alone misses real matches; unfiltered family terms pull in managers and analysts | Rule decided above; `[TODO: DEV]` |
| **Sponsorship tier rule:** **Proven** p=0.9 if a family title is listed and approvals ≥ 10; **Likely** p=0.6 if a family title is listed and approvals are 1–9; **Possible** p=0.4 if approvals ≥ 1 but no family title is listed; otherwise *missing* (never p=0) | Turns counts into a scorer vote by an explicit, testable rule. The p values copy the tier values in `ch11-roles.json`. **Caveat:** approvals are company-wide across all titles. | Rule decided above; `[TODO: DEV]` |
| **Timeline rule:** practical deadline = OPT start + (90 − days used) − buffer. Earliest start = the later of (today + hiring lag) and the OPT start, since work cannot start before OPT. Earliest start after the deadline → factor 0 (gate closed); within 10 days of it → 0.5; otherwise 1.0 | The scorer needs a timeline factor, and the repo has no OPT-clock calculator | Rule decided above; `[TODO: DEV]` |
| **Fit vote:** Claude rates each posting 0–1 for **role match only** (title, seniority, stack and description against the persona's target description and skills), with a one-line reason stored next to each rating. Scale: 0.9 strong · 0.7 good · 0.5 stretch (e.g. one level too senior) · 0.3 poor. The prototype calls no AI service; it reads the stored ratings. | Without fit, the highest possible score is 0.35, so almost nothing reaches Apply. Kept separate from sponsorship to avoid counting the same evidence twice. | Rule decided above; `[TODO: DEV]` |
| **Greenhouse liveness cross-check** against `boards-api.greenhouse.io/v1/boards/<board>/jobs/<id>` (404 = expired) | Closes the redirect false positive in §2c. It is a network call, so it stays a proposal outside the offline prototype. | `[TODO: DEV]` |

### 2e. Source labels

| Value | Label | Reason |
|---|---|---|
| Approvals, denials, approval rate, sponsored titles, state | `record` | Read directly from the CSV row; kept in the JSON log |
| Sponsorship score p (0.9 / 0.6 / 0.4) passed to the scorer | `model-judgment` | **Author's decision:** the rule that turns counts into p was proposed by Claude, so the score is labelled as Claude's judgment applied to records, not as a record |
| Fit | `model-judgment` | Claude's rating of the role |
| Liveness verdict | `record` | Output of `npm run ats:liveness`, with check date |
| OPT dates, buffer, hiring lag, timeline factor | `your-input` | Persona inputs and a rule chosen by the author |

---

## 3. Gates — where the recipe stops and a person decides

All outputs go under `course/2026fa/submissions/ethangomes14/runs/`, which exists. Gate decisions are recorded in `logs/runs/2026fa-ethangomes14-1.md`, because `logs/gate-decisions/` does not exist.

| Gate | Testable condition | What the person needs to see to clear it |
|---|---|---|
| **G0 Input** | The candidate-roles file parses, and every row has `company`, `title`, `url`, `liveness` (verdict + date) and `fit` (rating + reason) | The list of rejected rows, each with a reason |
| **G1 Company and title match** | The company name matches exactly one CSV row after normalization (lowercase, punctuation and suffixes such as Inc/LLC removed); no fuzzy matching | The input name next to the matched CSV `company_name`, the sponsored titles that counted as family matches, and the approvals. The person confirms it is the same employer and that the matched titles really are Data Engineer–type work. |
| **G2 Liveness (gate)** | Liveness verdict is `active` and was checked within the last 7 days; `expired`, `uncertain` or stale → factor 0 | The requested URL, the final URL after redirects, and the verdict. **The person confirms the final page is the specific job, not a general careers page.** |
| **G3 Timeline (gate)** | Earliest start ≤ practical deadline (2027-05-20); otherwise factor 0 | OPT start, hiring lag, buffer, earliest start and slack in days, all labelled `your-input` |
| **G4 Release** | The JSON log and Markdown report both exist, and every value carries a source label | The person reads the report before acting on any Apply. The tool never applies, emails or contacts anyone. |

---

## 4. Predicted failure cases, and how each is checked

| # | Failure case | Expected behaviour (no invented value) | How it will be checked |
|---|---|---|---|
| F1 | Company not in the CSV | `missing: not-in-csv`; not scored; listed separately as "no sponsorship record — research by hand" | Test fixture with an invented company name |
| F2 | Company is in the CSV, but its H-1B fields are empty | `missing: no-h1b-record`; not treated as p=0 | Fixture using a real CSV row with empty `Total Approvals` |
| F3 | Company has approvals, but no family title among its listed titles | Tier **Possible**, noted "top titles list only ~5 titles; absence is not proof" | Fixture using a real sponsor row with no family title |
| F4 | Posting redirects to a general careers page and the checker says "active" | Not auto-cleared: G2 shows requested vs. final URL and waits for the person | Re-run `npm run ats:liveness -- https://boards.greenhouse.io/airbnb/jobs/1` and compare |
| F5 | Earliest start is after the practical deadline, or the deadline has passed | Timeline factor 0 → Skip (gated) | Fixture with a "today" date after 2027-05-20 |
| F6 | Company name variant ("Acme Inc" vs "ACME, INC." vs "Acme Holdings LLC") | Exact-normalized matching misses it, so the row falls to F1. Reported as a possible false negative. | Fixture with a known sponsor under a variant name |
| F7 | Input row is missing its liveness or timeline value | Refused at G0; the scorer is never allowed to default the gate to 1 | Fixture with the field deleted |
| F8 | Title family over-matches: a sponsored title contains a family term but isn't Data Engineer work, e.g. "Software Engineer, Database Sources" | Counted as a match, but G1 shows the matched title so the person can reject it | Fixture with a borderline title; check that the report shows it |

---

## 5. Predictions: what the first pass will get wrong or miss

| # | Prediction | How it will be checked |
|---|---|---|
| P1 | **Name matching will miss real sponsors.** H-1B filings use legal entity names, postings use brand names. At least one company on the candidate list that is believed to sponsor will come back `not-in-csv`. | Count `not-in-csv` rows in the first run; inspect each by hand |
| P2 | **Old sponsors will look current.** Approvals carry no year, so a company that stopped sponsoring years ago will still score Proven or Likely, and the prototype won't detect it. | Note in the "can't verify" list; spot-check one company |
| P3 | **Nationwide search, six-state data.** Sponsor data covers companies headquartered in only 6 states. Postings from companies headquartered elsewhere (e.g. Georgia, Virginia, North Carolina) will mostly come back with no sponsorship record, even if they sponsor. | Count missing results by company HQ state in the first run |
| P4 | **The title family will both over- and under-match.** Some borderline titles will count (F8), and Data Engineer work listed only as "Software Engineer" with no data word will be missed. | Read every matched title in the G1 output of the first run |
| P5 | **At least half of candidate roles will end as Skip or unscored.** If fewer do, the inputs or tier rule are probably too generous. | Skip rate in the scorer's report plus the count of unscored rows |

---

## 6. Out of scope for v0.1 (deliberate)

- **STEM OPT / E-Verify enrollment.** A STEM OPT extension requires an E-Verify employer. The repo has no E-Verify data, and this recipe focuses on H-1B sponsorship first. Candidate future `[TODO: DATA SOURCE]`.
- **Funding (Form D).** Shipped samples have zero overlap with the sponsor CSV; full quarters are gitignored.
- **Role quality / wages (BLS, SOC codes).** Weight 0.0 in the scorer; Data Engineer maps to several SOC codes (15-1243, 15-1252, 15-2051).
- **Job location vs. HQ.** The CSV's `state` is company headquarters, not where the job is.
- **Live scanning or fetching.** The prototype makes no network calls; liveness is checked separately with the existing script.
- **Future behaviour.** Past sponsorship is not a promise to sponsor this candidate.

---

## 7. Prediction record

**Rule:** from the first commit of this file onward, §4 and §5 are frozen as written. If a prediction turns out wrong, it stays here unchanged; the correction is added below with a date and a link to the evidence (test report, worked run or commit).

### Revisions (append only — newest last)

- **2026-10-03 — pre-commit drafting.** Switched from the author's own details to the fictional persona "Electrifier" (no personal details). Widened the target from "Data Engineer" to the Data Engineer title family with exclusions. Labelled the sponsorship score `model-judgment` (author's decision). Added the six-state coverage finding and predictions P3–P4. Nothing in this file had been committed before this entry.
- **2026-10-03 — outcomes after the first sample run** (predictions above unchanged; evidence in `WORKED-RUN.md`, `TEST-REPORT.md`, `logs/runs/2026fa-ethangomes14-1.md`).
  - **P1 — confirmed.** "Gemini" and "Robinhood" came back `not-in-csv`. Their legal names (GEMINI SPACE STATION LLC, ROBINHOOD MARKETS INC) are in the file. A what-if run with legal names turned Gemini into Proven / Apply 0.465.
  - **P2 — confirmed as a limit, not observable.** Nothing in the output reveals stale sponsors; it stays on the "cannot verify" list.
  - **P3 — not tested.** All seven sample companies are headquartered in CA, NY or MA.
  - **P4 — partly tested.** Exclusions worked on real rows (Klaviyo's "Engineering Manager Data Exchange", Airbnb's "Data Scientist" not counted). No real over-match was seen.
  - **P5 — wrong for this sample.** Skip+unscored was 43%, and 14% with legal names. The sample was found by browsing boards of companies already known to sponsor, so it is not a fair test.
  - **F1–F7** behaved as predicted (`TEST-REPORT.md` §5). **F8** was not seen on real data.
  - **Not predicted:** the clean-checkout run exposed an out-dir safety bug (fixed in `acd2286`). A band-Consider gets the wrong next-action text.
- **2026-10-03 — v0.2.0: Greenhouse liveness cross-check built** (requested by the author; evidence in `TEST-REPORT.md` §11 and `logs/runs/2026fa-ethangomes14-2.md`).
  - The proposed `[TODO: DEV]` from §2d is now `fetch-greenhouse-status.mjs` (the only network step; host `boards-api.greenhouse.io`) plus an API check inside gate G2.
  - On real data: all 7 sample job IDs returned 200 (sample results unchanged), and the invented Airbnb ID returned 404. `ats:liveness` still calls that ID "active", but the triage now closes the gate and skips it.
  - New observation: Stripe's posting is "uncertain" to the liveness checker but **200** to the API. By design the cross-check never re-opens a gate, so Stripe stays Skip; a person may override.
  - The report now opens with a priority list (author's request).
  - The E-Verify data-source TODO was removed from the recipe at the author's request; it remains listed as out of scope.
- **2026-10-03 — last TODO removed (author's decision).** The proposed dated, title-level H-1B data source (DOL LCA disclosure files) is no longer tracked as a TODO, so the recipe has zero open TODOs. The limits it would have fixed (undated, company-wide approvals; six-state coverage) remain listed under "cannot verify".
- **2026-10-03 — v0.3.0: visa-timeline gate removed (author's decision, against Claude's advice).** The recipe now checks two things only: H-1B sponsorship history for Data Engineer-type work, and whether the posting is open (liveness plus the Greenhouse cross-check). Gate G3 above no longer exists; the release gate is now G3. Failure case F5 no longer applies. Because the scorer silently defaults a missing timeline to 1, the prototype passes 1 explicitly, labelled "not evaluated". Sample results are unchanged (every sample posting had timeline factor 1). The assignment's "liveness and visa timeline are gates" requirement is now openly not met; the recipe says so in its lifecycle section.
- **2026-10-03 — v0.3.1: program renamed from "triage" to "sponsor-screen"** (author's request). File and output names changed (`sponsor-screen.mjs`, `screen-log.json`, `screen-report.md`, `runs/screen-*`); behaviour unchanged. The title of this brief and earlier revisions keep the old wording as written.
- **2026-10-03 — v0.4.0: visa-timeline gate restored and two TODOs added** (author's decision, after checking the recipe against the assignment). G3 timeline and F5 apply again, as originally written in §3–§4. The recipe's "Proposed additions" now lists `[TODO: DEV]` brand → legal-name alias table and `[TODO: DATA SOURCE]` dated DOL LCA data. Tests: 15. Sample results unchanged.
