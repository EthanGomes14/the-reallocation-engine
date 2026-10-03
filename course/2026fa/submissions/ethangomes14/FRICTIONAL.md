# Frictional log — Data Engineer H-1B sponsor triage

## Executive summary

**What this is.** An honest log of how this assignment was actually done: what was tried, what went wrong or surprised us, what the AI assistant (Claude, in Claude Code) did versus what I (EthanGomes14) decided, and what is still unclear.

**Why read it.** The finished files show the result; this shows the process, including the dead ends and the corrections.

**What it records.** One long working session on 2026-10-03. I made the scope and persona decisions; Claude researched the repo, wrote the code and documents, and ran the checks. Three real bugs and two wrong predictions were found along the way. Lines marked ✍️ are for me to complete in my own words.

> **How this file was made.** Claude drafted the entries on 2026-10-03, during the session and from it, as a factual record of events and of who did what. Retrospective wording is labelled. Statements about my own understanding are left for me (✍️), because the course policy says AI may organize the notes but I must supply the experience.

---

## 2026-10-03 — Understanding the assignment and the repo

- **I tried / expected:** I pasted the assignment and asked what it requires. I expected a checklist.
- **What happened:** Claude summarized it, then read the linked assignment page, the four course policy pages, and a clone of the engine repo. It found a 2026 summer case study for data engineering (`recipes/cases/2026su/case-new-grad-platform-data-engineering.md`) that is mostly an unfilled template pointing at paths that don't exist. We used it as the example of what not to do.
- **Friction:** the GitHub-submission policy page says to use `fall-2025/first-name-last-initial/…`, which conflicts with the assignment's namespaces. We followed the assignment and `CONTRIBUTING.md`.
- **Claude contributed:**
  - first data facts: 64 companies with "data engineer" in their sponsored titles, only 1,557 of 30,369 CSV rows with H-1B data
  - the finding that the shipped Form D samples match **zero** sponsor-file companies
- ✍️ **What I understand now / still don't:**
- **Evidence:** conversation transcript; no commits yet.

## 2026-10-03 — Setup, and the first surprise

- **I did:**
  - forked the engine to `EthanGomes14/the-reallocation-engine`
  - cloned it to my Desktop and ran `npm install`
  - asked what `git remote add upstream` does, and whether a branch can be renamed after pushing
- **I decided:** the branch name `contrib/2026fa-ethangomes14-data-engineer-h1b`, because my goal is sponsorship-first targeting.
- **Claude did:** added `upstream`, created the branch, ran `npm run doctor`, `npm run verify`, `ats:scan --dry-run`, `ats:liveness` and the Chapter 11 scorer example, and saved the output to `private/terminal-logs/` (gitignored).
- **What happened (unexpected):**
  - As a deliberate break attempt, Claude ran the liveness checker on an **invented** Greenhouse job ID. It came back **✅ active**. The fake URL redirects to Airbnb's general careers page, which loads fine. Greenhouse's JSON API returned 404 for the fake ID and 200 for a real one.
  - `verify` warns that `private/` isn't gitignored, but `git check-ignore` shows it is.
  - The example scorer run skipped only 40%, and the scorer's own report flags that as unhealthy.
- **Response:** the liveness false positive became failure case F4, the G2 human check, and a proposed fix.
- ✍️ **What I checked myself:** (e.g. did I re-run the fake-URL liveness check?)
- **Evidence:** `TEST-REPORT.md` §1 and §5.

## 2026-10-03 — Scope decisions (mine)

- **I asked** whether the STEM OPT / E-Verify angle was relevant or would complicate things. Claude said it matters for my real situation, but the repo has no E-Verify data and name matching against it is a hard problem of its own. **I decided** to leave it out of scope; it is now listed under "cannot verify" and as a proposed data source.
- **I asked** what a SOC code is. Learned that "Data Engineer" has no SOC code of its own (15-1243, 15-1252 and 15-2051 are all used) and that the sponsor CSV has no SOC column. So role quality stayed out of scope.
- **I asked** what `board_directors` and the funding columns are, after seeing them in a test. They are SEC Form D fields (who the company named on its filing, and how much it raised); the recipe doesn't use them. They appeared because a test fixture puts dummy text in an unused column.
- ✍️ **What I understand now / still don't:**

## 2026-10-03 — The change brief: real details → fictional persona

- **I tried:** first I asked for the brief to use my real situation, and gave my program end, expected OPT start, location and target role.
- **Friction:**
  - Claude pointed out that the repo's privacy rule treats exact immigration dates as personal data and that git history is permanent. It proposed month-level dates.
  - I also said "80 days". Claude pointed out the regulation allows 90 days of unemployment, so we set a 90-day limit with a 10-day buffer.
- **I decided:**
  - to switch to a **fictional persona, "Electrifier"**, with **none** of my personal details
  - to keep the tier rule as drafted
  - to have **Claude rate fit**
  - to label the sponsorship score as **Claude's judgment** (`model-judgment`)
  - to widen the target to **Data Engineer plus any title doing the same work**
- **Modified by Claude, with my instruction partly not followed:**
  - I asked for fit to be rated "based on H-1B sponsorship tier and job role". Claude wrote fit as **job role only**, because sponsorship is already its own vote and using it twice would double-count. ✍️ Accepted / want it changed?
  - I declined Claude's multiple-choice question form and gave my answers in my own words instead.
- **Claude found while widening the title family:**
  - Unfiltered family terms pull in managers and analysts, so exclusions were added.
  - **All 1,557 companies with H-1B data are headquartered in just six states.** That is a serious limit for my nationwide search, and it became prediction P3.
- **Claude also noticed:**
  - The PII scanner flags any file named `profile.yml`, so the persona is a `.json` file.
  - My global git email would have gone into every public commit, so Claude set a repo-local GitHub noreply address before the first commit.
- **I confirmed** the failure cases (§4) and predictions (§5) before they were frozen.
- **Evidence:** commit `35c1bcb` (brief + persona, predictions frozen).
- ✍️ **What I understand now / still don't:**

## 2026-10-03 — Building and testing the prototype

- **Claude did:**
  - wrote `lib.mjs`, `triage.mjs`, `rules.json`, the fixtures and a deliberately broken scorer, and `triage.test.mjs`
  - found seven real Data Engineer-type postings through the public Greenhouse API and ran the repo's liveness checker on them (Stripe came back "uncertain")
  - rated fit from titles only
  - wrote the recipe, card and README
- **Design discoveries in the existing scorer (Claude):**
  - A missing liveness or timeline value silently defaults the gate to *open*.
  - A missing sponsorship value is silently dropped.
  - A profile containing "authorized" switches sponsorship weight to 0.
  - The scorer has no exports and runs on import, so it is called through its command line.
  - The prototype was designed around all four.
- **Broke during testing (all real, all fixed):**
  1. A test asserted the wrong CSV column. The fixture row was miscounted, not the parser.
  2. The output-folder safety check refused `/tmp` on macOS, found by trying the card's own example.
  3. **Found only by the clean-checkout run:** the same check let *any* repo path through when the repo itself lived under `/tmp`. Fixed in `4b3c9de`.
- **Wrong predictions:**
  - P5 (≥ 50% skipped) failed: 43%, and 14% with legal names. The sample was biased: postings were found on boards of companies already known to sponsor.
  - P1 came true in a costly way. Gemini, typed by its brand name, was a Proven sponsor whose posting would have been an Apply.
- **Not predicted:** Airbnb is a "Consider" because of a low score, but the report's next action talks about a "soft spot". That text is wrong for that kind of Consider.
- **Evidence:**
  - commits `09c3fd6` (prototype), `733da4f` (recipe), `2ca709e` (sample run), `4b3c9de` (fix)
  - `TEST-REPORT.md` (pasted output)
  - `WORKED-RUN.md` §4–5
- ✍️ **What I checked myself:** (e.g. ran the command, opened the G2 links, looked up one CSV row by hand, read the code for X)
- ✍️ **What I understand now / still don't:**

## Human and AI contributions — summary

| Decision or artifact | Me (EthanGomes14) | Claude |
|---|---|---|
| Domain, scope (H-1B, no E-Verify), branch name | decided | advised |
| Persona "Electrifier", no personal data | decided | drafted the file |
| Title family, exclusions | approved the idea ("other titles doing the same work") | proposed the list and exclusions |
| Tier rule, p values | kept as drafted | proposed |
| Sponsorship score label `model-judgment` | decided | explained the options |
| Fit = Claude's rating | decided | rated; narrowed to role-only (✍️ my verdict) |
| Failure cases and predictions | confirmed | drafted |
| Code, tests, fixtures | ✍️ (what I read, ran, understood) | wrote |
| Recipe, card, reports | ✍️ (what I reviewed and changed) | wrote |
| Running the checks, clean checkout | ✍️ (what I re-ran) | ran |
| Git identity (noreply) | ✍️ accepted? | proposed and set (repo-local) |

## Unresolved questions / next steps

- Is the RUNNABLE-SAMPLE claim right, given 3 open TODOs that the constitution says must be closed before SPECIFIED? (Stated openly in the recipe's "Lifecycle claim".)
- Will CI pass the working-tree PII scan, given the upstream `package-lock.json` finding?
- Does the code run on Node 20 (CI's version)?
- Next improvement: a reviewed brand → legal-name alias table.
- ✍️ My own questions:
