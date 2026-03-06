# puterMCP

**A local MCP server that bridges LLM environments with Puter's free AI & Cloud services**

puterMCP is a TypeScript/Node.js [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that runs locally via `npx` and acts as a bridge between any MCP-compatible LLM environment (Claude Desktop, Kilo Code, Trae, Cursor, Windsurf, etc.) and [Puter](https://puter.com)'s free, unlimited AI and Cloud APIs.

The first capability shipped is **image generation** across 30+ models (GPT Image, DALL-E, Gemini Nano Banana, Flux, Stable Diffusion, and more) — all without API keys or per-request costs.

## Features

- **Zero Friction**: Install and run with a single `npx` command.
- **Free Image Generation**: Access 30+ models including DALL-E 3, Flux.1, and Stable Diffusion via Puter's free tier.
- **Secure Authentication**: Uses your personal Puter account token, stored locally and securely.
- **Universal Compatibility**: Works with Claude Desktop, Cursor, Trae, and any other MCP client.
- **Inline Image Generation**: Images are returned directly in the chat interface, ready for preview and download.
- **Smart Fallback**: Automatically tries free models (like Flux) if premium models (like DALL-E 3) fail due to quota limits.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A free account on [Puter.com](https://puter.com)

## Installation & Setup

### 1. Authenticate with Puter

You need to provide your Puter authentication token to the MCP server. This is a one-time setup.

1. Log in to [puter.com](https://puter.com).
2. Open the browser Developer Tools (**F12** or **Cmd+Option+I**) -> **Console**.
3. Type `puter.authToken` and press Enter.
4. Copy the string (without quotes).
5. Run the following command in your terminal:

```bash
npx puter-mcp --token <your-token-here>
```

Your token will be securely stored in `~/.puter-mcp/config.json`.

### 2. Configure Your MCP Client

#### Claude Desktop

Add the following to your `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "puter": {
      "command": "npx",
      "args": ["-y", "puter-mcp"]
    }
  }
}
```

#### Trae / Cursor / Kilo Code

Add the configuration to your project's MCP settings (e.g., `.kilo/mcp.json` or via the IDE settings UI):

```json
{
  "mcpServers": {
    "puter": {
      "command": "npx",
      "args": ["-y", "puter-mcp"]
    }
  }
}
```

## Usage

Once configured, restart your LLM environment. You can now ask it to generate images:

- "Generate a cyberpunk city at night using DALL-E 3"
- "Create a logo for a coffee shop using Flux.1 Schnell"
- "Show me what models are available"

### Available Tools

- **`generate_image`**: Generate an image from a text prompt.
  - `prompt`: Description of the image.
  - `model`: (Optional) Model ID (default: `dall-e-3`).
  - `quality`: (Optional) Quality setting (e.g., `hd`, `standard`).

- **`list_models`**: List all available image generation models.
  - `category`: (Optional) Filter by category (`all`, `openai`, `google`, `flux`, `stable-diffusion`, `other`).

## Development

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/puter-mcp.git
   cd puter-mcp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Run locally:
   ```bash
   node bin/puter-mcp.mjs
   ```

## License

MIT
