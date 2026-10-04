# Data Engineer H-1B sponsor screen — human card

**Audience:** an international student deciding which Data Engineer postings deserve the next job-search hours.
**Agent twin:** `recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md`
**Engine layers:** 80 Days to Stay (sponsorship vote) · Job-Ops (liveness gate) · visa timeline (gate)

## Purpose

For each posting, answer three questions, then say Apply, Consider or Skip with every number traceable:
1. Has this company sponsored visas for Data Engineer-type work?
2. Is the posting really open?
3. Can hiring finish before the OPT clock runs out?

If the record can't answer, the tool says `missing` and why.

## What it can verify

- The company's row in the sponsor file: approvals, denials and top titles, exactly as recorded.
- Whether a listed title is Data Engineer-type, by an explicit rule (managers, analysts and architects excluded).
- What the liveness checker said, and for Greenhouse links whether the API says the job exists (200) or is gone (404).
- The OPT arithmetic: no start before OPT; employed by OPT start + 90 days − buffer.
- That the existing scorer respected the gates. A broken scorer is caught.

## What it cannot verify

- Whether a company **sponsors now**: approvals have no year.
- **How many** sponsorships were for Data Engineers: approvals are company-wide.
- Companies headquartered **outside CA, NY, MA, WA, TX, IL**: "not found" is not "doesn't sponsor".
- **Brand vs. legal names** ("Gemini" vs "GEMINI SPACE STATION LLC").
- Whether a non-Greenhouse "active" link is really the job.
- **Fit**: Claude's rating from title and level only.
- E-Verify, funding and wages: out of scope.

## Commands

| Command | Expected |
|---|---|
| `node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs --today 2026-10-03` | Apply 3 · Consider 1 · Skip 1 · unscored 2; slack 80 days |
| `node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.test.mjs` | 15 pass |
| …the same screen with `--today 2027-06-01 --out-dir /tmp/de-h1b-late` | Every scored posting Skip (deadline passed) |
| …with `--out-dir data/examples` | Refused, exit 2, nothing written |

Your own list:
1. Save liveness with `{ echo "# checked: $(date +%F)"; npm run ats:liveness -- <urls> || true; } > my-liveness.txt`.
2. Optionally run `fetch-greenhouse-status.mjs --candidates <file>`.
3. Pass both files to the screen.

## What it produces

- **`screen-report.md`, for you:** a priority list (highest first), full results with labels, the timeline, a "you must confirm" checklist, companies to network into, and what it can't tell you.
- **`screen-log.json`, for software:** every value with its source label, every gate result, and input hashes.

## Your gates

| Gate | You check | You decide |
|---|---|---|
| G1 | Matched company name and titles | Same employer? Really Data Engineer work? |
| G2 | Each "active" link, opened | Is it this job? |
| G3 | OPT start, lag, buffer | Still true for me? |
| G4 | The whole report | Act on the Apply rows? |

## Named failure modes

1. **Brand-name miss (seen in the sample).** "Gemini" isn't found, but its legal name is a Proven sponsor and the posting would have been an Apply. *Hardest to catch for:* students new to the US. **Check** every `not-in-csv` by legal name.
2. **Stale sponsor looks current.** Undated approvals make a lapsed sponsor rate "Proven". *Hardest to catch for:* everyone. **Check** with a current employee.
3. **Ghost posting passes liveness.** A dead job ID redirects to a careers page and reads "active". The Greenhouse API check catches it for Greenhouse only, so G2 stays.
4. **Six-state blind spot.** Sponsors headquartered elsewhere are invisible to a nationwide search.
