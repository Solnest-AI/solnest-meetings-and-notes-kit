If the user said 'set this up', follow SETUP below.
If the user said "connect <tool>" (one or more tools), run SETUP steps 2, 4 and 5 for just those tools.
If the user said "check my connections" (or "verify my connections"), run CHECK.
If the user said "remove <tool>" or "disconnect <tool>", run REMOVE.
If the user said "update the meetings and notes kit", run UPDATE.

# Meetings and Notes kit: Claude's runbook

Connects Claude Code to the meeting recorders and note tools the Solnest AI content-miner, meeting-to-content and wrap-up skills read from: Plaud, Wispr Flow, Fireflies, Fathom, Zoom and Loom.

`KIT` means the kit's permanent home on this computer: `~/solnest/meetings-and-notes-kit` (the same path works on Mac and in Windows Git Bash). SETUP step 2 puts the kit there. `cd ~/solnest/meetings-and-notes-kit` before every script. Use your Bash tool; on Windows it is Git Bash, and every command here works there unchanged (the scripts are Node). You run every command. The user never opens a terminal.

## Your own changes (read first, every time)

Before anything else, read `~/.solnest/meetings-and-notes-kit/my-instructions.md` if it exists and
follow it. It holds this user's own changes to how this tool works, and it wins over the
defaults in this file.

When the user asks to change how this tool works for them (wording, tone, topics, steps,
defaults, what to include or leave out), write the change into that file in plain words,
create it if needed, and read it back to them. **Never edit this tool's own files for
that.** This tool updates itself automatically and replaces its own files, so a change
made there is lost on the next update. Their connections in Claude Code, any `.env` file
and any file they added to the kit folder are never touched by an update either.

## Hard rules
1. **Never ask for a key, password or cookie in the chat.** This kit needs none: every tool is a browser sign-in. If someone pastes one anyway, do not repeat it and tell them to change it at the vendor. No lecture.
2. Never print `~/.claude.json`, never run `claude mcp get` yourself, never show raw `claude mcp list` output. Use `node scripts/scoreboard.mjs` (names and statuses only).
3. **Read-only by default.** Meeting data is private. Reading and summarizing is fine. Anything that changes something (comments, renames, moves, deletes, shares, sends a follow-up email) needs a plain "yes" after you show exactly what will happen. One yes can cover a batch shown together. No typed codes.
4. **Skip what already works.** Connected in the app (`claude.ai Fathom`, `claude.ai Zoom for Claude`...) or from an earlier kit: say "already connected", do not add a second copy. "Needs sign-in" means finish that sign-in, not add another.
5. Official connectors only. Never offer or install a community or cookie-based server, for Loom or anything else.
6. Only use the install method in the connector file. Never invent a server URL (Zoom has no verified terminal URL on purpose).
7. Never edit `~/.claude.json` by hand. Never commit, push or publish this folder.
8. Plain, friendly sentences. One step per message. No em-dash characters.

## Tool list
| Say | Connector file | Type |
|---|---|---|
| Plaud | connectors/plaud.md | sign-in (official) |
| Wispr Flow | connectors/wispr-flow.md | sign-in (official, read-only) |
| Fireflies | connectors/fireflies.md | sign-in (official) |
| Fathom | connectors/fathom.md | sign-in (official) |
| Zoom | connectors/zoom.md | sign-in from the app's connector directory only (official) |
| Loom | connectors/loom.md | sign-in (official, through Atlassian) |

Shared sign-in steps: `connectors/_how-sign-in-works.md`.

# SETUP

## 1. Say hello (its own message, before any command)
> Hey, welcome to the Meetings and Notes kit from the Solnest AI Skool community. This lets Claude read your meeting recordings and notes, so you can say "what did we decide on that call?" or "turn yesterday's meeting into content" and it just knows.
>
> I check what's already connected, you tell me which recorders you use, and I connect each one and test it with a safe, read-only question. Almost all of these are a browser sign-in, no keys. Claude only reads your meetings unless you say otherwise.
>
> Let me look at this computer.

Re-run: "Welcome back. Let me check where things stand."

## 2. Install the kit and check the computer (once)
Run one of these:

- You are reading this from the GitHub page (no local copy of this repo):

  ```bash
  bash -o pipefail -c "curl -fsSL https://raw.githubusercontent.com/Solnest-AI/solnest-meetings-and-notes-kit/main/install.sh | bash"
  ```

- You already have this repo as a folder on this computer: `bash "<that folder>/install.sh"`

The installer copies the kit to `~/solnest/meetings-and-notes-kit`, finds Python 3.9 or newer for the updater (or installs one for this user, no admin rights needed), writes a small launcher (`bin/py`), checks Node.js and proves the kit scripts start. It connects nothing and asks for nothing. Running it again is safe: it keeps every file the member added.

Read the checklist it printed:
- Every line starts with `[ok]`: go on.
- `[!!] Node.js`: Node 18 or newer runs the kit scripts and Fathom's terminal line. Mac: `brew install node` if Homebrew exists, else nodejs.org (LTS). Windows: `winget install OpenJS.NodeJS.LTS`. Then a full restart of Claude Code and "set this up" again.
- `STOP: ...`: something else already lives at `~/solnest/meetings-and-notes-kit`. Nothing was changed. Tell the member what you found and ask what they want to do with it. Do not delete it yourself.
- `ERROR: could not download`: usually the network. Run it once more.
- `ERROR: no working Python`: send them to https://www.python.org/downloads/ (on Windows they must tick "Add python.exe to PATH"). When they say it is installed, run it again.
- Any other `[!!]` line: run it once more. If it repeats, send the full output to hello@solnestai.com.

From here on every command runs in the installed kit, never in the copy you downloaded:
```bash
cd ~/solnest/meetings-and-notes-kit
uname -s
node scripts/register.mjs --find-claude
```
- The copy you downloaded is not needed any more. Leave it, or delete it after a plain yes. Same for an older copy of this kit in another folder: the connections it made live in Claude Code, not in that folder, so they keep working.
- Desktop app (you have `session_connectors_status`): Path A, and for Plaud, Fathom, Zoom and Wispr Flow the connector directory (+ > Connectors > Browse connectors) is the easiest. Otherwise Path B.
- `NO_CLAUDE_CLI`: Path A only. Zoom works either way in the app; it has no terminal path.

## 3. Scoreboard, then ask which tools
```bash
node scripts/scoreboard.mjs
```
(Up to a minute.) In the desktop app also check `session_connectors_status`. Say what is already connected and leave it alone. Then ask which recorders and note tools they actually use. Most people use one or two. Take everything they say in one answer.

For Loom, ask one thing: "Is your Loom workspace linked to an Atlassian site (do you use Jira or Confluence with it)?" Yes or not sure: connect it. No: walk them through linking it first, as `connectors/loom.md` says, then connect.

## 4. Connect each chosen tool, one at a time
Open its connector file, read it fully, tell them any plan or admin note, follow its **Connect** section.
- **Sign-in tools:** Path A (directory search or custom connector with the exact name and URL), or Path B `node scripts/register.mjs <tool>` then `/mcp` > pick it > Authenticate. Wait for "connected".
- **Fathom terminal path:** `node scripts/register.mjs fathom`; the sign-in window opens the first time it starts after the restart.
- **Zoom:** directory only.

**Batch the restarts:** connect everything, then one restart at the end: fully quit Claude Code (the app, not the window), reopen, open the kit folder, say "check my connections". Give them the full path to pick: run `cd ~/solnest/meetings-and-notes-kit && (pwd -W 2>/dev/null || pwd)` and read it out. Sign-in connectors sometimes only appear in a new chat.

## 5. Verify, one read-only call each
Run CHECK. A tool only counts as working after its read-only call returned real meetings or recordings.

## 6. Turn on automatic updates (required, silent)
Run this exactly:
```bash
KIT="$HOME/solnest/meetings-and-notes-kit"; "$KIT/bin/py" "$KIT/scripts/solnest_autoupdate.py" register --name meetings-and-notes-kit --folder "$KIT" --update '{python} scripts/update.py' --after '{python} scripts/update.py --after' --undo '{python} scripts/update.py --undo'
```
From now on the kit keeps itself on the latest release with no one asking: once a day, in the background when Claude Code starts, it installs the newest published release and checks that the new files load. It never touches anything connected in Claude Code, any `.env` file, or any file the member added, and if a new release fails that check it puts the old version back by itself. Relay the one line it prints. Nothing else to tell them. Do this step even if some tools are still waiting on a sign-in: it does not depend on them.

## 7. Final scoreboard and done message
`node scripts/scoreboard.mjs`, then one short message: one line per working tool with what its test returned ("Plaud: connected, last recording was Tuesday's client call"), anything still waiting with the single next step, one example prompt per working tool from its "Try these" list, "Open the `solnest/meetings-and-notes-kit` folder in Claude Code and say 'check my connections' any time. The kit keeps itself up to date.", and "Questions, or something looks off? Email hello@solnestai.com".

# CHECK
1. `node scripts/scoreboard.mjs` (and `session_connectors_status` in the app). A server `failed` right after a restart: `reconnect_session_connector` once, check again.
2. For each connected tool, the ONE read-only call from its **Verify** section ("list my 5 most recent ..."). Never comment, rename, share or send to test.
3. Not in your tool list yet: sign-in tools may need a new chat; local servers need a full restart.
4. One line per tool. Auth error: redo the sign-in.

# REMOVE
Follow the **Remove** section of that tool's file. Path B and local servers: `node scripts/register.mjs <tool> --remove`. App connectors: + > Connectors > Manage connectors > remove. Tell them where to revoke access at the vendor.

# UPDATE
Updates install themselves (SETUP step 6). Connections, any `.env` file and any file the member added are never touched, and nothing needs connecting again after an update. Changes the member asked for live in `~/.solnest/meetings-and-notes-kit/my-instructions.md`, outside the kit folder, so they survive every update.

Only when the member asks to update now:
```bash
KIT="$HOME/solnest/meetings-and-notes-kit"; "$KIT/bin/py" "$KIT/scripts/update.py" && "$KIT/bin/py" "$KIT/scripts/update.py" --after
```
Relay what it prints in plain words. Then run the SETUP step 6 line once more, so a newer auto-updater is picked up. To go back one version: `"$HOME/solnest/meetings-and-notes-kit/bin/py" "$HOME/solnest/meetings-and-notes-kit/scripts/update.py" --undo`. If `scripts/update.py` or `bin/py` is missing (a copy from before automatic updates, or a copy in another folder), run SETUP step 2 instead, then step 6.

"Is it updating itself?": `~/solnest/meetings-and-notes-kit/bin/py ~/.solnest/autoupdate.py status`. Use `pause` in place of `status` to stop all automatic updates, and `resume` to turn them back on. If `status` shows the last check failed, offer to update now with the line above.

# REPAIR
Run the installer again (SETUP step 2), then SETUP step 6, then the scoreboard. It keeps every file the member added, and the connections in Claude Code are not touched.

# UNINSTALL
Ask whether they also want the connections removed. If yes, run REMOVE for each one. Then:
```bash
~/solnest/meetings-and-notes-kit/bin/py ~/.solnest/autoupdate.py remove --name meetings-and-notes-kit
```
Then, after a plain yes from the member, delete the folder `~/solnest/meetings-and-notes-kit`.

# Troubleshooting
- `ALREADY_ADDED`: that name exists. Scoreboard: works, leave it; broken, `--remove` then add again.
- Loom connects but shows no videos: the workspace is not linked to the Atlassian site they picked. Remove, link it in Loom, connect again.
- Sign-in page errors about "redirect" or "client": remove it and add it the other way (app Connectors screen vs `register.mjs`).
- Auto mode blocks a kit command with "cannot determine the safety": switch the session to Manual (`set_session_permission_mode`, mode `default`) if you have that tool, tell them they will click Allow from now on, and re-run. Do not retry blindly.
