import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SUPPORTED_MODELS } from '../constants.js';

export function registerListModelsTool(server: McpServer): void {
  server.tool(
    'list_models',
    'List all available image generation models supported by puterMCP via Puter.',
    {
      category: z.enum(['all', 'openai', 'google', 'flux', 'stable-diffusion', 'other'])
        .optional()
        .default('all')
        .describe('Filter models by category.'),
    },
    async (args) => {
      let models = SUPPORTED_MODELS;

      if (args.category !== 'all') {
        models = models.filter((m) => m.category === args.category);
      }

      const formatted = models
        .map((m) => {
          let line = `- **${m.id}**`;
          if (m.displayName) line += ` — ${m.displayName}`;
          if (m.quality) line += ` | Quality options: ${m.quality.join(', ')}`;
          if (m.notes) line += ` | ${m.notes}`;
          return line;
        })
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `## Available Image Generation Models\n\n` +
              `**Category:** ${args.category}\n` +
              `**Total:** ${models.length} models\n\n` +
              formatted +
              `\n\n_Use the model ID with the \`generate_image\` tool's \`model\` parameter._`,
          },
        ],
      };
    }
  );
}
