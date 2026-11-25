#!/usr/bin/env node
// Launcher for key-based local (stdio) servers. Claude Code starts this; it
// reads the kit's .env and starts the real server with the key in that
// server's environment only. Never prints the key.
import { spawn } from 'node:child_process';
import { TOOLS, loadEnv, missingKeys, IS_WIN } from './lib.mjs';

const name = process.argv[2];
const t = TOOLS[name];
if (!t || t.kind !== 'stdio-key') {
  console.error(`run-mcp: unknown local server "${name}"`);
  process.exit(2);
}
const env = loadEnv();
const missing = missingKeys(name, env);
if (missing.length) {
  console.error(`run-mcp: ${missing.join(', ')} empty in the kit's .env`);
  process.exit(1);
}
let cmd = t.launch.command;
let args = t.launch.args;
if (IS_WIN && /^(npx|uvx)$/.test(cmd)) { args = ['/c', cmd, ...args]; cmd = 'cmd'; }
const child = spawn(cmd, args, { stdio: 'inherit', env: { ...process.env, ...t.launch.env(env) } });
child.on('error', (e) => { console.error(`run-mcp: could not start ${t.launch.command} (${e.code}). Is it installed?`); process.exit(1); });
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
child.on('exit', (code, signal) => process.exit(signal ? 1 : code ?? 0));
