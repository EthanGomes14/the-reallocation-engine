# Domain Justification — Data Engineer H-1B sponsor screen

## Executive summary

An international student hunting for Data Engineer jobs can't easily tell which employers have actually sponsored visas for this kind of work. The answer is filed under legal company names and scattered job titles. This tool turns that question into a checked record in seconds, and confirms the posting is real and the timing fits. Its most dangerous errors are quiet: a real sponsor disappearing because its name didn't match, and an old sponsor looking current.

## Who uses it, in exactly what situation

An F-1 master's student in the **final semester before OPT starts**, seeking **new-grad Data Engineer** work (or the same work under another title) **anywhere in the US**, who needs **H-1B sponsorship**. Worked example: the fictional persona "Electrifier", OPT starting 2027-03-01, practical deadline 2027-05-20.

What makes it specific:
1. **The OPT clock hasn't started.** An October application can't start before March, whatever the hiring speed.
2. **Sponsorship must be for Data Engineer-type work.** A company that sponsored hundreds of nurses is not evidence for this role.
3. **The work hides behind many titles:** Analytics Engineer, BI Engineer, ETL Developer, "Software Engineer, Data".

## The information asymmetry

The student can't see **whether this employer has sponsored H-1Bs for Data Engineer-type roles**. Postings rarely say, recruiters often don't know, and a chatbot answers anyway. The record exists, but under **legal names** ("GEMINI SPACE STATION LLC", not "Gemini") and **specific titles**. Smaller gaps compound it: whether a posting is still live, and whether hiring fits an OPT clock the employer doesn't track.

## Engine layers

**80 Days to Stay** sponsor CSV (sponsorship vote) · **Job-Ops** `ats:liveness`, plus a Greenhouse API cross-check (liveness gate) · **visa timeline** from the persona (timeline gate) · the engine's existing **role scorer**, unchanged.

## Where it fits the 3-3-2 day

It takes over the **research half of the 2 research-and-apply hours**: the "is this posting worth tailoring for?" check. It doesn't write applications.

| Per posting | By hand | With the recipe |
|---|---|---|
| Sponsorship history for Data Engineer-type roles | 10–15 min | seconds + ~2 min to confirm the match |
| Is the posting live? | ~2 min | batch check + ~1 min to open the link |
| Does the timing fit OPT? | ~2 min | automatic |

**Estimate, not a measurement:** at about 20 postings a week, roughly **5–6.5 hours by hand vs. about 1.5 hours**, so **about 3.5–5 hours saved per week**.

It also feeds **networking** (strong sponsors with no open posting become a "network into" list) and **credibility** (a tested project that is honest about its limits).

## Domain-specific failure modes

1. **Brand-name disappearance (seen in the sample run).** "Gemini" came back "not found". Under its legal name it is a **Proven** sponsor, and the posting would have been an **Apply**. *Shape:* a strong lead silently becomes "unknown". *Hardest to catch for:* a student new to the US who doesn't know legal names and reads "not found" as "doesn't sponsor".
2. **Stale-sponsor halo.** Approvals have no year and are company-wide, so a company that stopped sponsoring, or mostly sponsors other roles, still rates **Proven**, and nothing in the report looks wrong. *Hardest to catch for:* everyone. Only a current employee or recruiter can reveal it, which is why "Consider" results go to networking first.

Also: the sponsor file covers companies headquartered in only six states, so for a nationwide search a missing record is not evidence of no sponsorship.
