# Fathom

**Status:** official (Fathom's connector in Claude's directory, backed by Fathom's MCP server). Browser sign-in, no key.
**Server name:** `fathom`. Desktop app: the **Fathom** connector in the directory. Terminal: Fathom's own line, `claude mcp add fathom -- npx mcp-remote@latest https://api.fathom.ai/mcp`.
**Verified:** developers.fathom.ai/mcp-docs/claude ("Fathom is available as an official connector in Claude", plus the Claude Code line above), read 2026-11-04. `https://api.fathom.ai/mcp` answered 401 with OAuth metadata on 2026-11-04. npm `mcp-remote` exists (0.16.0).

## What it lets Claude do
Ask questions about your Fathom meetings: summaries, transcripts, action items, who said what.

## What you need
- A Fathom account with recorded meetings. On a Claude Team or organization plan, an owner must enable the Fathom connector first (Fathom's docs).
- Terminal path only: Node.js.

## Connect
Already connected? The scoreboard shows anything named Fathom (including `claude.ai Fathom`). If it says "needs sign-in", finish the sign-in instead of adding another.

- Desktop app: + > Connectors > Browse connectors, search **Fathom**, Connect, approve.
- Terminal: `node scripts/register.mjs fathom` (Fathom's `mcp-remote` line at user scope). Restart Claude Code; the first time it starts, a browser window opens for the Fathom sign-in.

## Verify (read-only)
Ask: "List my 5 most recent Fathom meetings." Meetings back means it works.

## Try these
- "What did we agree on in my last Fathom call?"
- "List every action item assigned to me this week."
- "Find the call where the client mentioned their launch date."

## Remove
Desktop app: + > Connectors > Manage connectors > remove. Terminal: `node scripts/register.mjs fathom --remove`.
