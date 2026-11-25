# Wispr Flow

**Status:** official (Wispr Flow's remote MCP server and Claude connector). Browser sign-in, no key. Read-only by design.
**Server name / URL:** `wispr-flow` / `https://api.wisprflow.ai/connect/mcp`
**Verified:** github.com/Wispr-AI/wispr-flow-plugin ("Official Wispr Flow MCP plugin", config `"url": "https://api.wisprflow.ai/connect/mcp"`, updated 2026-10-17) and docs.wisprflow.ai "Connect Claude, ChatGPT or another MCP client to Wispr Flow", read 2026-11-04. Wispr says its notetaker is reached "through a read-only MCP connector". Endpoint answered 401 with OAuth metadata on 2026-11-04.

## What it lets Claude do
Find your Wispr Flow meeting notes and transcripts, search across meetings, and look up upcoming meetings and who is attending. It reads your meetings; it does not read your voice dictation.

## What you need
- A Wispr Flow account using its meeting notes (notetaker).

## Connect
Already connected? The scoreboard shows anything named Wispr. Skip it.

Desktop app: + > Connectors > Browse connectors, search **Wispr Flow**, connect, sign in. Or follow `_how-sign-in-works.md` with name `wispr-flow` and URL `https://api.wisprflow.ai/connect/mcp`.

## Verify (read-only)
Ask: "What meetings do I have coming up in Wispr Flow?" or "Search my Wispr Flow meetings from last week." Meetings back means it works. Times come back in UTC; Claude converts them to your time zone.

## Try these
- "Summarize my last meeting from Wispr Flow and list who owes what."
- "Who's in my next meeting and what did we talk about last time with them?"
- "Find every meeting this month where a client mentioned budget."

## Remove
Path A: + > Connectors > Manage connectors > remove. Path B: `node scripts/register.mjs wispr-flow --remove`.
