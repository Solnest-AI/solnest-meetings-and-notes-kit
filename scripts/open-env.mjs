#!/usr/bin/env node
// Opens .env in the computer's text editor so the member can paste keys.
// Create it first with env-make.mjs. Prints no values.
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { ENV_FILE, IS_WIN } from './lib.mjs';

if (!fs.existsSync(ENV_FILE)) {
  console.log('NO_ENV: run node scripts/env-make.mjs <tool ...> first.');
  process.exit(1);
}
let cmd; let args;
if (process.platform === 'darwin') { cmd = 'open'; args = ['-t', ENV_FILE]; }
else if (IS_WIN) { cmd = 'notepad.exe'; args = [ENV_FILE]; }
else { cmd = 'xdg-open'; args = [ENV_FILE]; }
const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
child.on('error', () => console.log(`Could not open an editor. Open this file yourself: ${ENV_FILE}`));
child.unref();
console.log('OPENED .env');
