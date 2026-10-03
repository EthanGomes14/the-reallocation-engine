# Frictional log — Data Engineer H-1B sponsor screen

## Executive summary

**What this is.** My honest log of how this assignment actually went: what I tried, where I got confused or changed my mind, what Claude (the AI assistant in Claude Code) did versus what I decided, and what I still haven't checked.

**Why read it.** The other files show the finished work. This one shows how it got made, including the wrong turns.

**What it records.** One long working session on 2026-10-03, plus my own re-run of the tool. I set the direction and made the scope, persona and labelling decisions. Claude researched the repo, wrote the code and documents, and ran the checks. Along the way we hit three real bugs, two predictions that didn't hold up, and one prediction that came true in a way that cost a real lead.

---

## 2026-10-03 — Figuring out what the assignment actually wants

- **What I tried:** I pasted the whole assignment and asked Claude what I actually had to do. I expected a checklist; I got one, plus a reading of the linked course policy pages and a look inside the engine repo.
- **What surprised me:**
  - Someone in the summer cohort had already written a data-engineering case study for this repo. When Claude opened it, it was mostly an unfilled template pointing at folders that don't exist. That made "don't claim more than you ran" feel very concrete.
  - The course's general GitHub-posting page uses a different folder layout (`fall-2025/first-name-last-initial/…`) from this assignment's. We went with the assignment and the repo's `CONTRIBUTING.md`.
- **What I asked to understand better:** how long the whole thing would take. The estimate was roughly 14–22 hours on my own, much less with Claude doing the drafting and me doing the checking.
- **What I understand now:** the grade isn't about building something big. It's about being precise about what the tool verified versus what it guessed.
- **Evidence:** session transcript; no commits yet.

## 2026-10-03 — Setting up, and learning git as I went

- **What I did:**
  - forked the engine to my account, cloned it to my Desktop, and ran `npm install`
  - chose the branch name `contrib/2026fa-ethangomes14-data-engineer-h1b`, because what I care about is finding sponsors
- **Where I slowed down on purpose:** before letting Claude run anything, I asked what each git command would do:
  - what `git remote add upstream …` changes (only a local name for the instructor's repo; nothing downloaded or pushed)
  - whether I could rename the branch after pushing (yes, but after a PR exists, deleting the old remote branch closes the PR)
  - I wanted to understand each step before it touched my repo.
- **What Claude ran:** `npm run doctor`, `npm run verify`, the ATS scan dry-run, the liveness checker and the example scorer run, with the output saved locally.
- **The first real surprise:** as a deliberate break attempt, Claude fed the liveness checker a made-up Airbnb job ID, and it came back **"active"**. The fake link quietly redirects to Airbnb's general careers page, which loads fine. Greenhouse's own API correctly said 404. So the tool meant to catch ghost postings can be fooled by exactly that. This became failure case F4 and the reason gate G2 needs a human to open the link.
- **Smaller oddities:**
  - `verify` warns that `private/` isn't gitignored, but it is.
  - The repo's own example scoring run skipped only 40% of roles, and the report itself flagged that as unhealthy.
- **Evidence:** `TEST-REPORT.md` §1 and §5.

## 2026-10-03 — Deciding the scope

- **STEM OPT / E-Verify.** I asked whether this angle was relevant or would just complicate things. It matters for my real situation, but the repo has no E-Verify data, and matching employer names against it is a hard problem of its own. **I decided to leave it out** and focus on H-1B sponsorship. It's listed under "can't verify" and as a proposed future data source.
- **SOC codes.** I didn't know what a SOC code was. I learned it's the government's job-classification number, that "Data Engineer" doesn't have one of its own (it gets filed under 15-1243, 15-1252 or 15-2051), and that the sponsor file has no SOC column anyway. So role quality stayed out.
- **"How many jobs are in the CSV?"** I assumed the sponsor file listed jobs. It doesn't. It's 30,369 *companies*, and only 1,557 of them have any H-1B data. The open jobs have to come from job boards. That split (sponsorship from the file, live jobs from the boards) became the shape of the whole recipe.
- **The `board_directors` and funding columns.** I asked what these were after they showed up in a test. They're SEC Form D fields (the people a company named on its filing, and how much it raised). The recipe doesn't use them; a test fixture just puts dummy text in an unused column to test quote handling.

## 2026-10-03 — The change brief: from my real details to a fictional persona

- **What I tried first:** I wanted the brief to use my real situation, so I gave my graduation timing, my expected OPT start, my location and my target role.
- **What changed my mind:**
  - Claude pointed out that the repo's privacy rule treats exact immigration dates as personal data, and that anything committed stays in git history for good.
  - I had also said I had "80 days" to find a job. Claude pointed out the actual rule is 90 days of allowed unemployment, so we used 90 with a 10-day safety buffer.
- **What I decided:**
  - use a **fictional persona, "Electrifier"**, with none of my personal details
  - keep the tier rule as drafted
  - let **Claude rate fit**
  - label the sponsorship score as **Claude's judgment** (`model-judgment`)
  - widen the target from just "Data Engineer" to **any title doing the same work**
- **Where Claude didn't follow my exact wording:** I asked for fit to be based on the sponsorship tier *and* the job role. Claude made it role-only, because sponsorship is already its own vote and using it again inside fit would count the same evidence twice. **I accepted that.**
- **Where I pushed back:** Claude tried to collect my answers through a multiple-choice form. I declined and wrote my answers out myself.
- **What widening the title list turned up:**
  - It also pulled in managers and analysts, so we added exclusions.
  - **Every company with H-1B data in the file is headquartered in just six states.** For someone willing to relocate anywhere, that's a big blind spot. It became prediction P3.
- **What I checked:** I read the change brief in my editor and **confirmed the failure cases and predictions** before they were committed and frozen.
- **Evidence:** commit `ab51f69` (brief + persona; predictions frozen).

## 2026-10-03 — Building and testing the prototype

- **What Claude built:**
  - the program (`triage.mjs`) and its helpers, the rules file, test fixtures (including a deliberately broken scorer), and 12 offline tests
  - the recipe, card and README
  - It found seven real Data Engineer-type postings through Greenhouse's public API and checked them with the repo's own liveness checker. Stripe came back "uncertain".
- **What the existing scorer taught us:**
  - If a liveness or timeline value is missing, it silently treats the gate as **open**.
  - If the sponsorship value is missing, it silently drops it.
  - A profile containing the word "authorized" switches sponsorship off entirely.
  - The prototype was built to never hand the scorer an incomplete row.
- **What broke (all fixed):**
  1. A test checked the wrong CSV column. The fixture row was miscounted; the parser was fine.
  2. The "only write to my own folders" safety check refused `/tmp` on a Mac.
  3. **Only the fresh-clone test caught this one:** the same safety check let *any* repo path through when the repo itself sat under `/tmp`. Fixed in `acd2286`.
- **Predictions that didn't hold up:**
  - **P5** said at least half the postings would end as Skip or unscored. It was 43%, and 14% once company names were fixed. Looking back, the sample was biased: the postings came from job boards of companies already known to sponsor.
  - **P1** came true in a way that stung. Typed as "Gemini", one company came back "not found". Under its legal name (GEMINI SPACE STATION LLC) it's a proven sponsor, and that posting would have been an **Apply**.
- **Something nobody predicted:** Airbnb shows up as "Consider" because its score is low, but the report's advice talks about a "soft spot". That advice only fits the other kind of Consider. It's on the fix list.
- **What I checked:**
  - I opened the sample run's JSON log and the worked run in my editor to look at the actual output.
  - Then I re-ran the program and the tests myself on my laptop and got the same results:

    ```
    $ node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.mjs --today 2026-10-03
    triage: 7 candidates → Apply 3 · Consider 1 · Skip 1 · unscored 2 (skip+unscored 43%)
      unscored: not-in-csv × 2
      timeline gate: factor 1 [your-input] · earliest start 2027-03-01 · practical deadline 2027-05-20 · slack 80 days

    $ node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.test.mjs
    ℹ tests 12
    ℹ pass 12
    ℹ fail 0
    ```

  - On my first try I pasted both commands into the terminal at once, so the screen ran twice before the tests ran. Harmless (the second run just regenerates the same outputs), but a reminder to run one command at a time.
- **Hand check against the source CSV.** At first I wasn't sure why I had to look at Sigma Computing in particular. It's the first Apply in the report, so it's the result most worth tracing back to the raw data myself. I read the row straight from the CSV with Python:

  ```
  $ python3 -c "import csv; ... if r['company_name']=='SIGMA COMPUTING INC']"
  SIGMA COMPUTING INC 136.0 ['Software Engineer', 'Senior Analytics Engineer', 'Engineering Manager', 'Field and Partner Marketing Manager']
  ```

  That matches the report: 136 approvals, and "Senior Analytics Engineer" is the title that made it Proven. "Engineering Manager" sits in the same list and was correctly *not* counted, because "Manager" is an excluded word.
- **Gate G2, by hand.** I opened all six "active" job links from the report (Sigma Computing, Klaviyo, Gusto, Gemini, Airbnb, Robinhood), and each one opened the listed job; no problems found. This is the check the liveness tool can't do for itself, since it once called a dead link "active". With this done I signed the attestation.
- **Evidence:**
  - commits `c1d3abc` (prototype), `2f48ca0` (recipe), `03681eb` (sample run), `acd2286` (fix)
  - `TEST-REPORT.md`
  - `WORKED-RUN.md` §4–5

## 2026-10-03 — Cleaning up the TODOs, then building the liveness fix (v0.2.0)

- **Who added the E-Verify TODO?** When I looked at the recipe's open TODOs, I asked whether I had added the E-Verify one. I hadn't. Claude turned my "leave E-Verify out of scope" decision into a proposed data source. I had it removed; it's still listed as out of scope.
- **What I tried:** I asked for a step-by-step list for the Greenhouse liveness cross-check, then asked Claude to build it.
- **Where I stopped it:** Claude started writing files before explaining the plan, so I stopped it and asked what it was about to do. It laid out every file it would touch, the one internet call it would add, and the side effect: changing the scripts voids my attestation until I re-run. Then I said go. One new file had already been created before I stopped it; Claude told me so.
- **What I asked for on top:** a priority table at the top of the report, with every company and job ranked from highest to lowest priority.
- **What happened:**
  - The fake Airbnb job ID still comes back "active" from the liveness checker. The Greenhouse API says 404, and the screen now closes that posting as a dead link.
  - All 7 real postings returned 200, so my sample results didn't change.
  - Stripe is "uncertain" to the checker but 200 to the API. It stays Skip, because the new check only ever closes a gate. That's a case where I might decide differently myself.
- **What broke:** one of the new tests was written wrong (it checked the wrong thing, not a code bug) and was rewritten. There are now 15 tests.
- **Next:** re-run the screen and the 15 tests myself so the attestation covers v0.2.0.
- **Evidence:** `TEST-REPORT.md` §11, `logs/runs/2026fa-ethangomes14-2.md`, `runs/screen-ghost/`.

## 2026-10-03 — Removing the visa-timeline check (v0.3.0)

- **What I decided:** when Claude summarized what the prototype does, I realized I only want it to answer two questions: *has this company sponsored H-1Bs for this kind of work?* and *is the posting really open?* I asked for the third check (*can I be hired before my OPT clock runs out?*) to be taken out.
- **The pushback:** Claude asked whether I meant just the explanation or the code itself, and advised against changing the code. The assignment says "liveness and visa timeline are gates", and the "can't start before OPT" rule was one of the more domain-specific parts. I chose to remove it from the prototype anyway.
- **What happened:**
  - The timeline code, its rule and two tests were removed (15 → 13 tests).
  - Because the repo's scorer quietly treats a missing timeline as "open", Claude passes it an explicit 1 labelled "not evaluated", so nothing is hidden.
  - My sample results didn't change.
  - The recipe now says openly that it departs from the assignment on this point.
- **What it means for me:** for every Apply, I have to check the hiring timing against my OPT dates myself.
- **Evidence:** `TEST-REPORT.md` §12, `logs/runs/2026fa-ethangomes14-3.md`.

## 2026-10-03 — Renaming "triage" to "sponsor-screen" (v0.3.1)

- **Why:** I asked what "triage" meant. It's the hospital word for sorting patients by urgency, which describes the ranking but not what the tool actually checks. Once the tool only checked sponsorship and whether a posting is open, I asked for a better name. Claude suggested a few, and I picked **sponsor-screen**.
- **What changed:**
  - the program, the tests, the output files and the output folders were renamed
  - behaviour is identical: same results, 13/13 tests
- **What didn't change, on purpose:** the older pasted outputs in the test report, worked run, run logs and this log still show `triage.mjs`, because that's what was actually run at the time. A note maps the old names to the new ones.
- **Evidence:** `TEST-REPORT.md` §13, `logs/runs/2026fa-ethangomes14-4.md`.

## 2026-10-03 — Checking the recipe against the assignment, and putting the timeline back (v0.4.0)

- **What I did:** I went through the assignment's requirements one step at a time and asked whether each was really done. For the recipe, two things came back as gaps:
  - there were **no typed TODOs** left under "Proposed additions", because I had removed them, and the assignment asks for them
  - the **visa-timeline gate was gone**, but the assignment says "liveness and visa timeline are gates"
- **What I learned:** I asked what the alias-table TODO meant. It's a hand-checked list mapping names like "Gemini" to legal names like "GEMINI SPACE STATION LLC", which would fix the miss that cost me an Apply.
- **What I decided:** close both gaps. I added the alias table as a `[TODO: DEV]` and dated visa data as a `[TODO: DATA SOURCE]`, and restored the timeline gate.
- **What happened:**
  - The timeline code came back from the last commit, unchanged from the original tested version.
  - Tests are back to 15.
  - Sample results stayed the same, and the "after the OPT deadline" check skips everything again.
  - Looking back, removing the timeline gate earlier and then restoring it cost a round trip. Checking against the rubric first would have saved that.
- **Next:** re-run `sponsor-screen.mjs` and the 15 tests for v0.4.0.
- **Evidence:** `TEST-REPORT.md` §14, `logs/runs/2026fa-ethangomes14-5.md`.

## Who did what — summary

| Decision or artifact | Me (Ethan) | Claude |
|---|---|---|
| Domain, scope (H-1B, no E-Verify), branch name | decided | advised |
| Fictional persona, no personal data | decided | wrote the file |
| Title family and exclusions | approved the idea ("other titles doing the same work") | proposed the list and exclusions |
| Tier rule, p values | kept as drafted | proposed |
| Sponsorship score labelled `model-judgment` | decided | explained the options |
| Fit rated by Claude, role only | decided Claude rates it; accepted role-only | rated; narrowed to role-only |
| Failure cases and predictions | read and confirmed | drafted |
| Code, tests, fixtures | re-ran the program and all 12 tests myself (same results) | wrote and ran |
| Recipe, card, reports | reviewed in my editor | wrote |
| Clean-checkout run, verify / doctor / privacy scans | re-ran the sample run and tests | ran |
| Greenhouse cross-check (v0.2.0), priority list | asked for both; paused the build to get the plan first | built, ran, tested |
| Removing the visa-timeline gate (v0.3.0) | decided, after hearing the trade-off | advised against; then removed it and updated the docs |
| Renaming to sponsor-screen (v0.3.1) | asked for a better name; chose "sponsor-screen" | suggested options; renamed and re-ran |
| Checking against the rubric; restoring the timeline gate and adding two TODOs (v0.4.0) | went through the requirements; decided to close both gaps | flagged the gaps; restored the code and updated the docs |

## Still open

- The recipe now has zero open TODOs. The Greenhouse one was built, and I removed the E-Verify and dated-visa-data ones as out of scope. The dated data would still be the biggest improvement, since the sponsor file's approvals have no year.
- Will CI pass its working-tree privacy scan, given the email that already sits in the instructor's `package-lock.json`?
- Does the code behave the same on Node 20, which CI uses?
- Next improvement I'd pick: a small, reviewed brand-name → legal-name table, so "Gemini" finds GEMINI SPACE STATION LLC without guesswork.
- I re-ran `sponsor-screen.mjs` and the 13 tests for v0.3.1 on my laptop and got the same results (Apply 3 · Consider 1 · Skip 1 · unscored 2; 13/13). I pasted both commands at once again, out of habit; it didn't matter.
- I considered expanding the sample to 20–30 jobs to fix the sponsor bias, but decided not to for now. The small, sponsor-biased sample stays a stated limitation.
- I re-ran `sponsor-screen.mjs` and the 15 tests for v0.4.0: same results, with the timeline gate back (slack 80 days), 15/15. (Again I pasted both commands at once; harmless.)
- My next step: commit and push, open the PR, and submit on Canvas.
