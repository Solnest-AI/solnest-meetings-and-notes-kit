# Fireflies

**Status:** official (Fireflies' hosted MCP server). Browser sign-in, no key.
**Server name / URL:** `fireflies` / `https://api.fireflies.ai/mcp`
**Verified:** docs.fireflies.ai/getting-started/mcp-configuration ("speaks Streamable HTTP only, at `POST https://api.fireflies.ai/mcp`") and fireflies.ai/blog/fireflies-mcp-server ("authenticates with OAuth"), read 2026-11-04. Endpoint answered 401 with OAuth metadata on 2026-11-04.
**Not verified:** which Fireflies plans include MCP access.

## What it lets Claude do
Read your Fireflies meeting transcripts, summaries and action items, and search across them.

## What you need
- A Fireflies account with recorded meetings.

## Connect
Already connected? The scoreboard shows anything named Fireflies. Skip it.

Desktop app: + > Connectors > Browse connectors, search **Fireflies**, or add it as a custom connector. Follow `_how-sign-in-works.md` with name `fireflies` and URL `https://api.fireflies.ai/mcp`.

## Verify (read-only)
Ask: "List my 5 most recent Fireflies meetings." Meetings back means it works.

## Try these
- "Summarize my last Fireflies call and list the action items with owners."
- "Find calls this month where someone asked about pricing."
- "Pull 3 quotable lines from my last sales call for a post." (Drafts only.)

## Remove
Path A: + > Connectors > Manage connectors > remove. Path B: `node scripts/register.mjs fireflies --remove`.
