# Data Engineer sponsor screen — 2026-10-03

## Executive summary

**What this is.** A check of 1 Data Engineer-type job postings for a fictional international student ("Electrifier") who will need visa sponsorship. Each posting was checked for three things: whether public records show the company sponsoring H-1B visas for this kind of work, whether the posting is still open, and whether hiring can finish before the student's work-authorization window closes.

**Why read it.** It tells you where to spend limited job-search hours, and shows where every number came from so you can check it before acting.

**What it found.** 0 to apply to, 0 to consider, 1 to skip, and 0 that could not be scored because evidence was missing. 100% of postings ended as skip or unscored. Nothing here is final: the checks marked "you must confirm" need a person before any application goes out.

## Priority list (highest priority first)

Order: **Apply now** → **Consider** → **Research first** (live posting, but no usable sponsorship record yet) → **Network, don't apply** (strong sponsor, posting closed) → **Skip** → **Out of scope**. Within a group, the higher score comes first.

| # | Priority | Company | Job | Location | Score | Sponsorship record | Fit | Posting live? | What to do | Link |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Skip** | Airbnb | Data Engineer (invented job ID, break attempt) | n/a | 0.000 | Possible · 1000 approvals | 0.7 | ❌ dead (checker said active, API 404) | Skip. Time is better spent elsewhere. | [open](https://boards.greenhouse.io/airbnb/jobs/1) |

## Results

Labels: `record` = read from a data file or script output · `model-judgment` = a rule or rating proposed by Claude · `your-input` = a persona value or author-chosen rule.

| Posting | Result | Sponsorship evidence | Fit | Liveness | Next action |
|---|---|---|---|---|---|
| Airbnb — Data Engineer (invented job ID, break attempt) | **Skip** 0.000<br>gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)<br>`(0.4·0.35 + 0.7·0.3) × 0 × 1 = 0.000` | Possible, p 0.4 `model-judgment` · approvals 1000 `record` · DE-family titles: none `model-judgment` | 0.7 `model-judgment` — Placeholder value for a break test; not a real rating. | active on 2026-10-03 · Greenhouse API 404 (gone) on 2026-10-03 `record` → factor 0 `record` — **closed: redirected dead posting** | Skip. Time is better spent elsewhere. |

## Timeline gate (same for every posting)

OPT starts 2027-03-01 `your-input`; hiring lag 45 days `your-input`; buffer 10 days `your-input`. Legal deadline 2027-05-30; practical deadline **2027-05-20**. Earliest possible start **2027-03-01** (set by OPT start (cannot work before OPT begins)). Slack **80 days** → timeline factor **1** `your-input`.

## You must confirm before acting

- [ ] G1: confirm each matched CSV row is the same employer and its matched titles are Data Engineer-type work
- [ ] G2: confirm each "active" posting URL lands on the specific job, not a general careers page
- [ ] G3: confirm the persona timeline inputs (OPT start, hiring lag, buffer)
- [ ] G4: read the Markdown report before acting on any Apply

## Companies to network into

Strongest Data Engineer-family sponsors **not** on your list (59 Proven-tier in total; top 10 by company-wide approvals):

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
| GUSTO INC | CA | 218 | Business Intelligence Engineer |
| RIPPLE LABS INC | CA | 200 | Senior Software Engineer, Data |

## What this run cannot tell you

- Whether a company will sponsor **this** candidate now. Approval counts have no year; an old sponsor looks current.
- How many approvals were for Data Engineer roles. Approvals are company-wide; titles show only the top ~5.
- Anything about companies headquartered outside the six states the sponsor file covers (CA, NY, MA, WA, TX, IL). A missing record is not evidence of no sponsorship.
- Whether a company name variant (brand vs legal name) hides a real record. Matching is exact after normalization.
- Whether an "active" posting is truly that job, for non-Greenhouse links. The liveness checker can report a redirected dead posting as active; the Greenhouse API cross-check catches this only for Greenhouse job IDs, and an API 200 means the job exists, not that it is still being filled.
- E-Verify enrollment (needed for a STEM OPT extension), funding, and role quality or wages. Out of scope.

## Run record

- Status: complete · mode: sample · evaluated as of 2026-10-03 · generated 2026-10-03T22:53:59.461Z
- candidates: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/candidates-ghost-2026-10-03.json` (sha256 d90afc1e04e0…)
- liveness_log: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/liveness-ghost-2026-10-03.txt` (sha256 111a510e5899…), checked 2026-10-03
- persona: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/fixtures/persona-electrifier.json`
- sponsor_csv: `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` (sha256 eccdee2addf4…), 30369 rows
- greenhouse_status: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/samples/greenhouse-status-2026-10-03.json` (sha256 805cc676011d…), checked 2026-10-03
- rules: `scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/rules.json`
- scorer: `scripts/score/role-scorer.mjs`
- Scorer said: ✓ scored 1 roles → Apply 0 · Consider 0 · Skip 1 (skip 100%)
