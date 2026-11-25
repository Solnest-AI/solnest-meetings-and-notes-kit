# Zoom

**Status:** official ("Zoom for Claude", in Claude's connector directory). Browser sign-in, no key. **Desktop app and claude.ai only in this kit.**
**Verified:** the "Zoom for Claude" connector appears and connects from Claude's directory (seen connected on a Solnest test machine, 2026-11-04). Zoom's developer docs have a "Connect to Zoom MCP Servers" page (developers.zoom.us/docs/mcp/servers/connect-to-zoom-mcp-servers/) that describes adding it in Claude as a custom connector.
**NOT verified:** the server URL itself (Zoom's page sends you to a separate page for it, which we have not confirmed). So this kit has no terminal (Path B) line for Zoom. Do not invent one.

## What it lets Claude do
Read your Zoom meetings, recordings and their transcripts, depending on what your Zoom account and admin allow.

## What you need
- A Zoom account. Cloud recording and transcripts depend on your Zoom plan and your admin's settings. Some users report the connector cannot fetch transcript files for every meeting (devforum.zoom.us thread "Zoom MCP Connector for Claude").

## Connect
Already connected? The scoreboard shows anything named Zoom (like `claude.ai Zoom for Claude`). Skip it.

Desktop app: + > Connectors > Browse connectors, search **Zoom**, pick **Zoom for Claude**, Connect, sign in to Zoom and approve. Tell Claude "connected".

Terminal only, no desktop app: say plainly that this kit cannot add Zoom from the terminal yet, and that they can add it at claude.ai (Settings > Connectors) with the same account, which Claude Code also picks up.

## Verify (read-only)
Ask: "List my 5 most recent Zoom meetings." Meetings back means it works.

## Try these
- "Summarize my last Zoom call and list the action items."
- "What Zoom meetings do I have tomorrow?"
- "Find the recording from Tuesday's client call."

## Remove
+ > Connectors > Manage connectors > remove. Also revoke Claude in your Zoom account's connected apps if you want it fully cut.
