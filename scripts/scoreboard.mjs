#!/usr/bin/env node
// Read-only scoreboard: what is already connected, what still needs a sign-in,
// what is not added yet. Reads `claude mcp list`, `claude plugin list --json`,
// PATH, skill folders and this kit's .env. Changes nothing. Never prints a key,
// a URL, a command line or any .env value: only names, statuses, filled/empty.
//
//   node scripts/scoreboard.mjs              all tools in this kit
//   node scripts/scoreboard.mjs higgsfield   just these tools
//   node scripts/scoreboard.mjs --json       machine-readable (same rules)
//
// Exit 0 when the scoreboard ran (whatever it found). Exit 1 only if it crashed.
import fs from 'node:fs';
import {
  KIT_NAME, TOOLS, ENV_FILE, loadEnv, toolKeys, findClaude, which,
  readMcpList, readPlugins, skillInstalled, matchServer,
} from './lib.mjs';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const wanted = args.filter((a) => !a.startsWith('--'));
const unknown = wanted.filter((n) => !TOOLS[n]);
if (unknown.length) {
  console.log(`Unknown tool(s): ${unknown.join(', ')}. Known: ${Object.keys(TOOLS).join(', ')}`);
  process.exit(0);
}
const names = wanted.length ? wanted : Object.keys(TOOLS);

const claude = findClaude();
const needServers = names.some((n) => ['oauth', 'http-key', 'stdio', 'stdio-key', 'directory'].includes(TOOLS[n].kind));
const needPlugins = names.some((n) => TOOLS[n].kind === 'plugin');
const mcp = needServers ? readMcpList(claude) : { ok: true, servers: [] };
const plugins = needPlugins ? readPlugins(claude) : { ok: true, plugins: [] };
const env = loadEnv();
const envExists = fs.existsSync(ENV_FILE);

const rows = [];
for (const n of names) {
  const t = TOOLS[n];
  const row = { tool: n, label: t.label, kind: t.kind, state: 'not-added', detail: '' };

  if (['oauth', 'http-key', 'stdio', 'stdio-key', 'directory'].includes(t.kind)) {
    if (!mcp.ok) { row.state = 'unknown'; row.detail = mcp.reason === 'NO_CLAUDE_CLI' ? 'no claude command found, use the app\'s connector screen to check' : 'could not read the server list'; }
    else {
      const hit = matchServer(t, mcp.servers);
      if (hit) { row.state = hit.status; row.detail = `as "${hit.name}"`; }
    }
  } else if (t.kind === 'plugin') {
    if (!plugins.ok) { row.state = 'unknown'; row.detail = 'could not read the plugin list'; }
    else {
      const hit = plugins.plugins.find((p) => p.id === t.plugin.id || p.id.split('@')[0] === t.plugin.id.split('@')[0]);
      if (hit) { row.state = hit.enabled ? 'connected' : 'disabled'; row.detail = `plugin ${hit.id}`; }
      else if (t.skills && t.skills.every((s) => skillInstalled(s))) { row.state = 'connected'; row.detail = 'skills installed another way (not as a plugin)'; }
    }
  } else if (t.kind === 'cli') {
    const bin = (t.bins || [t.bin]).map((b) => which(b)).find(Boolean);
    if (bin) { row.state = 'connected'; row.detail = "installed; sign-in is checked by one read-only call"; }
  } else if (t.kind === 'skills') {
    const have = t.skills.filter((s) => skillInstalled(s));
    if (have.length === t.skills.length) row.state = 'connected';
    else if (have.length) row.state = 'partial';
    row.detail = `${have.length} of ${t.skills.length} skills found`;
  }

  const keys = toolKeys(n);
  if (keys.length) {
    row.env = keys.map((k) => ({ key: k.name, optional: !!k.optional || (t.optionalKeys || []).includes(k), filled: !!env[k.name] }));
  }
  rows.push(row);
}

if (asJson) {
  console.log(JSON.stringify({ kit: KIT_NAME, claudeFound: !!claude, envFile: envExists, rows }, null, 2));
  process.exit(0);
}

const ICON = { connected: 'OK  ', 'needs-sign-in': 'SIGN', failed: 'FAIL', 'not-added': '--  ', unknown: '??  ', partial: 'PART', disabled: 'OFF ' };
const WORD = {
  connected: 'connected',
  'needs-sign-in': 'added, needs sign-in',
  failed: 'added, not responding',
  'not-added': 'not added yet',
  unknown: 'could not check',
  partial: 'partly installed',
  disabled: 'installed but turned off',
};
console.log(`${KIT_NAME} scoreboard (read-only, no values shown)`);
if (!claude) console.log('Note: no `claude` command found on this computer. Server rows marked ?? are best checked in the app: + > Connectors.');
for (const r of rows) {
  let line = `  ${ICON[r.state] || '??  '} ${r.label.padEnd(32)} ${WORD[r.state] || r.state}`;
  if (r.detail) line += `  (${r.detail})`;
  console.log(line);
  for (const e of r.env || []) {
    console.log(`         .env ${e.key}: ${e.filled ? 'filled' : 'empty'}${e.optional ? ' (optional)' : ''}`);
  }
}
console.log('Claude.ai connectors you added in the app also count. They show up here as "claude.ai <Name>".');
process.exit(0);
