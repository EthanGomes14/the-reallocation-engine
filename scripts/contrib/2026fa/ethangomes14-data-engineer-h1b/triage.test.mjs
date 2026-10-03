// triage.test.mjs — offline tests for the data-engineer-h1b prototype.
// Fixtures only (invented companies, example.com URLs); no network calls.
// The integration tests run the REAL scorer (scripts/score/role-scorer.mjs)
// through triage.mjs; the break test swaps in fixtures/BROKEN-*.
//
//   node --test scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/triage.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  parseCsv, normalizeName, compileFamily, isFamilyTitle, sponsorshipEvidence,
  parseDate, timelineFactor, parseLivenessLog, livenessFactor, validateCandidate,
} from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FX = (f) => path.join(HERE, 'fixtures', f);
const RAW_RULES = JSON.parse(fs.readFileSync(path.join(HERE, 'rules.json'), 'utf8'));
const RULES = Object.fromEntries(Object.entries(RAW_RULES).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [k, v.value]));
const FAMILY = compileFamily(RULES);
const PERSONA = JSON.parse(fs.readFileSync(FX('persona-electrifier.json'), 'utf8'));

function runTriage(extra, today = '2026-10-03') {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'de-h1b-'));
  const args = [path.join(HERE, 'triage.mjs'),
    '--candidates', FX('candidates-fixture.json'),
    '--liveness', FX('liveness-fixture.txt'),
    '--csv', FX('sponsors-fixture.csv'),
    '--today', today,
    '--out-dir', out, ...extra];
  const res = spawnSync(process.execPath, args, { encoding: 'utf8' });
  const logPath = path.join(out, 'triage-log.json');
  const log = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf8')) : null;
  return { ...res, out, log, role: (id) => log?.roles.find((r) => r.role_id === id) };
}

// ── unit: parsing and matching ──────────────────────────────────────────────
test('CSV parser handles quoted commas and doubled quotes', () => {
  const rows = parseCsv(fs.readFileSync(FX('sponsors-fixture.csv'), 'utf8'));
  const q = rows.find((r) => r.company_name.startsWith('QUOTED'));
  assert.equal(q.company_name, 'QUOTED, COMMA INC');
  assert.equal(q.total_funding, 'He said "hi"'); // doubled quotes inside a quoted field
  assert.equal(q.board_directors, '');
  assert.equal(q['Total Approvals'], '15.0');
});

test('name normalization strips legal suffixes but never fuzzes', () => {
  const s = RULES.name_suffixes;
  assert.equal(normalizeName('ACME DATA INC', s), 'acme data');
  assert.equal(normalizeName('Acme Data, Inc.', s), 'acme data');
  assert.equal(normalizeName('BigSponsor Corp.', s), 'bigsponsor');
  assert.notEqual(normalizeName('Acme Data Holdings', s), normalizeName('ACME DATA INC', s));
});

test('title family includes Data Engineer-type titles and excludes wrong levels', () => {
  for (const t of ['Data Engineer', 'Senior Analytics Engineer', 'Business Intelligence Engineer', 'Software Engineer, Data', 'ETL Developer', 'Data Engineer II (00049724)'])
    assert.ok(isFamilyTitle(t, FAMILY), t);
  for (const t of ['Software Engineer', 'Manager, Data Engineering', 'Senior Data Scientist', 'Data Integration Analyst', 'Principal Data Architect'])
    assert.ok(!isFamilyTitle(t, FAMILY), t);
});

// ── unit: tier rule (never invents p for missing data) ──────────────────────
test('sponsorship tiers follow the rule; empty H-1B fields are missing, not zero', () => {
  const rows = parseCsv(fs.readFileSync(FX('sponsors-fixture.csv'), 'utf8'));
  const ev = (name) => sponsorshipEvidence(rows.find((r) => r.company_name === name), FAMILY, RULES);
  assert.equal(ev('ACME DATA INC').tier, 'Proven');
  assert.equal(ev('ACME DATA INC').p, 0.9);
  assert.equal(ev('SMALLCO LLC').tier, 'Likely');
  assert.equal(ev('BIGSPONSOR CORP').tier, 'Possible');
  assert.equal(ev('MANAGERONLY INC').tier, 'Possible', 'a manager-only title must not count as Data Engineer evidence');
  const empty = ev('EMPTYCO INC');
  assert.equal(empty.status, 'missing');
  assert.equal(empty.reason, 'no-h1b-record');
  assert.equal(empty.p, undefined);
  assert.equal(ev('ACME DATA INC').evidence.total_approvals.source, 'record');
  assert.equal(ev('ACME DATA INC').p_source, 'model-judgment');
});

// ── unit: timeline gate (F5) ────────────────────────────────────────────────
test('timeline: cannot start before OPT; closes after the practical deadline', () => {
  const vt = PERSONA.visa_timeline; // OPT 2027-03-01, 90 days, 10 buffer, 45 lag
  const early = timelineFactor(vt, parseDate('2026-10-03'), RULES);
  assert.equal(early.detail.earliest_start, '2027-03-01');
  assert.equal(early.detail.practical_deadline, '2027-05-20');
  assert.equal(early.factor, 1);
  const tight = timelineFactor(vt, parseDate('2027-03-31'), RULES); // 2027-05-15 → 5 days slack
  assert.equal(tight.detail.slack_days, 5);
  assert.equal(tight.factor, 0.5);
  const late = timelineFactor(vt, parseDate('2027-04-10'), RULES); // 2027-05-25 > 2027-05-20
  assert.equal(late.factor, 0);
  assert.equal(timelineFactor({ ...vt, opt_start: 'soon' }, parseDate('2026-10-03'), RULES).status, 'missing');
});

// ── unit: liveness evidence (F4, F7) ────────────────────────────────────────
test('liveness: reads ats:liveness output, flags stale checks, refuses missing evidence', () => {
  const live = parseLivenessLog(fs.readFileSync(FX('liveness-fixture.txt'), 'utf8'));
  assert.equal(live.checked, '2026-10-01');
  assert.equal(livenessFactor('https://jobs.example.com/acme/1', live, parseDate('2026-10-03'), RULES).factor, 1);
  assert.equal(livenessFactor('https://jobs.example.com/ghosthire/1', live, parseDate('2026-10-03'), RULES).factor, 0);
  const stale = livenessFactor('https://jobs.example.com/acme/1', live, parseDate('2026-10-20'), RULES);
  assert.equal(stale.detail.stale, true);
  assert.equal(stale.factor, 0);
  assert.equal(livenessFactor('https://jobs.example.com/nope', live, parseDate('2026-10-03'), RULES).reason, 'url-not-in-liveness-log');
  assert.equal(livenessFactor('https://jobs.example.com/acme/1', parseLivenessLog('✅ active https://jobs.example.com/acme/1'), parseDate('2026-10-03'), RULES).reason, 'liveness-log-has-no-checked-date');
  assert.match(livenessFactor('https://jobs.example.com/acme/1', live, parseDate('2026-10-03'), RULES).human_check, /general careers page/);
});

test('G0 rejects a row without a fit rating and reason', () => {
  assert.deepEqual(validateCandidate({ role_id: 'x', company: 'c', title: 't', url: 'u' }), ['fit.p must be a number in [0,1]', 'fit.reason missing']);
});

// ── integration: full path through the real scorer ──────────────────────────
test('full run on fixtures: every named failure case is reported, nothing defaulted', () => {
  const r = runTriage([]);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.log.status, 'complete');
  assert.equal(r.log.inputs.scorer.path, 'scripts/score/role-scorer.mjs');
  const reason = (id) => r.role(id).reason;
  assert.equal(reason('notreal-de'), 'not-in-csv');                       // F1
  assert.equal(reason('emptyco-de'), 'no-h1b-record');                    // F2
  assert.equal(r.role('bigsponsor-de').sponsorship.tier, 'Possible');     // F3
  assert.equal(reason('acme-variant-de'), 'not-in-csv');                  // F6 (false negative, by design)
  assert.equal(reason('nolive-de'), 'url-not-in-liveness-log');           // F7
  assert.equal(reason('twin-de'), 'ambiguous-match');
  assert.equal(reason('acme-mgr'), 'posting-not-data-engineer-family');
  assert.equal(reason('bad-row'), 'invalid-input-row');
  // the gate is a gate: expired posting → Skip, and flagged as a networking target
  assert.equal(r.role('ghosthire-de').scorer.recommendation, 'Skip');
  assert.equal(r.role('ghosthire-de').network_target, true);
  // every role handed to the scorer carries both gate factors and source labels
  const roles = JSON.parse(fs.readFileSync(path.join(r.out, 'roles.json'), 'utf8'));
  for (const role of roles) {
    assert.equal(typeof role.liveness.factor, 'number');
    assert.equal(typeof role.timeline.factor, 'number');
    for (const k of ['sponsorship', 'fit', 'liveness', 'timeline']) assert.ok(role[k].source, `${role.role_id}.${k} has no source label`);
  }
  assert.ok(!roles.some((x) => ['notreal-de', 'emptyco-de', 'nolive-de'].includes(x.role_id)), 'unscored rows must never reach the scorer');
  // two artifacts, two readers
  const md = fs.readFileSync(path.join(r.out, 'triage-report.md'), 'utf8');
  assert.match(md, /^# .*\n\n## Executive summary/);
  assert.match(md, /`record`/);
  assert.match(md, /`model-judgment`/);
  assert.match(md, /`your-input`/);
});

test('F5: after the OPT deadline every scored role is Skip (timeline gate closed)', () => {
  const r = runTriage([], '2027-06-01');
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.log.timeline_gate.factor, 0);
  const scored = r.log.roles.filter((x) => x.scorer);
  assert.ok(scored.length > 0);
  for (const x of scored) assert.equal(x.scorer.recommendation, 'Skip', x.role_id);
});

// ── break attempts ──────────────────────────────────────────────────────────
test('break: a scorer that ignores the gates is caught (exit 3)', () => {
  const r = runTriage(['--scorer', FX('BROKEN-apply-everything-scorer.mjs')]);
  assert.equal(r.status, 3);
  assert.match(r.stderr, /gate-invariant/);
  assert.equal(r.log.status, 'FAILED-gate-invariant');
  assert.ok(r.log.gate_invariant_violations.some((v) => v.startsWith('ghosthire-de')));
});

test('break: refuses to write outside its own folders', () => {
  const res = spawnSync(process.execPath, [path.join(HERE, 'triage.mjs'), '--out-dir', path.resolve(HERE, '../../../../data/examples')], { encoding: 'utf8' });
  assert.equal(res.status, 2);
  assert.match(res.stderr, /outside this contribution's folders/);
});

test('break: a missing sponsor CSV stops the run without inventing anything', () => {
  const r = runTriage(['--csv', FX('does-not-exist.csv')]);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /STOP: sponsor CSV not found/);
  assert.equal(r.log, null, 'no log may be written when inputs are missing');
});
