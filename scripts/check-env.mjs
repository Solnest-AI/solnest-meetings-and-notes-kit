#!/usr/bin/env node
// Says which .env lines are filled or empty. Never prints a value.
//   node scripts/check-env.mjs [tool ...]
import fs from 'node:fs';
import { ENV_FILE, TOOLS, loadEnv, toolKeys } from './lib.mjs';

if (!fs.existsSync(ENV_FILE)) {
  console.log('NO_ENV: .env does not exist yet. Run: node scripts/env-make.mjs <tool ...>');
  process.exit(1);
}
const env = loadEnv();
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(TOOLS).filter((n) => toolKeys(n).length);
let bad = 0;
for (const n of names) {
  if (!TOOLS[n]) { console.log(`?      ${n}: unknown`); bad++; continue; }
  const keys = toolKeys(n);
  if (!keys.length) { console.log(`-      ${n}: no key needed`); continue; }
  for (const k of keys) {
    const opt = k.optional ? ' (optional)' : '';
    if (env[k.name]) console.log(`FILLED ${n}: ${k.name}${opt}`);
    else { console.log(`EMPTY  ${n}: ${k.name}${opt}`); if (!k.optional) bad++; }
  }
}
process.exit(bad ? 1 : 0);
