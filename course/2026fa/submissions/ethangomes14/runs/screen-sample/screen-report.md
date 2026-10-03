# Data Engineer sponsor screen — 2026-10-03

## Executive summary

**What this is.** A check of 7 Data Engineer-type job postings for a fictional international student ("Electrifier") who will need visa sponsorship. Each posting was checked for three things: whether public records show the company sponsoring H-1B visas for this kind of work, whether the posting is still open, and whether hiring can finish before the student's work-authorization window closes.

**Why read it.** It tells you where to spend limited job-search hours, and shows where every number came from so you can check it before acting.

**What it found.** 3 to apply to, 1 to consider, 1 to skip, and 2 that could not be scored because evidence was missing. 43% of postings ended as skip or unscored. Nothing here is final: the checks marked "you must confirm" need a person before any application goes out.

## Priority list (highest priority first)

Order: **Apply now** → **Consider** → **Research first** (live posting, but no usable sponsorship record yet) → **Network, don't apply** (strong sponsor, posting closed) → **Skip** → **Out of scope**. Within a group, the higher score comes first.

| # | Priority | Company | Job | Location | Score | Sponsorship record | Fit | Posting live? | What to do | Link |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Apply now** | Sigma Computing | Data Engineer | New York City, NY | 0.525 | Proven · 136 approvals | 0.7 | ✅ open · API 200 | Tailor an application (research-and-apply hours). | [open](https://job-boards.greenhouse.io/sigmacomputing/jobs/7809974003) |
| 2 | **Apply now** | Klaviyo | Analytics Engineer | Boston, MA | 0.525 | Proven · 154 approvals | 0.7 | ✅ open · API 200 | Tailor an application (research-and-apply hours). | [open](https://www.klaviyo.com/careers/jobs/7737707003?gh_jid=7737707003) |
| 3 | **Apply now** | Gusto | Senior Data Engineer | Denver, CO / New York, NY / San Francisco, CA (hybrid) | 0.465 | Proven · 218 approvals | 0.5 | ✅ open · API 200 | Tailor an application (research-and-apply hours). | [open](https://job-boards.greenhouse.io/gusto/jobs/8099751) |
| 4 | **Consider** | Airbnb | Senior Staff Data Engineer, Foundational Data | United States | 0.230 | Possible · 1000 approvals | 0.3 | ✅ open · API 200 | Check the soft spot named in "why"; if it holds up, talk to someone at the company before applying (networking hours). | [open](https://careers.airbnb.com/positions/8224032?gh_jid=8224032) |
| 5 | **Research first** | Gemini | Senior Data Engineer | New York, NY / Miami, FL / Remote (USA) | — | none found (not-in-csv) | 0.5 | ✅ open · API 200 | No sponsorship record found under this name. Check name variants by hand (legal vs brand name) before spending time. | [open](https://boards.greenhouse.io/embed/job_app?for=gemini&token=8076827&gh_jid=8076827) |
| 6 | **Research first** | Robinhood | Senior Software Engineer, Data Engineering | Menlo Park, CA | — | none found (not-in-csv) | 0.5 | ✅ open · API 200 | No sponsorship record found under this name. Check name variants by hand (legal vs brand name) before spending time. | [open](https://boards.greenhouse.io/robinhood/jobs/4738660?t=gh_src=&gh_jid=4738660) |
| 7 | **Skip** | Stripe | Software Engineer, Data Orchestration | not stated on the board listing | 0.000 | Possible · 1250 approvals | 0.7 | ❌ uncertain · API 200 | Skip. Time is better spent elsewhere. | [open](https://stripe.com/jobs/search?gh_jid=7230670) |

## Results

Labels: `record` = read from a data file or script output · `model-judgment` = a rule or rating proposed by Claude · `your-input` = a persona value or author-chosen rule.

| Posting | Result | Sponsorship evidence | Fit | Liveness | Next action |
|---|---|---|---|---|---|
| Sigma Computing — Data Engineer | **Apply** 0.525<br>composite 0.525 ≥ 0.3, gates healthy<br>`(0.9·0.35 + 0.7·0.3) × 1 × 1 = 0.525` | Proven, p 0.9 `model-judgment` · approvals 136 `record` · DE-family titles: Senior Analytics Engineer `model-judgment` | 0.7 `model-judgment` — Exact target title with no seniority marker; US location. Stack not checked (description not read). | active on 2026-10-03 · Greenhouse API 200 (exists) on 2026-10-03 `record` → factor 1 `record` | Tailor an application (research-and-apply hours). |
| Klaviyo — Analytics Engineer | **Apply** 0.525<br>composite 0.525 ≥ 0.3, gates healthy<br>`(0.9·0.35 + 0.7·0.3) × 1 × 1 = 0.525` | Proven, p 0.9 `model-judgment` · approvals 154 `record` · DE-family titles: Business Intelligence Engineer `model-judgment` | 0.7 `model-judgment` — Data Engineer-family title (SQL/dbt modelling side, matching persona skills); no seniority marker; US location. | active on 2026-10-03 · Greenhouse API 200 (exists) on 2026-10-03 `record` → factor 1 `record` | Tailor an application (research-and-apply hours). |
| Gusto — Senior Data Engineer | **Apply** 0.465<br>composite 0.465 ≥ 0.3, gates healthy<br>`(0.9·0.35 + 0.5·0.3) × 1 × 1 = 0.465` | Proven, p 0.9 `model-judgment` · approvals 218 `record` · DE-family titles: Business Intelligence Engineer `model-judgment` | 0.5 `model-judgment` — Right work, but 'Senior' is about one level above a new grad: a stretch. | active on 2026-10-03 · Greenhouse API 200 (exists) on 2026-10-03 `record` → factor 1 `record` | Tailor an application (research-and-apply hours). |
| Gemini — Senior Data Engineer | **unscored** (not-in-csv) | missing: not-in-csv | 0.5 `model-judgment` — Right work, one level too senior; remote-in-US option helps a relocating candidate. | active on 2026-10-03 · Greenhouse API 200 (exists) on 2026-10-03 `record` → factor 1 `record` | No sponsorship record found under this name. Check name variants by hand (legal vs brand name) before spending time. |
| Airbnb — Senior Staff Data Engineer, Foundational Data | **Consider** 0.230<br>composite 0.230 in the Consider band [0.2, 0.3)<br>`(0.4·0.35 + 0.3·0.3) × 1 × 1 = 0.230` | Possible, p 0.4 `model-judgment` · approvals 1000 `record` · DE-family titles: none `model-judgment` | 0.3 `model-judgment` — Senior Staff is several levels above new-grad; poor fit despite the right domain. | active on 2026-10-03 · Greenhouse API 200 (exists) on 2026-10-03 `record` → factor 1 `record` | Check the soft spot named in "why"; if it holds up, talk to someone at the company before applying (networking hours). |
| Robinhood — Senior Software Engineer, Data Engineering | **unscored** (not-in-csv) | missing: not-in-csv | 0.5 `model-judgment` — Data engineering work at senior level: a stretch for a new grad. | active on 2026-10-03 · Greenhouse API 200 (exists) on 2026-10-03 `record` → factor 1 `record` | No sponsorship record found under this name. Check name variants by hand (legal vs brand name) before spending time. |
| Stripe — Software Engineer, Data Orchestration | **Skip** 0.000<br>gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)<br>`(0.4·0.35 + 0.7·0.3) × 0 × 1 = 0.000` | Possible, p 0.4 `model-judgment` · approvals 1250 `record` · DE-family titles: none `model-judgment` | 0.7 `model-judgment` — Orchestration work lines up with the persona's Airflow skill; no seniority marker; location unknown. | uncertain on 2026-10-03 · Greenhouse API 200 (exists) on 2026-10-03 `record` → factor 0 `record` | Skip. Time is better spent elsewhere. |

## Timeline gate (same for every posting)

OPT starts 2027-03-01 `your-input`; hiring lag 45 days `your-input`; buffer 10 days `your-input`. Legal deadline 2027-05-30; practical deadline **2027-05-20**. Earliest possible start **2027-03-01** (set by OPT start (cannot work before OPT begins)). Slack **80 days** → timeline factor **1** `your-input`.

## You must confirm before acting

- [ ] G1: confirm each matched CSV row is the same employer and its matched titles are Data Engineer-type work
- [ ] G2: confirm each "active" posting URL lands on the specific job, not a general careers page
- [ ] G3: confirm the persona timeline inputs (OPT start, hiring lag, buffer)
- [ ] G4: read the Markdown report before acting on any Apply
  - G2: open https://job-boards.greenhouse.io/sigmacomputing/jobs/7809974003 and confirm it is "Data Engineer" at Sigma Computing
  - G2: open https://www.klaviyo.com/careers/jobs/7737707003?gh_jid=7737707003 and confirm it is "Analytics Engineer" at Klaviyo
  - G2: open https://job-boards.greenhouse.io/gusto/jobs/8099751 and confirm it is "Senior Data Engineer" at Gusto
  - G2: open https://boards.greenhouse.io/embed/job_app?for=gemini&token=8076827&gh_jid=8076827 and confirm it is "Senior Data Engineer" at Gemini
  - G2: open https://careers.airbnb.com/positions/8224032?gh_jid=8224032 and confirm it is "Senior Staff Data Engineer, Foundational Data" at Airbnb
  - G2: open https://boards.greenhouse.io/robinhood/jobs/4738660?t=gh_src=&gh_jid=4738660 and confirm it is "Senior Software Engineer, Data Engineering" at Robinhood

## Companies to network into

Strongest Data Engineer-family sponsors **not** on your list (56 Proven-tier in total; top 10 by company-wide approvals):

| Company | HQ state `record` | Total approvals `record` | Matched titles `model-judgment` |
|---|---|---|---|
| AMGEN INC | CA | 1882 | Data Engineer 20516.3745 |
| HUMAN INC | WA | 1382 | Data Engineer 2 |
| ZOOX INC | CA | 1364 | Data Engineer |
| DOCUSIGN INC | CA | 1082 | Data Engineer |
| ROKU INC | CA | 654 | Senior Data Engineer |
| VISICON TECHNOLOGIES INC | CA | 330 | Data Engineer; Data Engineer |
| UPSTART NETWORK INC | CA | 316 | Data Engineer |
| QUANTIPHI INC | MA | 270 | Senior Data Engineer |
| RIPPLE LABS INC | CA | 200 | Senior Software Engineer, Data |
| PROCORE TECHNOLOGIES INC | CA | 190 | Senior Data Engineer |

## What this run cannot tell you

- Whether a company will sponsor **this** candidate now. Approval counts have no year; an old sponsor looks current.
- How many approvals were for Data Engineer roles. Approvals are company-wide; titles show only the top ~5.
- Anything about companies headquartered outside the six states the sponsor file covers (CA, NY, MA, WA, TX, IL). A missing record is not evidence of no sponsorship.
- Whether a company name variant (brand vs legal name) hides a real record. Matching is exact after normalization.
- Whether an "active" posting is truly that job, for non-Greenhouse links. The liveness checker can report a redirected dead posting as active; the Greenhouse API cross-check catches this only for Greenhouse job IDs, and an API 200 means the job exists, not that it is still being filled.
- E-Verify enrollment (needed for a STEM OPT extension), funding, and role quality or wages. Out of scope.

## Run record

- Status: complete · mode: sample · evaluated as of 2026-10-03 · generated 2026-10-03T22:53:59.128Z
- candidates: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/candidates-2026-10-03.json` (sha256 4fdb34405d0f…)
- liveness_log: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/liveness-2026-10-03.txt` (sha256 508474b74ff2…), checked 2026-10-03
- persona: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/fixtures/persona-electrifier.json`
- sponsor_csv: `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` (sha256 eccdee2addf4…), 30369 rows
- greenhouse_status: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/greenhouse-status-2026-10-03.json` (sha256 805cc676011d…), checked 2026-10-03
- rules: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/rules.json`
- scorer: `scripts/score/role-scorer.mjs`
- Scorer said: ✓ scored 5 roles → Apply 3 · Consider 1 · Skip 1 (skip 20%)
