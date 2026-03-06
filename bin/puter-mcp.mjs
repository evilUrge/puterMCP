#!/usr/bin/env node

import { createServer } from '../dist/server.js';
import { AuthManager } from '../dist/puter/auth.js';

const args = process.argv.slice(2);

// Handle --login flag (deprecated, show manual instructions)
if (args.includes('--login')) {
  console.error('[puterMCP] Browser authentication is deprecated.');
  console.error('[puterMCP] Please authenticate manually:');
  console.error('  1. Go to https://puter.com and open Developer Tools (F12)');
  console.error('  2. Type `puter.authToken` in the Console and copy the value');
  console.error('  3. Run: `npx puter-mcp --token <your-token>`');
  process.exit(1);
}

// Handle --token flag for manual token setting
if (args.includes('--token')) {
  const tokenIndex = args.indexOf('--token') + 1;
  if (tokenIndex >= args.length) {
    console.error('[puterMCP] Error: --token requires a value');
    process.exit(1);
  }
  const authManager = new AuthManager();
  authManager.setToken(args[tokenIndex]);
  console.error('[puterMCP] ✅ Token saved successfully!');
  process.exit(0);
}

// Handle --help
if (args.includes('--help') || args.includes('-h')) {
  console.error(`
puterMCP — MCP server for Puter's free AI APIs

Usage:
  npx puter-mcp              Start the MCP server (stdio transport)
  npx puter-mcp --token <t>  Set auth token manually
  npx puter-mcp --help       Show this help

Environment Variables:
  PUTER_AUTH_TOKEN           Auth token (overrides stored config)
  PUTER_MCP_LOG_LEVEL        Log level: debug, info, warn, error

MCP Client Configuration:
  Claude Desktop (claude_desktop_config.json):
    {
      "mcpServers": {
        "puter": {
          "command": "npx",
          "args": ["-y", "puter-mcp"]
        }
      }
    }
  `);
  process.exit(0);
}

// Default: start MCP server
await createServer();
