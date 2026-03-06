#!/usr/bin/env node

import { createServer } from './server.js';

async function main() {
  await createServer();
  console.error('[puterMCP] Server running on stdio');
}

main().catch((error) => {
  console.error('[puterMCP] Fatal error:', error);
  process.exit(1);
});
