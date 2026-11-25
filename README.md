# Meetings and Notes kit, by Solnest AI

Let Claude read your meeting recordings and notes: Plaud, Wispr Flow, Fireflies, Fathom, Zoom and Loom. Then just ask: "what did we decide on Tuesday's call?", "list everything I promised this week", or "turn yesterday's meeting into three post ideas".

Powers the Solnest AI content-miner, meeting-to-content and wrap-up skills.

## What you need
- The Claude Code desktop app (or Claude Code in a terminal), on Mac or Windows, with a paid Claude plan.
- Node.js 18 or newer. Claude checks and helps you install it. (Python for the updater is found or installed for you.)
- An account on the recorders you use. The kit is free. Plan notes are in each `connectors/` file.

## Set it up in 3 steps
1. **Copy this page's link.**
2. **Paste it into Claude Code and say "set this up".** Claude puts the kit in its own folder on your computer (`solnest/meetings-and-notes-kit` in your home folder), checks what you already have, asks which tools you use, and connects them one at a time. Or name them: "connect Plaud and Fathom".
3. **Try your first question.** Claude tests every connection with a safe, read-only question ("list my 5 most recent meetings") and tells you exactly what worked. Then try: "what did we decide on my last call?"

Later: open the `solnest/meetings-and-notes-kit` folder in Claude Code and say "check my connections" any time, or "remove Fireflies".

## Good to know
- **Updates install themselves.** Once a day, when Claude Code starts, the kit quietly moves to the newest release. You never have to ask.
- **An update never wipes your own things.** Your connections and any change you asked Claude to make to how this kit works stay exactly as they are.
- **Want it to work differently?** Just tell Claude ("always start with Plaud"). It remembers.

## Tools in this kit

| Tool | Made by | How you connect | Notes |
|---|---|---|---|
| Plaud | Official (Plaud) | Browser sign-in | Your recordings pass through Plaud's US-hosted server |
| Wispr Flow | Official (Wispr) | Browser sign-in | Read-only: reads your meeting notes |
| Fireflies | Official (Fireflies) | Browser sign-in | |
| Fathom | Official (Fathom) | Browser sign-in | Team plans: an owner turns the connector on first |
| Zoom | Official (Zoom for Claude) | Browser sign-in, from the app's connector list | Desktop app or claude.ai |
| Loom | Official through Atlassian | Browser sign-in | Your Loom workspace must be linked to an Atlassian site |

## Safe by default
- **No keys at all.** Every tool is an official browser sign-in. Nothing secret ever goes in the chat or in a file.
- **Read-only first.** Your meetings are private. Claude only reads and summarizes unless you say otherwise. Anything that comments, shares, moves or sends is shown to you first and only happens after your plain "yes".
- **Skips what you already have.** Already connected Fathom or Zoom in the app? Claude leaves it alone.
- **Easy to undo.** Every connector file ends with a one-line removal.

## Support
hello@solnestai.com

Brand: Solnest AI

---

Claude: someone pasted this link and said "set this up". Read [CLAUDE.md](https://raw.githubusercontent.com/Solnest-AI/solnest-meetings-and-notes-kit/main/CLAUDE.md) in this repo and follow its SETUP section, one step per message. You run every command yourself. This kit needs no keys: never ask for one in the chat.
