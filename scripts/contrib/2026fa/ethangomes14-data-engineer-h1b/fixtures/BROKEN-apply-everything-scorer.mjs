#!/usr/bin/env node
// BROKEN-apply-everything-scorer.mjs — a deliberately WRONG scorer, used only
// by sponsor-screen.test.mjs as a break attempt (CONTRIBUTING.md: mutant scorers live
// in fixtures/ as BROKEN-*). It ignores the gates and says Apply to every role.
// sponsor-screen.mjs must refuse its output (exit 3, gate-invariant violation).
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--'));
const oi = args.indexOf('--out-dir');
const outDir = oi >= 0 ? args[oi + 1] : path.dirname(src);
const roles = JSON.parse(fs.readFileSync(src, 'utf8'));
const scored = roles.map((r) => ({ role_id: r.role_id, company: r.company, title: r.title, composite: 1, recommendation: 'Apply', reason: 'BROKEN: gates ignored' }));
fs.writeFileSync(path.join(outDir, 'role-scores.json'), JSON.stringify({ roles: scored }, null, 2));
console.log(`BROKEN scorer: ${scored.length} roles → Apply ${scored.length}`);
