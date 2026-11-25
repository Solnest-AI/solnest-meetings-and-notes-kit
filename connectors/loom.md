# Loom

Official only, through Atlassian (who owns Loom). Browser sign-in, no key.

## Official, through Atlassian
**Status:** official. Atlassian (who owns Loom) delivers Loom's MCP tools through the Atlassian MCP server. Browser sign-in, no key.
**Server name / URL:** `atlassian` / `https://mcp.atlassian.com/v2/mcp`
**Verified:** support.atlassian.com/loom/docs/loom-mcp-tools/ (updated 2026-10-05): "Loom tools are included automatically whenever you connect your AI client or IDE to the Atlassian MCP Server", plus github.com/atlassian/atlassian-mcp-server (`claude mcp add --transport http atlassian https://mcp.atlassian.com/v2/mcp`), read 2026-11-04. Endpoint answered 401 on 2026-11-04.

**What you need:** your Loom workspace must be **linked to an Atlassian Cloud site**. Atlassian: "Your Loom workspace will not show up in the selection process if it is not linked to an Atlassian Cloud site." Not linked: their Loom workspace admin links it to an Atlassian site first (Atlassian's guide is at support.atlassian.com/loom), then connect.

**Connect:** already connected? The scoreboard row "Loom (official, via Atlassian)" shows any `atlassian` server. Otherwise follow `_how-sign-in-works.md` with name `atlassian` and URL `https://mcp.atlassian.com/v2/mcp` (Path B: `node scripts/register.mjs loom`). On Atlassian's page: sign in, pick the site linked to your Loom workspace, approve `READ_LOOM` (and `WRITE_LOOM` only if they want Claude to comment, rename or move videos).


## Verify (read-only)
Ask: "List my 5 most recent Loom videos." Videos back means it works.

## Try these
- "Get the transcript of my latest Loom and turn it into step-by-step SOP notes."
- "Summarize the Looms my team shared this week."
- "Find my Loom about onboarding and pull out the key takeaways."

## Remove
+ > Connectors > Manage connectors > remove, or `node scripts/register.mjs loom --remove`. Revoke in your Atlassian account's connected apps.
