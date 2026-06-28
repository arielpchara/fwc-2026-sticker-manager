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

## MCP Tools

| Tool | Description |
|---|---|
| `upload_own_stickers` | Parse text and save as your collection |
| `get_own_stickers` | Return your current sticker list |
| `compare_collection` | Return stickers the other person has that you don't |

## Install as MCP Server

The installer script builds the Docker image and registers the server with your chosen tool(s). All registrations are **user-global** (not project-scoped) so the server is available in every session.

```bash
# Build image + register with all supported tools
npm run mcp:install -- all

# Single tool
npm run mcp:install -- opencode
npm run mcp:install -- copilot
npm run mcp:install -- vscode
npm run mcp:install -- claude
npm run mcp:install -- docker

# Skip rebuild (image already built)
npm run mcp:install -- all --skip-build

# Remove registration
npm run mcp:install -- all --remove

# Custom image tag or server name
npm run mcp:install -- all --image sticker-trade:v2 --name sticker-trade
```

### What gets configured per tool

| Tool | Config location |
|---|---|
| **opencode** | `~/.config/opencode/opencode.json` → `mcp.sticker-trade` |
| **GitHub Copilot CLI** | `~/.copilot/mcp-config.json` (or `$COPILOT_HOME`) → `mcpServers.sticker-trade` |
| **VS Code** | User `mcp.json` (auto-detected by OS) → `servers.sticker-trade` |
| **Claude Code** | `claude mcp add --scope user` |
| **Docker MCP Toolkit** | Custom catalog + gateway (see below) |

After running the installer, **restart your tool** to pick up the change.

---

## Docker MCP Toolkit

The image is a valid stdio MCP server and works with Docker Desktop's [MCP Toolkit](https://docs.docker.com/ai/mcp-catalog-and-toolkit/) (Docker Desktop 4.62+).

The installer's `docker` target automates the steps below.

### Automatic setup via installer

```bash
npm run mcp:install -- docker
```

This builds the image, creates a custom catalog named `sticker-trade`, adds the server entry with `/data` volume persistence, and prints the gateway command.

### Manual setup

```bash
# 1. Build the image
docker build -t sticker-trade .

# 2. Create a custom catalog and add the server entry
docker mcp catalog create sticker-trade
docker mcp catalog add sticker-trade sticker-trade ./docker-mcp/sticker-trade.catalog.yaml --force

# 3. Start the Gateway
docker mcp gateway run
```

### Connect a client to the Gateway

Any MCP client (stdio):
```json
{
  "servers": {
    "MCP_DOCKER": {
      "type": "stdio",
      "command": "docker",
      "args": ["mcp", "gateway", "run"]
    }
  }
}
```

Claude Desktop:
```json
{
  "mcpServers": {
    "MCP_DOCKER": {
      "command": "docker",
      "args": ["mcp", "gateway", "run"]
    }
  }
}
```

### Data persistence

The catalog entry (`docker-mcp/sticker-trade.catalog.yaml`) declares:
```yaml
volumes:
  - "sticker-data:/data"
```
`own.json` and dated history snapshots persist in the `sticker-data` Docker volume across container restarts.

### Profiles route (alternative, Docker Desktop 4.62+)

If you prefer the newer Profiles UI instead of a custom catalog:
```bash
docker mcp profile server add <profile-name> --server file://./docker-mcp/sticker-trade.catalog.yaml
docker mcp gateway run --profile <profile-name>
```

### Direct docker run (no Gateway)

```bash
docker build -t sticker-trade .
docker run --rm -i -v sticker-data:/data sticker-trade
```

Then configure your client to run that command directly:
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
docker-mcp/
  sticker-trade.catalog.yaml                  (Docker MCP Toolkit catalog entry)
scripts/
  install-mcp.mjs                             (MCP installer: all 5 tools + --remove)
docs/
  plan.md       full implementation spec
.opencode/
  agent/        simple-runner.md, deep-worker.md
  skills/       unit-test/, builder/, git-commit/
```
