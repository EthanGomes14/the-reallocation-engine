#!/usr/bin/env node
// sponsor-screen.mjs — Data Engineer H-1B sponsor screen (recipe:
// recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md).
//
// For each candidate posting: check the input row (G0), match the company to
// the 80 Days to Stay sponsor CSV and grade its Data Engineer-family
// sponsorship evidence (G1), read the posting's liveness from saved
// `npm run ats:liveness` output plus the Greenhouse API cross-check (G2),
// compute the OPT timeline gate from the persona (G3), then hand the evidence
// to the EXISTING scorer (scripts/score/role-scorer.mjs) — never a copy of it.
// Writes a JSON log for the agent and a Markdown report for the person (G4 is
// the person reading it). The timeline gate was removed in v0.3.0 and
// restored in v0.4.0.
//
// Offline: reads local files only, makes no network calls, calls no AI service.
//
//   node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/sponsor-screen.mjs [options]
//     --candidates <json>   candidate postings      (default: samples/candidates-2026-10-03.json)
//     --liveness <txt>      saved ats:liveness output (default: samples/liveness-2026-10-03.txt)
//     --persona <json>      persona                 (default: fixtures/persona-electrifier.json)
//     --csv <csv>           sponsor CSV             (default: the 80 Days to Stay CSV)
//     --rules <json>        decision rules          (default: rules.json)
//     --out-dir <dir>       output folder           (default: course/2026fa/submissions/ethangomes14/runs/screen-sample)
//     --today <YYYY-MM-DD>  evaluation date         (default: today's local date)
//     --scorer <mjs>        scorer to call          (default: scripts/score/role-scorer.mjs; tests pass a BROKEN-* mutant)
//     --greenhouse-status <json>  saved output of fetch-greenhouse-status.mjs
//                           (default: samples/greenhouse-status-2026-10-03.json; if the default
//                           file is absent the cross-check is reported as not run, never assumed)
//
// Exit codes: 0 = run complete · 2 = stopped on bad input (nothing scored) ·
//             3 = scorer output failed the gate-invariant check.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  SRC, parseCsv, normalizeName, buildCompanyIndex, compileFamily, isFamilyTitle,
  sponsorshipEvidence, parseDate, timelineFactor, parseLivenessLog, livenessFactor,
  validateCandidate, parseGreenhouseStatus, applyGreenhouseCheck,
} from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../..');
// Repo-relative inside the repo; absolute outside it (e.g. a temp dir).
const rel = (p) => { const r = path.relative(ROOT, p); return r.startsWith('..') ? path.resolve(p) : r || '.'; };

const DEFAULTS = {
  candidates: path.join(HERE, 'samples/candidates-2026-10-03.json'),
  liveness: path.join(HERE, 'samples/liveness-2026-10-03.txt'),
  persona: path.join(HERE, 'fixtures/persona-electrifier.json'),
  csv: path.join(ROOT, 'data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv'),
  rules: path.join(HERE, 'rules.json'),
  'out-dir': path.join(ROOT, 'course/2026fa/submissions/ethangomes14/runs/screen-sample'),
  scorer: path.join(ROOT, 'scripts/score/role-scorer.mjs'),
  'greenhouse-status': path.join(HERE, 'samples/greenhouse-status-2026-10-03.json'),
};

function stop(msg) {
  console.error(`STOP: ${msg}\nNothing was scored and no outputs were written.`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { ...DEFAULTS, today: null };
  const explicit = new Set();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) stop(`unexpected argument "${a}"`);
    const key = a.slice(2);
    if (!(key in opts)) stop(`unknown option ${a}`);
    const v = argv[++i];
    if (v == null) stop(`${a} needs a value`);
    opts[key] = key === 'today' ? v : path.resolve(v);
    explicit.add(key);
  }
  return { opts, explicit };
}

function localToday() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function readText(p, what) {
  if (!fs.existsSync(p)) stop(`${what} not found: ${rel(p)}`);
  return fs.readFileSync(p, 'utf8');
}

function readJson(p, what) {
  try { return JSON.parse(readText(p, what)); } catch (e) { stop(`${what} is not valid JSON (${rel(p)}): ${e.message}`); }
}

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

// Outputs may only go to this contribution's own namespaces (or a temp dir for tests).
// Compares real paths, so symlinks (macOS /tmp → /private/tmp) can't sneak past.
function realish(p) {
  let cur = path.resolve(p);
  const rest = [];
  while (!fs.existsSync(cur)) { rest.unshift(path.basename(cur)); cur = path.dirname(cur); }
  return path.join(fs.realpathSync(cur), ...rest);
}

// Inside the repo: only this contribution's own folders. Outside the repo: only
// a temp dir (for tests). Checked in that order, so a repo that itself lives
// under /tmp (a clean-checkout test) still can't write to data/ or recipes/.
function checkOutDir(dir) {
  const within = (p, base) => p === base || p.startsWith(base + path.sep);
  const real = realish(dir);
  const ownDirs = [HERE, path.join(ROOT, 'course/2026fa/submissions/ethangomes14')].map(realish);
  const tmpDirs = [os.tmpdir(), '/tmp'].filter((a) => fs.existsSync(a)).map(realish);
  const ok = within(real, realish(ROOT))
    ? ownDirs.some((a) => within(real, a))
    : tmpDirs.some((a) => within(real, a));
  if (!ok) {
    stop(`--out-dir ${rel(real)} is outside this contribution's folders; refusing to write there`);
  }
}

function loadRules(p) {
  const raw = readJson(p, 'rules file');
  const rules = {};
  for (const [k, v] of Object.entries(raw)) if (!k.startsWith('_')) rules[k] = v && typeof v === 'object' && 'value' in v ? v.value : v;
  for (const k of ['family_patterns', 'exclusion_patterns', 'tiers', 'sponsorship_source_label', 'timeline', 'liveness', 'name_suffixes']) {
    if (rules[k] == null) stop(`rules file is missing "${k}"`);
  }
  return rules;
}

const NEXT = {
  Apply: 'Tailor an application (research-and-apply hours).',
  Consider: 'Check the soft spot named in "why"; if it holds up, talk to someone at the company before applying (networking hours).',
  SkipNetwork: 'Network into this company: strong sponsorship record but no live posting (networking hours).',
  Skip: 'Skip. Time is better spent elsewhere.',
};

const UNSCORED_NEXT = {
  'invalid-input-row': 'Fix the input row, then re-run.',
  'posting-not-data-engineer-family': 'Outside the Data Engineer title family. Skip, or add the title to the family rule deliberately.',
  'url-not-in-liveness-log': 'Run `npm run ats:liveness -- <url>` for this posting, save the output, then re-run.',
  'liveness-log-has-no-checked-date': 'Add a "# checked: YYYY-MM-DD" line to the saved liveness output, then re-run.',
  'not-in-csv': 'No sponsorship record found under this name. Check name variants by hand (legal vs brand name) before spending time.',
  'ambiguous-match': 'Several CSV rows share this name. Pick the right employer by hand.',
  'no-h1b-record': 'Company is in the file but has no H-1B data. Treat sponsorship as unknown; research by hand.',
};

function main() {
  const { opts, explicit } = parseArgs(process.argv.slice(2));
  const todayStr = opts.today || localToday();
  const today = parseDate(todayStr);
  if (!today) stop(`--today must be YYYY-MM-DD, got "${todayStr}"`);
  checkOutDir(opts['out-dir']);

  // ── load inputs (any failure here stops the whole run) ──
  const rules = loadRules(opts.rules);
  const persona = readJson(opts.persona, 'persona file');
  if (persona.needs_sponsorship !== true) stop('this recipe is for candidates who need sponsorship; persona.needs_sponsorship must be true');
  if (!persona.visa_timeline) stop('persona file has no visa_timeline block');
  const timeline = timelineFactor(persona.visa_timeline, today, rules);
  if (timeline.status !== 'ok') stop(`timeline gate cannot be computed: ${timeline.reason}`);

  const csvText = readText(opts.csv, 'sponsor CSV');
  const csvRows = parseCsv(csvText);
  for (const col of ['company_name', 'Total Approvals', 'top_job_titles_sponsored']) {
    if (!csvRows.length || !(col in csvRows[0])) stop(`sponsor CSV has no "${col}" column (schema drift?)`);
  }
  const index = buildCompanyIndex(csvRows, rules.name_suffixes);
  const family = compileFamily(rules);

  const candText = readText(opts.candidates, 'candidates file');
  let cand;
  try { cand = JSON.parse(candText); } catch (e) { stop(`candidates file is not valid JSON: ${e.message}`); }
  const candidates = Array.isArray(cand) ? cand : cand.candidates;
  if (!Array.isArray(candidates) || !candidates.length) stop('candidates file has no candidate rows');

  const liveText = readText(opts.liveness, 'liveness log');
  const live = parseLivenessLog(liveText);

  // Greenhouse cross-check: an explicitly named file must exist; the default
  // file may be absent, in which case the check is reported as not run.
  const ghPath = opts['greenhouse-status'];
  let ghText = null;
  let gh = null;
  if (fs.existsSync(ghPath)) {
    ghText = fs.readFileSync(ghPath, 'utf8');
    try { gh = parseGreenhouseStatus(JSON.parse(ghText)); } catch (e) { stop(`Greenhouse status file is not valid JSON (${rel(ghPath)}): ${e.message}`); }
  } else if (explicit.has('greenhouse-status')) stop(`Greenhouse status file not found: ${rel(ghPath)}`);

  // ── per-candidate gates ──
  const results = [];
  for (const c of candidates) {
    const r = { role_id: c?.role_id ?? null, company: c?.company ?? null, title: c?.title ?? null, location: c?.location ?? null, url: c?.url ?? null, gates: {}, status: 'scoreable' };
    results.push(r);

    const problems = validateCandidate(c);
    r.gates.G0_input = problems.length ? { pass: false, problems } : { pass: true };
    if (problems.length) { r.status = 'unscored'; r.reason = 'invalid-input-row'; continue; }

    r.fit = { p: c.fit.p, source: SRC.model, reason: c.fit.reason };
    r.posting_title_in_family = { value: isFamilyTitle(c.title, family), source: SRC.model };

    // G2 liveness is read first so that unscored rows still show it.
    // The Greenhouse cross-check can only close the gate (API 404), never open it.
    const lv = applyGreenhouseCheck(livenessFactor(c.url, live, today, rules), c.url, gh, today, rules);
    r.gates.G2_liveness = lv;

    // G1 company match + sponsorship evidence
    const key = normalizeName(c.company, rules.name_suffixes);
    const hits = index.get(key) || [];
    if (hits.length === 0) r.gates.G1_company_match = { pass: false, reason: 'not-in-csv', normalized_name: key };
    else if (hits.length > 1) r.gates.G1_company_match = { pass: false, reason: 'ambiguous-match', normalized_name: key, csv_names: hits.map((h) => h.company_name) };
    else {
      const sp = sponsorshipEvidence(hits[0], family, rules);
      r.gates.G1_company_match = { pass: sp.status === 'ok', normalized_name: key, reason: sp.status === 'ok' ? null : sp.reason, human_check: 'confirm the CSV row is the same employer and the matched titles are Data Engineer-type work' };
      r.sponsorship = sp;
    }

    // first failing condition decides why a row is unscored (never defaulted)
    if (!r.posting_title_in_family.value) { r.status = 'unscored'; r.reason = 'posting-not-data-engineer-family'; }
    else if (lv.status !== 'ok') { r.status = 'unscored'; r.reason = lv.reason; }
    else if (!r.gates.G1_company_match.pass) { r.status = 'unscored'; r.reason = r.gates.G1_company_match.reason; }
  }

  // ── hand scoreable rows to the existing scorer ──
  fs.mkdirSync(opts['out-dir'], { recursive: true });
  const scoreable = results.filter((r) => r.status === 'scoreable');
  const roles = scoreable.map((r) => ({
    role_id: r.role_id,
    company: r.company,
    title: r.title,
    sponsorship: { p: r.sponsorship.p, tier: r.sponsorship.tier, source: r.sponsorship.p_source },
    fit: { p: r.fit.p, source: SRC.model },
    liveness: { factor: r.gates.G2_liveness.factor, source: SRC.record },
    timeline: { factor: timeline.factor, source: SRC.input },
  }));
  const rolesPath = path.join(opts['out-dir'], 'roles.json');
  fs.writeFileSync(rolesPath, JSON.stringify(roles, null, 2) + '\n');

  let scorerStdout = '';
  let scored = [];
  if (roles.length) {
    try {
      scorerStdout = execFileSync(process.execPath, [opts.scorer, rolesPath, '--out-dir', opts['out-dir']], { encoding: 'utf8', cwd: ROOT });
    } catch (e) {
      console.error(`STOP: the scorer failed: ${(e.stderr || e.message || '').toString().trim()}`);
      process.exit(3);
    }
    scored = JSON.parse(fs.readFileSync(path.join(opts['out-dir'], 'role-scores.json'), 'utf8')).roles || [];
  }

  // ── post-condition: the scorer must respect the gates (break-test target) ──
  const violations = [];
  const byId = new Map(scored.map((s) => [s.role_id, s]));
  if (scored.length !== roles.length) violations.push(`scorer returned ${scored.length} roles for ${roles.length} inputs`);
  for (const role of roles) {
    const s = byId.get(role.role_id);
    if (!s) { violations.push(`${role.role_id}: missing from scorer output`); continue; }
    if (!['Apply', 'Consider', 'Skip'].includes(s.recommendation)) violations.push(`${role.role_id}: unknown recommendation "${s.recommendation}"`);
    if ((role.liveness.factor <= 0.05 || role.timeline.factor <= 0.05) && s.recommendation !== 'Skip') {
      violations.push(`${role.role_id}: a closed gate (liveness ${role.liveness.factor}, timeline ${role.timeline.factor}) but scorer said ${s.recommendation}`);
    }
  }

  for (const r of results) {
    if (r.status === 'unscored') { r.next_action = UNSCORED_NEXT[r.reason] || 'Review by hand.'; continue; }
    const s = byId.get(r.role_id);
    r.scorer = s ? { recommendation: s.recommendation, composite: s.composite, why: s.reason ?? null, arithmetic: s.trace?.arithmetic ?? null, trace: s.trace ?? null } : null;
    const rec = s?.recommendation;
    const strongSponsor = ['Proven', 'Likely'].includes(r.sponsorship?.tier);
    if (rec === 'Skip' && r.gates.G2_liveness.factor === 0 && strongSponsor) { r.next_action = NEXT.SkipNetwork; r.network_target = true; }
    else r.next_action = NEXT[rec] || 'Review by hand.';
  }

  // ── network list: strong Data Engineer-family sponsors not on the candidate list ──
  const candidateKeys = new Set(results.map((r) => normalizeName(r.company, rules.name_suffixes)));
  const network = [];
  for (const row of csvRows) {
    const key = normalizeName(row.company_name, rules.name_suffixes);
    if (candidateKeys.has(key)) continue;
    const sp = sponsorshipEvidence(row, family, rules);
    if (sp.status === 'ok' && sp.tier === 'Proven') network.push({ company: row.company_name, hq_state: row.state || null, total_approvals: sp.evidence.total_approvals.value, family_titles: sp.evidence.family_titles_matched.value });
  }
  network.sort((a, b) => b.total_approvals - a.total_approvals || a.company.localeCompare(b.company));
  const networkTop = network.slice(0, rules.network_list_size ?? 10);

  // ── counts ──
  const count = (pred) => results.filter(pred).length;
  const counts = {
    candidates: results.length,
    unscored: count((r) => r.status === 'unscored'),
    apply: count((r) => r.scorer?.recommendation === 'Apply'),
    consider: count((r) => r.scorer?.recommendation === 'Consider'),
    skip: count((r) => r.scorer?.recommendation === 'Skip'),
  };
  counts.skip_or_unscored_rate = results.length ? Number(((counts.skip + counts.unscored) / results.length).toFixed(3)) : null;
  const unscoredReasons = {};
  for (const r of results) if (r.status === 'unscored') unscoredReasons[r.reason] = (unscoredReasons[r.reason] || 0) + 1;

  const log = {
    workflow: 'ethangomes14-data-engineer-h1b',
    recipe: 'recipes/cases/2026fa/ethangomes14-data-engineer-h1b.md',
    recipe_version: '0.4.0',
    mode: 'sample',
    status: violations.length ? 'FAILED-gate-invariant' : 'complete',
    generated_at: new Date().toISOString(),
    today: todayStr,
    inputs: {
      candidates: { path: rel(opts.candidates), sha256: sha256(candText) },
      liveness_log: { path: rel(opts.liveness), sha256: sha256(liveText), checked: live.checked },
      persona: { path: rel(opts.persona), id: persona.persona_id ?? null },
      sponsor_csv: { path: rel(opts.csv), sha256: sha256(csvText), rows: csvRows.length },
      greenhouse_status: gh ? { path: rel(ghPath), sha256: sha256(ghText), checked: gh.checked } : { path: rel(ghPath), status: 'not-run (file absent)' },
      rules: { path: rel(opts.rules) },
      scorer: { path: rel(opts.scorer) },
    },
    timeline_gate: timeline,
    counts,
    unscored_reasons: unscoredReasons,
    gate_invariant_violations: violations,
    roles: results,
    network_list: { source: SRC.record, note: 'Proven-tier Data Engineer-family sponsors not on the candidate list, by total approvals (company-wide). Title matching is model-judgment.', companies: networkTop, total_proven_family_sponsors: network.length },
    human_gates_pending: [
      'G1: confirm each matched CSV row is the same employer and its matched titles are Data Engineer-type work',
      'G2: confirm each "active" posting URL lands on the specific job, not a general careers page',
      'G3: confirm the persona timeline inputs (OPT start, hiring lag, buffer)',
      'G4: read the Markdown report before acting on any Apply',
    ],
    outputs: {
      log: rel(path.join(opts['out-dir'], 'screen-log.json')),
      report: rel(path.join(opts['out-dir'], 'screen-report.md')),
      roles_json: rel(rolesPath),
      scorer_json: roles.length ? rel(path.join(opts['out-dir'], 'role-scores.json')) : null,
      scorer_md: roles.length ? rel(path.join(opts['out-dir'], 'role-scores.md')) : null,
    },
    scorer_stdout: scorerStdout.trim(),
  };
  fs.writeFileSync(path.join(opts['out-dir'], 'screen-log.json'), JSON.stringify(log, null, 2) + '\n');
  fs.writeFileSync(path.join(opts['out-dir'], 'screen-report.md'), renderReport(log, persona));

  console.log(`sponsor-screen: ${counts.candidates} candidates → Apply ${counts.apply} · Consider ${counts.consider} · Skip ${counts.skip} · unscored ${counts.unscored} (skip+unscored ${(counts.skip_or_unscored_rate * 100).toFixed(0)}%)`);
  for (const [k, v] of Object.entries(unscoredReasons)) console.log(`  unscored: ${k} × ${v}`);
  const ghClosed = results.filter((r) => r.gates.G2_liveness?.closed_by === 'greenhouse-api-404');
  const ghChecked = results.filter((r) => r.gates.G2_liveness?.cross_check?.status === 'checked').length;
  console.log(`  greenhouse cross-check: ${gh ? `${ghChecked} checked (status file ${gh.checked})` : 'not run'}${ghClosed.length ? ` · closed ${ghClosed.length} redirected dead posting(s): ${ghClosed.map((r) => r.role_id).join(', ')}` : ''}`);
  console.log(`  timeline gate: factor ${timeline.factor} [your-input] · earliest start ${timeline.detail.earliest_start} · practical deadline ${timeline.detail.practical_deadline} · slack ${timeline.detail.slack_days} days`);
  console.log(`  ${log.outputs.log}  +  ${log.outputs.report}`);
  if (violations.length) {
    console.error(`STOP: scorer output failed the gate-invariant check:\n  - ${violations.join('\n  - ')}`);
    process.exit(3);
  }
}

// ── priority order for the person: where to spend the next hour first ──
// 1 Apply · 2 Consider · 3 unscored but worth hand research (live posting, no
// usable record yet) · 4 Skip that is a networking target · 5 Skip · 6 unscored
// and out of scope. Within a group: higher composite, then higher fit.
const RESEARCH_REASONS = new Set(['not-in-csv', 'ambiguous-match', 'no-h1b-record', 'url-not-in-liveness-log']);
function priorityGroup(r) {
  const rec = r.scorer?.recommendation;
  if (rec === 'Apply') return { rank: 1, label: 'Apply now' };
  if (rec === 'Consider') return { rank: 2, label: 'Consider' };
  if (r.status === 'unscored' && RESEARCH_REASONS.has(r.reason)) return { rank: 3, label: 'Research first' };
  if (rec === 'Skip' && r.network_target) return { rank: 4, label: 'Network, don\'t apply' };
  if (rec === 'Skip') return { rank: 5, label: 'Skip' };
  return { rank: 6, label: 'Out of scope' };
}
function byPriority(a, b) {
  const ga = priorityGroup(a).rank; const gb = priorityGroup(b).rank;
  if (ga !== gb) return ga - gb;
  const ca = a.scorer?.composite ?? -1; const cb = b.scorer?.composite ?? -1;
  if (ca !== cb) return cb - ca;
  return (b.fit?.p ?? -1) - (a.fit?.p ?? -1);
}
function livenessShort(lv) {
  if (!lv || lv.status !== 'ok') return `not checked (${lv?.reason ?? '—'})`;
  const cc = lv.cross_check?.status === 'checked' ? ` · API ${lv.cross_check.http_status ?? 'error'}` : '';
  if (lv.closed_by === 'greenhouse-api-404') return `❌ dead (checker said active, API 404)`;
  return lv.factor > 0 ? `✅ open${cc}` : `❌ ${lv.detail.verdict}${lv.detail.stale ? ', stale' : ''}${cc}`;
}

// ── Markdown report for the person (P5: a different artifact from the log) ──
function renderReport(log, persona) {
  const c = log.counts;
  const t = log.timeline_gate.detail;
  const L = (v, src) => `${v ?? '—'} \`${src}\``;
  const o = [];
  o.push(`# Data Engineer sponsor screen — ${log.today}`);
  o.push('');
  o.push('## Executive summary');
  o.push('');
  o.push(`**What this is.** A check of ${c.candidates} Data Engineer-type job postings for a fictional international student ("${persona.display_name ?? persona.persona_id}") who will need visa sponsorship. Each posting was checked for three things: whether public records show the company sponsoring H-1B visas for this kind of work, whether the posting is still open, and whether hiring can finish before the student's work-authorization window closes.`);
  o.push('');
  o.push(`**Why read it.** It tells you where to spend limited job-search hours, and shows where every number came from so you can check it before acting.`);
  o.push('');
  o.push(`**What it found.** ${c.apply} to apply to, ${c.consider} to consider, ${c.skip} to skip, and ${c.unscored} that could not be scored because evidence was missing. ${Math.round((c.skip_or_unscored_rate ?? 0) * 100)}% of postings ended as skip or unscored. ${log.status === 'complete' ? 'Nothing here is final: the checks marked "you must confirm" need a person before any application goes out.' : '**This run FAILED its safety check — do not use its recommendations.**'}`);
  o.push('');
  o.push('## Priority list (highest priority first)');
  o.push('');
  o.push('Order: **Apply now** → **Consider** → **Research first** (live posting, but no usable sponsorship record yet) → **Network, don\'t apply** (strong sponsor, posting closed) → **Skip** → **Out of scope**. Within a group, the higher score comes first.');
  o.push('');
  o.push('| # | Priority | Company | Job | Location | Score | Sponsorship record | Fit | Posting live? | What to do | Link |');
  o.push('|---|---|---|---|---|---|---|---|---|---|---|');
  [...log.roles].sort(byPriority).forEach((r, i) => {
    const sp = r.sponsorship;
    const spShort = sp?.status === 'ok' ? `${sp.tier} · ${sp.evidence.total_approvals.value} approvals` : `none found (${r.gates.G1_company_match?.reason ?? r.reason ?? '—'})`;
    const score = r.scorer?.composite != null ? Number(r.scorer.composite).toFixed(3) : '—';
    o.push(`| ${i + 1} | **${priorityGroup(r).label}** | ${r.company ?? '—'} | ${r.title ?? '—'} | ${r.location ?? '—'} | ${score} | ${spShort} | ${r.fit?.p ?? '—'} | ${livenessShort(r.gates.G2_liveness)} | ${r.next_action} | ${r.url ? `[open](${r.url})` : '—'} |`);
  });
  o.push('');
  o.push('## Results');
  o.push('');
  o.push('Labels: `record` = read from a data file or script output · `model-judgment` = a rule or rating proposed by Claude · `your-input` = a persona value or author-chosen rule.');
  o.push('');
  o.push('| Posting | Result | Sponsorship evidence | Fit | Liveness | Next action |');
  o.push('|---|---|---|---|---|---|');
  for (const r of log.roles) {
    const sp = r.sponsorship;
    const ev = sp?.evidence;
    const spCell = sp?.status === 'ok'
      ? `${sp.tier}, p ${sp.p} \`${sp.p_source}\` · approvals ${L(ev.total_approvals.value, 'record')} · DE-family titles: ${ev.family_titles_matched.value.length ? ev.family_titles_matched.value.join('; ') : 'none'} \`model-judgment\``
      : sp ? `missing: ${sp.reason} (CSV row "${ev.csv_company_name.value}")` : `missing: ${r.gates.G1_company_match?.reason ?? 'not checked'}`;
    const lv = r.gates.G2_liveness;
    const cc = lv?.cross_check;
    const ccText = cc?.status === 'checked' ? ` · Greenhouse API ${cc.http_status ?? 'error'} (${cc.verdict}) on ${cc.checked_on} \`record\``
      : cc ? ` · Greenhouse cross-check: ${cc.status}` : '';
    const lvCell = lv?.status === 'ok'
      ? `${lv.detail.verdict} on ${lv.detail.checked_on}${lv.detail.stale ? ' (stale)' : ''}${ccText} → factor ${lv.factor} \`record\`${lv.closed_by === 'greenhouse-api-404' ? ' — **closed: redirected dead posting**' : ''}`
      : `missing: ${lv?.reason ?? 'not checked'}`;
    const res = r.status === 'unscored' ? `**unscored** (${r.reason})` : `**${r.scorer?.recommendation ?? '?'}** ${r.scorer?.composite != null ? Number(r.scorer.composite).toFixed(3) : ''}<br>${r.scorer?.why ?? ''}<br>\`${r.scorer?.arithmetic ?? ''}\``;
    const fit = r.fit ? `${r.fit.p} \`model-judgment\` — ${r.fit.reason}` : '—';
    o.push(`| ${r.company} — ${r.title} | ${res} | ${spCell} | ${fit} | ${lvCell} | ${r.next_action} |`);
  }
  o.push('');
  o.push('## Timeline gate (same for every posting)');
  o.push('');
  o.push(`OPT starts ${L(t.opt_start, 'your-input')}; hiring lag ${L(t.hiring_lag_days + ' days', 'your-input')}; buffer ${L(t.buffer_days + ' days', 'your-input')}. Legal deadline ${t.legal_deadline}; practical deadline **${t.practical_deadline}**. Earliest possible start **${t.earliest_start}** (set by ${t.earliest_start_bound_by}). Slack **${t.slack_days} days** → timeline factor **${log.timeline_gate.factor}** \`your-input\`.`);
  o.push('');
  o.push('## You must confirm before acting');
  o.push('');
  for (const g of log.human_gates_pending) o.push(`- [ ] ${g}`);
  for (const r of log.roles) if (r.gates.G2_liveness?.status === 'ok' && r.gates.G2_liveness.factor > 0) o.push(`  - G2: open ${r.url} and confirm it is "${r.title}" at ${r.company}`);
  o.push('');
  o.push('## Companies to network into');
  o.push('');
  const fromCands = log.roles.filter((r) => r.network_target);
  if (fromCands.length) { o.push('From your candidates (strong sponsor, posting not live):'); for (const r of fromCands) o.push(`- ${r.company} (${r.sponsorship.tier})`); o.push(''); }
  o.push(`Strongest Data Engineer-family sponsors **not** on your list (${log.network_list.total_proven_family_sponsors} Proven-tier in total; top ${log.network_list.companies.length} by company-wide approvals):`);
  o.push('');
  o.push('| Company | HQ state `record` | Total approvals `record` | Matched titles `model-judgment` |');
  o.push('|---|---|---|---|');
  for (const n of log.network_list.companies) o.push(`| ${n.company} | ${n.hq_state ?? '—'} | ${n.total_approvals} | ${n.family_titles.join('; ')} |`);
  o.push('');
  o.push('## What this run cannot tell you');
  o.push('');
  o.push('- Whether a company will sponsor **this** candidate now. Approval counts have no year; an old sponsor looks current.');
  o.push('- How many approvals were for Data Engineer roles. Approvals are company-wide; titles show only the top ~5.');
  o.push('- Anything about companies headquartered outside the six states the sponsor file covers (CA, NY, MA, WA, TX, IL). A missing record is not evidence of no sponsorship.');
  o.push('- Whether a company name variant (brand vs legal name) hides a real record. Matching is exact after normalization.');
  o.push('- Whether an "active" posting is truly that job, for non-Greenhouse links. The liveness checker can report a redirected dead posting as active; the Greenhouse API cross-check catches this only for Greenhouse job IDs, and an API 200 means the job exists, not that it is still being filled.');
  o.push('- E-Verify enrollment (needed for a STEM OPT extension), funding, and role quality or wages. Out of scope.');
  o.push('');
  o.push('## Run record');
  o.push('');
  o.push(`- Status: ${log.status} · mode: ${log.mode} · evaluated as of ${log.today} · generated ${log.generated_at}`);
  for (const [k, v] of Object.entries(log.inputs)) o.push(`- ${k}: \`${v.path}\`${v.sha256 ? ` (sha256 ${v.sha256.slice(0, 12)}…)` : ''}${v.rows ? `, ${v.rows} rows` : ''}${v.checked ? `, checked ${v.checked}` : ''}`);
  o.push(`- Scorer said: ${log.scorer_stdout ? log.scorer_stdout.split('\n')[0] : '(not called — nothing scoreable)'}`);
  if (log.gate_invariant_violations.length) { o.push('- **Gate-invariant violations:**'); for (const v of log.gate_invariant_violations) o.push(`  - ${v}`); }
  o.push('');
  return o.join('\n');
}

main();
