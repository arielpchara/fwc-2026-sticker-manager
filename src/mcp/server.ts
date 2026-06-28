/**
 * MCP adapter — exposes core use cases as MCP tools over stdio.
 * Zero LLM/AI SDK references beyond @modelcontextprotocol/sdk (pure transport).
 *
 * Tools:
 *   upload_own_stickers  — parse text and save as own collection
 *   get_own_stickers     — return current collection
 *   compare_collection   — return stickers they have that I don't
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { setOwn, getOwn, compareWith } from '../core/stickerService.js'

const server = new McpServer({
  name: 'sticker-trade',
  version: '1.0.0',
})

server.tool(
  'upload_own_stickers',
  'Parse sticker codes from text and save them as your collection. Codes follow the pattern: 3 uppercase letters + 1-20 (e.g. BRA1, ARG12) or special codes BRA00/00.',
  { text: z.string().describe('Free text containing sticker codes') },
  async ({ text }) => {
    const result = await setOwn(text)
    return {
      content: [
        {
          type: 'text',
          text: result.saved
            ? `Saved ${result.count} stickers: ${result.stickers.join(', ')}`
            : `No changes — collection unchanged (${result.count} stickers).`,
        },
      ],
    }
  },
)

server.tool(
  'get_own_stickers',
  'Return your current sticker collection.',
  {},
  async () => {
    const record = await getOwn()
    return {
      content: [
        {
          type: 'text',
          text:
            record.stickers.length === 0
              ? 'No stickers saved yet.'
              : `Your stickers (${record.stickers.length}): ${record.stickers.join(', ')}`,
        },
      ],
    }
  },
)

server.tool(
  'compare_collection',
  "Parse another person's sticker list and return stickers they have that you don't (what you can receive from them).",
  { text: z.string().describe("Free text containing the other person's sticker codes") },
  async ({ text }) => {
    const result = await compareWith(text)
    return {
      content: [
        {
          type: 'text',
          text:
            result.count === 0
              ? 'You already have everything the other person has.'
              : `Stickers you can receive (${result.count}): ${result.missing.join(', ')}`,
        },
      ],
    }
  },
)

async function main(): Promise<void> {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  console.error('MCP server error:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
