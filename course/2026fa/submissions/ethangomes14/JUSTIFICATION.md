# Domain Justification — Data Engineer H-1B sponsor screen

## Executive summary

**What this is.** A one-page case for why this tool exists: who it serves, what they can't see without it, and where it saves time in a job-search day.

**Why read it.** It explains the specific problem the tool solves and the specific ways it can mislead, so a reader can decide whether to trust it.

**What it argues.** An international student hunting for Data Engineer jobs can't easily tell which employers have actually sponsored visas for this kind of work. The answer hides behind dozens of job titles and legal company names. The tool turns that question into a checked record in seconds. Its two most dangerous errors are quiet ones: a real sponsor disappearing because its name didn't match, and an old sponsor looking current.

---

## Who uses it, in exactly what situation

An international master's student on an F-1 visa, in the **final semester before post-completion OPT starts**, targeting **new-grad Data Engineer** work (and the same work under other titles) **anywhere in the US**, who will need **H-1B sponsorship** to stay. The worked example is the fictional persona "Electrifier": OPT starts 2027-03-01, 90-day unemployment limit, 10-day buffer, so the practical deadline to be employed is 2027-05-20.

Three things make this situation specific:
1. **The OPT clock hasn't started.** The earliest start date is fixed in the future. An October application with a 45-day hiring loop still can't start until March.
2. **Sponsorship evidence has to be for Data Engineer-type work.** A company that sponsored hundreds of nurses or accountants is not evidence it will sponsor a Data Engineer.
3. **Data Engineer work hides behind many titles.** Examples are Analytics Engineer, BI Engineer, ETL Developer and "Software Engineer, Data". A keyword search for "Data Engineer" misses real matches, and sponsorship records use the same scattered titles.

## The information asymmetry

From outside, the student cannot easily see **whether this employer has sponsored H-1Bs for Data Engineer-type roles**:
- Job postings rarely say.
- Recruiters often don't know until late in the process.
- A chatbot will answer "does X sponsor?" fluently whether or not any record backs it.

The public record does exist, but it is filed under **legal entity names** ("GEMINI SPACE STATION LLC", not "Gemini") and **specific titles** ("Business Intelligence Engineer"). A student would have to know both to look it up. Employers can see their own sponsorship history; the student can't. Two smaller gaps compound it: whether a posting is still real or a dead link that still loads, and whether the hiring timeline fits a clock the employer doesn't track.

## Engine layers

| Layer | Role |
|---|---|
| **80 Days to Stay**: `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` | Sponsorship vote: approvals plus Data Engineer-family titles → Proven / Likely / Possible |
| **Job-Ops**: `npm run ats:liveness` | Liveness gate |
| **Visa timeline**: computed from the persona | Timeline gate |
| Scorer: `scripts/score/role-scorer.mjs` | Combines them, unchanged |

## Where it fits the 3-3-2 day

It takes over the **research half of the 2 research-and-apply hours**: the "should I even tailor for this posting?" check that comes before tailoring. It does not write applications.

| Step, per posting | By hand (estimate) | With the recipe (estimate) |
|---|---|---|
| Find the employer's sponsorship history and check it covers Data Engineer-type roles | 10–15 min (search a visa database, guess the legal name, scan titles) | seconds (automatic) + ~2 min G1 confirmation |
| Is the posting live? | ~2 min | batch `ats:liveness` + ~1 min to open the link (G2) |
| Does the timeline fit OPT? | ~2 min, error-prone | automatic, shown in the report |
| **Total** | **~15–20 min** | **~4–5 min** |

**Estimate, not a measurement:** at about 20 postings a week, that's roughly **5–6.5 hours by hand vs. about 1.5 hours**, so about **3.5–5 hours saved per week**. These are my assumptions about manual research time, not timed sessions. The sample run itself took under a second; the human checks are the real cost.

It also feeds the other hours:
- **Networking (3):** every strong sponsor with no live posting becomes a "network into" target. The report also lists the top Data Engineer-family sponsors not on the candidate list (Amgen, Zoox, DocuSign, Roku…).
- **Credibility (3):** the recipe, with tests and a public account of what it can't verify, is itself a judgment-showing project.

## Domain-specific failure modes

1. **The brand-name disappearance. This happened in the sample run.** The student types "Gemini" and the record says "GEMINI SPACE STATION LLC". The tool honestly reports `not-in-csv`, and the student moves on. A what-if run with the legal name showed Gemini was a **Proven** sponsor (24 approvals, "Senior Analytics Engineer"), and the posting would have scored **Apply (0.465)**. *Shape of the error:* a strong opportunity silently becomes "unknown". *Hardest to catch for:* a student new to the US who doesn't know companies' legal names, and who reads `not-in-csv` as "doesn't sponsor".
2. **The stale-sponsor halo.** Approval counts carry no year, and are company-wide. A company that sponsored Data Engineers years ago, or that mostly sponsors other roles, rates **Proven** with nothing in the report looking wrong. *Hardest to catch for:* everyone, because the error is invisible in the data. Only a conversation with a current employee or recruiter reveals it. That's why the recipe routes "Consider" results to networking before applying.

A third limit is specific to this persona's nationwide search: the sponsor file's H-1B rows cover companies **headquartered in only six states** (CA, NY, MA, WA, TX, IL). A sponsor headquartered elsewhere is invisible, and its absence is easy to misread as "doesn't sponsor".
