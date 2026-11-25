// Every tool this kit knows about. Read by lib.mjs, scoreboard.mjs, register.mjs.
// kind: 'oauth'     = vendor's official remote server, browser sign-in, no key.
//       'stdio'     = a local program Claude Code starts (no key in it).
//       'stdio-key' = a local program that needs a secret; Claude Code starts
//                     scripts/run-mcp.mjs, which reads .env and passes it on.
//       'directory' = only available from the Claude connector directory in the
//                     app (+ > Connectors > Browse); no verified URL for terminals.
export const KIT_NAME = 'meetings-and-notes-kit';

export const TOOLS = {
  plaud: {
    label: 'Plaud', kind: 'oauth', url: 'https://mcp.plaud.ai/mcp',
    match: [/plaud/i], file: 'plaud.md',
  },
  'wispr-flow': {
    label: 'Wispr Flow', kind: 'oauth', url: 'https://api.wisprflow.ai/connect/mcp',
    match: [/wispr/i], file: 'wispr-flow.md',
  },
  fireflies: {
    label: 'Fireflies', kind: 'oauth', url: 'https://api.fireflies.ai/mcp',
    match: [/fireflies/i], file: 'fireflies.md',
  },
  fathom: {
    // Fathom's own Claude Code line runs the remote server through mcp-remote.
    label: 'Fathom', kind: 'stdio', command: 'npx', args: ['-y', 'mcp-remote@latest', 'https://api.fathom.ai/mcp'],
    match: [/fathom/i], file: 'fathom.md',
  },
  zoom: {
    label: 'Zoom', kind: 'directory',
    match: [/zoom/i], file: 'zoom.md',
  },
  loom: {
    // Official Loom tools come through Atlassian's MCP server.
    label: 'Loom (official, via Atlassian)', kind: 'oauth', server: 'atlassian',
    url: 'https://mcp.atlassian.com/v2/mcp',
    match: [/atlassian/i, /rovo/i], file: 'loom.md',
  },
};
