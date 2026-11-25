#!/usr/bin/env node
// Builds .env with ONLY the lines for the tools the member chose. Values already
// in .env are kept (never overwritten, never printed). Lines for tools they did
// not choose this time are kept at the bottom, never deleted.
//   node scripts/env-make.mjs <tool ...>
import fs from 'node:fs';
import { ENV_FILE, TOOLS, KIT_NAME, loadEnv, toolKeys } from './lib.mjs';

const chosen = process.argv.slice(2);
const unknown = chosen.filter((n) => !TOOLS[n]);
if (unknown.length) { console.error(`Unknown tool(s): ${unknown.join(', ')}`); process.exit(2); }
const old = loadEnv();
const lines = [
  `# ${KIT_NAME}: your keys live ONLY in this file, on your computer.`,
  '# Paste each value right after the = sign. No quotes, no spaces. Save the file.',
  '# Claude never reads these values into the chat and never prints them.',
  '',
];
const written = new Set();
for (const n of chosen) {
  const keys = toolKeys(n);
  if (!keys.length) continue;
  lines.push(`# ${TOOLS[n].label}`);
  for (const k of keys) {
    if (k.help) lines.push(`# ${k.help}${k.optional ? ' (optional)' : ''}`);
    lines.push(`${k.name}=${old[k.name] || ''}`);
    written.add(k.name);
  }
  lines.push('');
}
const leftover = Object.keys(old).filter((k) => !written.has(k));
if (leftover.length) {
  lines.push('# Kept from before (not part of this run)');
  for (const k of leftover) lines.push(`${k}=${old[k]}`);
}
fs.writeFileSync(ENV_FILE, lines.join('\n') + '\n', { mode: 0o600 });
try { fs.chmodSync(ENV_FILE, 0o600); } catch { /* Windows */ }
console.log(`WROTE .env with ${written.size} key line(s)${leftover.length ? `, kept ${leftover.length} older line(s)` : ''}. No values shown.`);
