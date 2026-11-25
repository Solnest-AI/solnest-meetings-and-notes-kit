#!/usr/bin/env node
// Add (or remove) one tool in Claude Code at USER scope (all projects).
//
//   node scripts/register.mjs <tool> [--with-key] [--dry-run]
//   node scripts/register.mjs <tool> --remove
//   node scripts/register.mjs --find-claude
//
// Keys never go on a command line and never into Claude Code's config. A key
// server is registered as a pointer to a script in this kit that reads .env at
// connect time. Run scripts/scoreboard.mjs first: if a tool is already
// connected (even under another name, or as a claude.ai connector), skip it.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { KIT, TOOLS, loadEnv, missingKeys, findClaude, nodeCommand, IS_WIN, skillInstalled } from './lib.mjs';

const args = process.argv.slice(2);
if (args[0] === '--find-claude') {
  const c = findClaude();
  console.log(c ? 'CLAUDE_CLI found' : 'NO_CLAUDE_CLI');
  process.exit(c ? 0 : 3);
}
const name = args[0];
const flag = (f) => args.includes(f);
const t = TOOLS[name];
if (!t) {
  console.error(`Usage: node scripts/register.mjs <${Object.keys(TOOLS).join('|')}> [--with-key] [--dry-run] [--remove]`);
  process.exit(2);
}
const dry = flag('--dry-run');
const claude = findClaude();
if (!claude && !dry) {
  console.error('NO_CLAUDE_CLI: no `claude` command on this computer. In the desktop app, add sign-in tools under + > Connectors instead (see the connector file).');
  process.exit(3);
}

function run(argv, { quiet = false } = {}) {
  // Shown text never includes header values or keys: none are ever in argv.
  if (dry) { console.log(`DRY RUN: claude ${argv.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`); return 0; }
  const r = spawnSync(claude, argv, { encoding: 'utf8' });
  if (!quiet) {
    if (r.stdout) process.stdout.write(r.stdout.replace(/^File modified:.*$/gm, '').trimEnd() + '\n');
    if (r.stderr) process.stderr.write(r.stderr);
  }
  return r.status ?? 1;
}

function nameTaken() {
  if (dry) return false;
  // Output is captured and thrown away: it can contain secrets.
  return spawnSync(claude, ['mcp', 'get', t.server || name], { encoding: 'utf8' }).status === 0;
}

const server = t.server || name;

if (['directory', 'cli', 'skills'].includes(t.kind)) {
  console.log(`MANUAL ${name}: this one is not added with register.mjs. Follow the Connect section of connectors/${t.file || name + '.md'}.`);
  process.exit(0);
}

if (flag('--remove')) {
  let rc;
  if (t.kind === 'plugin') rc = run(['plugin', 'uninstall', t.plugin.id]);
  else rc = run(['mcp', 'remove', server, '--scope', 'user']);
  console.log(rc === 0 ? `REMOVED ${name}` : `NOT_REMOVED ${name} (maybe it was never added from this kit, or it was added as a claude.ai connector: remove those under + > Connectors)`);
  process.exit(rc === 0 ? 0 : 1);
}

if (t.kind === 'plugin') {
  if (t.skills && t.skills.every((s) => skillInstalled(s)) && !flag('--force')) {
    console.log(`ALREADY_PRESENT ${name}: these skills are already installed another way. Not installing a duplicate copy (use --force to install the plugin anyway).`);
    process.exit(0);
  }
  let rc = run(['plugin', 'marketplace', 'add', t.plugin.marketplace]);
  if (rc !== 0) console.log('Marketplace add reported a problem (it may already be added). Trying the install anyway.');
  rc = run(['plugin', 'install', t.plugin.id]);
  console.log(rc === 0 ? `INSTALLED ${t.plugin.id}` : `FAILED ${t.plugin.id}`);
  process.exit(rc === 0 ? 0 : 1);
}

if (nameTaken()) {
  console.log(`ALREADY_ADDED ${server}: a server with this name already exists. Leaving it alone. Run the scoreboard to see if it works; use --remove first if you really want the kit's version.`);
  process.exit(0);
}

const env = loadEnv();
const node = nodeCommand();
const q = (p) => `"${p}"`;
const useKey = flag('--with-key') && t.keyVariant;
let rc;

if (t.kind === 'oauth' && !useKey) {
  rc = run(['mcp', 'add', '--transport', 'http', server, t.url, '--scope', 'user']);
} else if (t.kind === 'http-key' || useKey) {
  const keys = useKey ? t.keyVariant.keys : (t.keys || []);
  const miss = keys.filter((k) => !env[k.name]).map((k) => k.name);
  if (miss.length && !t.keysOptional) {
    console.error(`MISSING_KEYS: ${miss.join(', ')} empty in .env. Fill, save, run again.`);
    process.exit(5);
  }
  const helper = `${node === 'node' ? 'node' : q(node)} ${q(path.join(KIT, 'scripts', 'mcp-headers.mjs'))} ${name}`;
  rc = run(['mcp', 'add-json', server, JSON.stringify({ type: 'http', url: t.url, headersHelper: helper }), '--scope', 'user']);
} else if (t.kind === 'stdio') {
  let command = t.command;
  if (typeof command === 'function') command = command();
  if (!command) {
    console.error(`NOT_FOUND ${name}: could not find what this server runs. See connectors/${t.file || name + '.md'}.`);
    process.exit(6);
  }
  let cmdArgs = t.args || [];
  // Windows: npx/uvx are .cmd shims, which Claude Code starts through cmd /c.
  if (IS_WIN && /^(npx|uvx)$/.test(command)) { cmdArgs = ['/c', command, ...cmdArgs]; command = 'cmd'; }
  rc = run(['mcp', 'add-json', server, JSON.stringify({ type: 'stdio', command, args: cmdArgs }), '--scope', 'user']);
} else if (t.kind === 'stdio-key') {
  const miss = missingKeys(name, env);
  if (miss.length) {
    console.error(`MISSING_KEYS: ${miss.join(', ')} empty in .env. Fill, save, run again.`);
    process.exit(5);
  }
  rc = run(['mcp', 'add-json', server, JSON.stringify({
    type: 'stdio', command: node, args: [path.join(KIT, 'scripts', 'run-mcp.mjs'), name],
  }), '--scope', 'user']);
}
console.log(dry ? `DRY RUN ${server}: nothing changed` : rc === 0 ? `REGISTERED ${server}` : `FAILED ${server}`);
process.exit(rc === 0 ? 0 : 1);
