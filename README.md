# figurinhas-da-copa-troca

CLI + MCP server to manage FIFA World Cup sticker trading.

Parse sticker codes from any app's plain text, track your own collection, and find what you need from a friend's list.

## Sticker Format

```
[A-Z]{3} + 1-20     e.g.  BRA1  BRA12  ARG1  FWC3  BRA00
00                  special standalone sticker
```

Input text is lenient: codes can be separated by spaces, commas, or newlines. Unknown tokens are ignored. Input is normalized to uppercase.

## Install

```bash
git clone <repo>
cd figurinhas-da-copa-troca
npm install
npm run build
```

Link the CLI globally (optional):
```bash
npm link
```

## CLI Usage

```bash
# Upload / update your sticker list (parses text, saves to own.json)
sticker-trade own --text "BRA1,BRA2,ARG00,00"
sticker-trade own --file my-stickers.txt
echo "BRA1 BRA2" | sticker-trade own

# Show your current collection
sticker-trade own --list

# Compare: find stickers the OTHER person has that you DON'T
sticker-trade compare --text "BRA1,BRA3,ARG00,FWC5"
sticker-trade compare --file their-list.txt
pbpaste | sticker-trade compare
```

`compare` output = stickers you can receive from the other person.

## Data / History

```
./data/              (local)   or   /data/   (Docker volume)
  own.json           ← current collection
  own_20260627.json  ← snapshot for that day (written only when collection changes)
  own_20260628.json
```

History files are written **only when the content changes** (sha256 comparison). Multiple changes on the same day keep only the latest state for that day.

Override the data directory:
```bash
DATA_DIR=/custom/path sticker-trade own --list
```

## MCP Server (Docker)

Build the image:
```bash
docker build -t sticker-trade .
```

Add to your MCP client config (stdio transport):
```json
{
  "mcpServers": {
    "sticker-trade": {
      "type": "local",
      "command": ["docker", "run", "--rm", "-i", "-v", "sticker-data:/data", "sticker-trade"]
    }
  }
}
```

### MCP Tools

| Tool | Description |
|---|---|
| `upload_own_stickers` | Parse text and save as your collection |
| `get_own_stickers` | Return your current sticker list |
| `compare_collection` | Return stickers the other person has that you don't |

## Development

```bash
npm run dev:cli        # watch mode CLI (tsx)
npm run dev:mcp        # watch mode MCP server (tsx)
npm run build          # tsup dual-entry → dist/
npm run typecheck      # tsc --noEmit
npm test               # vitest
```

## LLM-Agnostic Design

The tool itself has **no dependency on any LLM or AI SDK** beyond the MCP transport layer. It runs identically regardless of which model calls it. All agent/model coupling lives in `.opencode/` (skills + subagents) and can be swapped without touching the tool code.

## Project Structure

```
src/
  domain/       sticker.ts, collection.ts     (pure logic)
  parser/       textParser.ts                 (text → codes)
  storage/      ownRepository.ts              (own.json + history)
  core/         stickerService.ts             (use cases)
  cli/          index.ts                      (CLI adapter)
  mcp/          server.ts                     (MCP adapter)
  tests/        *.test.ts
docs/
  plan.md       full implementation spec
.opencode/
  agent/        simple-runner.md, deep-worker.md
  skills/       unit-test/, builder/, git-commit/
```
