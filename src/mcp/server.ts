import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { setOwn, getOwn, compareWith, getExtras } from '../core/stickerService.js'
import { codesOf } from '../domain/inventory.js'

const server = new McpServer({
  name: 'sticker-trade',
  version: '1.0.0',
})

server.tool(
  'upload_own_stickers',
  'Parse sticker codes from text and save them as your collection. Codes follow the pattern: 3 uppercase letters + 1-20 (e.g. BRA1, ARG12) or special code 00. Supports grouped list format and xN quantity suffix.',
  { text: z.string().describe('Free text containing sticker codes') },
  async ({ text }) => {
    const result = await setOwn(text)
    return {
      content: [
        {
          type: 'text',
          text: result.saved
            ? `Saved ${result.count} unique stickers (${result.totalCopies} total copies): ${result.stickers.join(', ')}`
            : `No changes — collection unchanged (${result.count} unique stickers, ${result.totalCopies} total copies).`,
        },
      ],
    }
  },
)

server.tool(
  'get_own_stickers',
  'Return your current sticker collection with quantities.',
  {},
  async () => {
    const record = await getOwn()
    const stickers = codesOf(record.inv)
    if (stickers.length === 0) {
      return { content: [{ type: 'text', text: 'No stickers saved yet.' }] }
    }
    const total = Object.values(record.inv).reduce((a, b) => a + b, 0)
    const lines = stickers.map((c) => {
      const qty = record.inv[c]
      return qty > 1 ? `${c} x${qty}` : c
    })
    return {
      content: [
        {
          type: 'text',
          text: `Your stickers (${total} copies of ${stickers.length} unique):\n${lines.join(', ')}`,
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

server.tool(
  'get_extras',
  'Return stickers you have duplicates of (quantity >= 2), showing how many you can trade away.',
  {},
  async () => {
    const result = await getExtras()
    if (result.totalUnique === 0) {
      return { content: [{ type: 'text', text: 'No extra stickers (all owned in single copies).' }] }
    }
    const lines = result.items.map((e) => `${e.code} x${e.qty} (surplus: ${e.surplus})`)
    return {
      content: [
        {
          type: 'text',
          text: `Extra stickers (${result.totalUnique} codes, ${result.totalSurplus} surplus):\n${lines.join('\n')}`,
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
