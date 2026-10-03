#!/usr/bin/env node
// fetch-greenhouse-status.mjs — the ONE network step of the data-engineer-h1b
// recipe (an ingest script, SNICKERDOODLE P2). For every Greenhouse job link in
// the candidates file(s), asks the public job-board API whether that job ID
// still exists, and saves the raw answers to a dated JSON file that sponsor-screen.mjs
// reads offline. Allowed host: boards-api.greenhouse.io — nothing else.
//
//   node scripts/contrib/2026fa/ethangomes14-data-engineer-h1b/fetch-greenhouse-status.mjs \
//     --candidates <json> [--candidates <json> ...] [--out <json>]
//
// Default --candidates: samples/candidates-2026-10-03.json
// Default --out:        samples/greenhouse-status-<today>.json
// Links that aren't Greenhouse (or whose board can't be determined) are listed
// as skipped with a reason — never guessed.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GREENHOUSE_API_HOST, parseGreenhouseUrl, apiVerdict } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DELAY_MS = 500; // polite: one request at a time, half a second apart

function stop(msg) { console.error(`STOP: ${msg}`); process.exit(2); }

const args = process.argv.slice(2);
const candFiles = [];
let out = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--candidates') candFiles.push(path.resolve(args[++i] ?? stop('--candidates needs a value')));
  else if (args[i] === '--out') out = path.resolve(args[++i] ?? stop('--out needs a value'));
  else stop(`unknown argument ${args[i]}`);
}
if (!candFiles.length) candFiles.push(path.join(HERE, 'samples/candidates-2026-10-03.json'));
const today = new Date().toISOString().slice(0, 10);
out ??= path.join(HERE, `samples/greenhouse-status-${today}.json`);

const within = (p, base) => p === base || p.startsWith(base + path.sep);
const realTmp = fs.realpathSync(os.tmpdir());
if (!within(out, HERE) && !within(out, realTmp) && !within(out, os.tmpdir()) && !within(out, '/tmp') && !within(out, '/private/tmp')) {
  stop(`--out must be inside ${path.relative(process.cwd(), HERE)} or a temp dir`);
}

const rows = [];
for (const f of candFiles) {
  if (!fs.existsSync(f)) stop(`candidates file not found: ${f}`);
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const c of Array.isArray(j) ? j : j.candidates || []) rows.push({ url: c.url, board_hint: c.greenhouse_board ?? null, role_id: c.role_id ?? null });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const skipped = [];
for (const row of rows) {
  const p = parseGreenhouseUrl(row.url, row.board_hint);
  if (!p) { skipped.push({ url: row.url, role_id: row.role_id, reason: 'not a Greenhouse link, or no board name available' }); continue; }
  const api = `https://${GREENHOUSE_API_HOST}/v1/boards/${encodeURIComponent(p.board)}/jobs/${encodeURIComponent(p.jobId)}`;
  if (new URL(api).hostname !== GREENHOUSE_API_HOST) stop('refusing a non-allow-listed host');
  let http_status = null; let error = null;
  try {
    const res = await fetch(api, { redirect: 'manual', headers: { accept: 'application/json' } });
    http_status = res.status;
  } catch (e) { error = e.message; }
  results.push({ url: row.url, role_id: row.role_id, board: p.board, board_from: p.boardFrom, job_id: p.jobId, api_url: api, http_status, verdict: apiVerdict(http_status), error });
  console.log(`${String(http_status ?? 'ERR').padEnd(4)} ${apiVerdict(http_status).padEnd(8)} ${p.board}/${p.jobId}  ${row.url}`);
  await sleep(DELAY_MS);
}
for (const s of skipped) console.log(`skip ${s.url} (${s.reason})`);

const doc = {
  _about: 'Raw Greenhouse job-board API answers, saved by fetch-greenhouse-status.mjs. 200 = job exists, 404 = job gone, anything else = unknown (never treated as 200).',
  checked: today,
  source: 'record',
  host: GREENHOUSE_API_HOST,
  inputs: candFiles.map((f) => path.relative(process.cwd(), f)),
  results,
  skipped,
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(doc, null, 2) + '\n');
console.log(`\n${results.length} checked · ${skipped.length} skipped → ${path.relative(process.cwd(), out)}`);
