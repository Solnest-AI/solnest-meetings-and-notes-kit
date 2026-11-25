// Shared helpers for Solnest AI MCP kits.
// Rule: nothing in this folder ever prints a key, token, cookie, URL query or
// server command line. Only names, "filled" / "empty", and connection status.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { KIT_NAME, TOOLS } from './servers.mjs';

export { KIT_NAME, TOOLS };
export const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ENV_FILE = path.join(KIT, '.env');
export const IS_WIN = process.platform === 'win32';

// ---------------------------------------------------------------- .env
export function loadEnv() {
  const out = {};
  if (!fs.existsSync(ENV_FILE)) return out;
  for (const raw of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

// Keys a tool cannot run without (optional keys are never "missing").
export function missingKeys(name, env = loadEnv()) {
  const t = TOOLS[name];
  return (t.keys || []).map((k) => k.name).filter((k) => !env[k]);
}

export function toolKeys(name) {
  const t = TOOLS[name];
  return [...(t.keys || []), ...(t.optionalKeys || [])];
}

// ---------------------------------------------------------------- finding binaries
function versionKey(dir) {
  return path.basename(dir).split('.').map((n) => n.padStart(6, '0')).join('.');
}

function newestBundled(base, exe) {
  try {
    const dirs = fs.readdirSync(base).map((d) => path.join(base, d))
      .filter((d) => fs.existsSync(path.join(d, exe)))
      .sort((a, b) => (versionKey(a) < versionKey(b) ? 1 : -1));
    return dirs.length ? path.join(dirs[0], exe) : null;
  } catch { return null; }
}

export function which(cmd) {
  const probe = spawnSync(IS_WIN ? 'where' : 'which', [cmd], { encoding: 'utf8' });
  if (probe.status === 0 && probe.stdout.trim()) return probe.stdout.trim().split(/\r?\n/)[0];
  return null;
}

// Find a `claude` binary: PATH first, then the copy the desktop app ships with.
export function findClaude() {
  if (process.env.KIT_CLAUDE_BIN && fs.existsSync(process.env.KIT_CLAUDE_BIN)) return process.env.KIT_CLAUDE_BIN;
  const onPath = which('claude');
  if (onPath) return onPath;
  const home = os.homedir();
  const candidates = [];
  if (process.platform === 'darwin') {
    candidates.push(newestBundled(path.join(home, 'Library', 'Application Support', 'Claude', 'claude-code'), 'claude'));
  }
  if (IS_WIN) {
    const appdata = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
    const local = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
    candidates.push(newestBundled(path.join(appdata, 'Claude', 'claude-code'), 'claude.exe'));
    try {
      for (const pkg of fs.readdirSync(path.join(local, 'Packages')).filter((d) => d.startsWith('Claude'))) {
        candidates.push(newestBundled(path.join(local, 'Packages', pkg, 'LocalCache', 'Roaming', 'Claude', 'claude-code'), 'claude.exe'));
      }
    } catch { /* no Packages dir */ }
    candidates.push(path.join(home, '.local', 'bin', 'claude.exe'));
  } else {
    candidates.push(path.join(home, '.local', 'bin', 'claude'));
  }
  return candidates.find((c) => c && fs.existsSync(c)) || null;
}

export function nodeCommand() {
  return which('node') ? 'node' : process.execPath;
}

// ---------------------------------------------------------------- reading Claude Code state
// Parses `claude mcp list`. Each server line looks like
//   "<name>: <url or command> - <status>"
// We keep ONLY the name and the status. The middle part (URL / command line)
// is thrown away on purpose: it can contain keys, so it is never stored or printed.
export function readMcpList(claude = findClaude()) {
  if (!claude) return { ok: false, reason: 'NO_CLAUDE_CLI', servers: [] };
  const r = spawnSync(claude, ['mcp', 'list'], { encoding: 'utf8', timeout: 240000 });
  if (r.error || r.status !== 0) return { ok: false, reason: 'MCP_LIST_FAILED', servers: [] };
  const servers = [];
  for (const raw of (r.stdout || '').split(/\r?\n/)) {
    const line = raw.trim();
    const colon = line.indexOf(': ');
    const dash = line.lastIndexOf(' - ');
    if (colon < 1 || dash < colon) continue;
    const name = line.slice(0, colon).trim();
    const statusText = line.slice(dash + 3).trim();
    let status = 'unknown';
    if (/connected/i.test(statusText) && !/not connected|disconnected/i.test(statusText)) status = 'connected';
    else if (/auth/i.test(statusText)) status = 'needs-sign-in';
    else if (/fail|error|✗|✘/i.test(statusText)) status = 'failed';
    servers.push({ name, status });
  }
  return { ok: true, servers };
}

export function readPlugins(claude = findClaude()) {
  if (!claude) return { ok: false, plugins: [] };
  const r = spawnSync(claude, ['plugin', 'list', '--json'], { encoding: 'utf8', timeout: 60000 });
  if (r.error || r.status !== 0) return { ok: false, plugins: [] };
  try {
    const list = JSON.parse(r.stdout);
    return { ok: true, plugins: list.map((p) => ({ id: p.id, enabled: p.enabled !== false })) };
  } catch { return { ok: false, plugins: [] }; }
}

// A skill counts as installed if its folder (with SKILL.md) sits in any of the
// places Claude Code or the `skills` installer put skills.
export function skillInstalled(skill) {
  const home = os.homedir();
  const roots = [path.join(home, '.claude', 'skills'), path.join(home, '.agents', 'skills')];
  if (roots.some((r) => fs.existsSync(path.join(r, skill, 'SKILL.md')))) return true;
  // Plugin installs keep skills under ~/.claude/plugins/cache/<market>/<plugin>/<ver>/...
  const cache = path.join(home, '.claude', 'plugins', 'cache');
  try {
    const stack = [[cache, 0]];
    while (stack.length) {
      const [dir, depth] = stack.pop();
      if (depth > 6) continue;
      for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!d.isDirectory()) continue;
        const p = path.join(dir, d.name);
        if (d.name === skill && fs.existsSync(path.join(p, 'SKILL.md'))) return true;
        stack.push([p, depth + 1]);
      }
    }
  } catch { /* no cache */ }
  return false;
}

export function matchServer(tool, servers) {
  // If the same tool is added twice (say a claude.ai connector and a local
  // server), report the best one: connected beats needs-sign-in beats failed.
  const pats = tool.match || [];
  const hits = servers.filter((s) => pats.some((re) => re.test(s.name)));
  const rank = { connected: 0, 'needs-sign-in': 1, unknown: 2, failed: 3 };
  hits.sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9));
  return hits[0] || null;
}
