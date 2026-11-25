# Plaud

**Status:** official (Plaud's remote MCP server, also in Claude's connector directory). Browser sign-in, no key.
**Server name / URL:** `plaud` / `https://mcp.plaud.ai/mcp`
**Verified:** support.plaud.ai "Plaud MCP" article ("MCP Server URL `https://mcp.plaud.ai/mcp`, Authentication `OAuth`"; Claude listed as one-click from the Connector Directory) and docs.plaud.ai/plaud-mcp-cli/mcp, read 2026-11-04. Endpoint answered 401 with OAuth metadata on 2026-11-04.

## What it lets Claude do
Search your Plaud recordings, read transcripts and summaries, and turn meetings into notes, follow-ups and content. Used by content-miner, meeting-to-content and wrap-up.

## What you need
- A Plaud account with recordings. Plaud notes that over this connection your recording data passes through Plaud's MCP server (hosted in the US).

## Connect
Already connected? The scoreboard shows anything named Plaud. Skip it.

Easiest in the desktop app: + > Connectors > Browse connectors, search **Plaud**, connect, sign in. Or follow `_how-sign-in-works.md` with name `plaud` and URL `https://mcp.plaud.ai/mcp`.

## Verify (read-only)
Ask: "List my 5 most recent Plaud recordings with their dates." Your recordings back means it works.

## Try these
- "Summarize my last Plaud recording and pull out every action item."
- "Find the recording where we talked about pricing and quote what was decided."
- "Turn yesterday's meeting into 3 short post ideas." (Nothing gets posted; you just get drafts.)

## Remove
Path A: + > Connectors > Manage connectors > remove. Path B: `node scripts/register.mjs plaud --remove`. If it misbehaves (Plaud's own FAQ for server errors): disconnect and reconnect.
