# Implementation Plan — FIFA World Cup Sticker Trade Tool

## Overview

A small TypeScript tool to manage trading World Cup stickers:
- Upload **my own** stickers from free text → persisted with history.
- Compare against **another person's** text → list stickers they have that **I don't**.
- Runs both as a **CLI** and as an **MCP server**, packaged in **Docker**.

## Sticker Model

Valid code = `[A-Z]{3}` + number `1–20`, plus the special standalone `00`.

- Regex: `^([A-Z]{3}(?:[1-9]|1[0-9]|20)|00)$`
- Examples valid: `BRA1`, `BRA12`, `ARG1`, `FWC3`, `00`
- Examples invalid: `BRA0`, `BRA21`, `br1`, `BRAA1`, `1BRA`
- Input is normalized to uppercase before validation.
- Team codes: any 3 uppercase letters accepted (no fixed team list).

## Architecture

Simple, layered. All source under `src/`. Two entry points: CLI and MCP.

```
src/
  domain/
    sticker.ts        # parseCode / validate / normalize (pure, zero IO)
    collection.ts     # dedupe + diff (missing = other \ mine)
  parser/
    textParser.ts     # free text -> unique valid codes (split on , space newline)
  storage/
    ownRepository.ts  # load/save own.json + dated history, sha256 hash
  core/
    stickerService.ts # use cases: setOwn(text), getOwn(), compareWith(text)
  cli/
    index.ts          # CLI adapter (node:util parseArgs, zero extra deps)
  mcp/
    server.ts         # MCP adapter (3 tools, stdio transport)
  tests/
    sticker.test.ts
    textParser.test.ts
    collection.test.ts
    ownRepository.test.ts
    stickerService.test.ts
```

### Dependency rule

```
cli / mcp  →  core  →  storage / parser / domain
```

`core` has zero knowledge of the transport layer. `domain` has zero IO.

## Persistence

- **Data dir**: `DATA_DIR` env var, defaults to `/data` in container, `./data` locally.
- **Current state**: `own.json` → `{ stickers: string[], hash: string, updatedAt: string }`.
- **Hash**: `sha256` of `JSON.stringify(sorted-unique-codes)`.
- **On `setOwn`**:
  1. Compute hash of new codes.
  2. If hash === current hash → **no write** (idempotent).
  3. If hash changed → write `own.json` AND write snapshot `own_YYYYMMDD.json`.
  4. Same-day snapshots overwrite the day's file (only the latest state of that day is kept).
- **On fresh container**: if `own.json` doesn't exist, return empty list.

## CLI Interface

Entry: `src/cli/index.ts`, built to `dist/cli.js`, exposed as `sticker-trade` bin.

```
# Upload/update my stickers
sticker-trade own --text "BRA1,BRA2,00"
sticker-trade own --file my-stickers.txt
echo "BRA1 BRA2" | sticker-trade own

# List my current stickers
sticker-trade own --list

# Compare: show stickers other person has that I don't
sticker-trade compare --text "BRA1,BRA3,00"
sticker-trade compare --file their-stickers.txt
echo "BRA1 BRA3" | sticker-trade compare
```

Parser is lenient: any whitespace, commas, newlines are treated as separators. Unknown tokens are silently ignored. The result is deduped and sorted.

## MCP Interface

Entry: `src/mcp/server.ts`, built to `dist/mcp.js`, stdio transport (standard MCP).

### Tools

| Tool | Input | Output |
|---|---|---|
| `upload_own_stickers` | `{ text: string }` | `{ count: number, stickers: string[] }` |
| `get_own_stickers` | — | `{ count: number, stickers: string[] }` |
| `compare_collection` | `{ text: string }` | `{ missing: string[], count: number }` |

`compare_collection` returns stickers the other person has that **I don't** (what I can receive from them).

## Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist/ dist/
ENV DATA_DIR=/data
VOLUME ["/data"]
CMD ["node", "dist/mcp.js"]
```

Build steps in CI: `npm ci && npm run build` → then the image copies `dist/`.

MCP client config (stdio):
```json
{
  "mcpServers": {
    "sticker-trade": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-v", "sticker-data:/data", "sticker-trade"]
    }
  }
}
```

## Unit Tests (vitest)

| File | Cases |
|---|---|
| `sticker.test.ts` | Valid: `BRA1`, `BRA20`, `00`. Invalid: `BRA0`, `BRA21`, `BR1`, `BRA00`, `bra1`, `123`, empty. Normalization: lowercase input uppercased. |
| `textParser.test.ts` | Space/comma/newline separation. Mixed garbage tokens ignored. Deduplication. Empty string → []. |
| `collection.test.ts` | `diff(mine, theirs)` = codes in `theirs` not in `mine`. Both empty. Full overlap → []. No overlap → all theirs. |
| `ownRepository.test.ts` | Fresh load → empty. Save → reads back. Unchanged hash → no file write (spy). Changed hash → writes `own.json` + `own_YYYYMMDD.json`. |
| `stickerService.test.ts` | `setOwn` then `getOwn` roundtrip. `compareWith` flow. Idempotent double-set. |

## Versioning / History Example

```
/data/
  own.json            ← current snapshot always up to date
  own_20260627.json   ← last state on 2026-06-27
  own_20260628.json   ← last state on 2026-06-28
```
