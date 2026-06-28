# AGENTS.md — figurinhas-da-copa-troca

Agent guidance for working inside this project. Loaded automatically via `opencode.json` `instructions`.

## Architecture at a Glance

```
cli/index.ts  ──┐
                ├──▶  core/stickerService.ts  ──▶  storage/ownRepository.ts
mcp/server.ts ──┘              │
                               └──▶  parser/textParser.ts
                                           │
                                           └──▶  domain/sticker.ts
                                                 domain/collection.ts
```

**Dependency rule**: `cli/mcp` → `core` → `storage/parser/domain`. Lower layers never import from higher ones. `domain` is pure (no IO). `core` takes an injected repository (no direct file IO).

## Sticker Codes

```
Pattern : ^([A-Z]{3}(?:[1-9]|1[0-9]|20)|[A-Z]{3}00|00)$
Valid   : BRA1  BRA12  BRA20  ARG00  FWC3  00
Invalid : BRA0  BRA21  br1  1BRA  BRAA1
```

All input is normalized to uppercase before validation. Unknown tokens in parsed text are silently ignored.

## Key Conventions

- All source inside `src/`. Tests co-located in `src/tests/`.
- ESM-only (`"type": "module"` in package.json). Use `import`/`export`, never `require`.
- Two build entry points: `src/cli/index.ts` → `dist/cli.js`, `src/mcp/server.ts` → `dist/mcp.js`.
- Data directory from `DATA_DIR` env var (default `/data` in container, `./data` locally).
- **Never** import `fs` or `path` in `domain/` or `core/stickerService.ts` — those layers are IO-free.

## Persistence Rules

- Hash = `sha256(JSON.stringify(sortedUniqueStickers))`.
- Write `own.json` + `own_YYYYMMDD.json` **only when hash changes**.
- Same-day snapshot overwrites the existing day file.

## Build / Test Commands

```bash
npm run build         # tsup dual-entry (src/cli + src/mcp) → dist/
npm run typecheck     # tsc --noEmit  (run before committing)
npm test              # vitest run
npm run dev:cli       # tsx watch src/cli/index.ts
npm run dev:mcp       # tsx watch src/mcp/server.ts
```

Always run `npm run typecheck && npm test` after any source change.

## LLM-Agnostic Boundary

The tool code (`src/`) contains **zero** LLM/AI SDK references beyond `@modelcontextprotocol/sdk` (pure transport). All LLM coupling lives exclusively in `.opencode/` (skills + agent files). Changing provider/model = editing those files only.

## Skills & Agents

| Skill | Trigger | Subagent | Purpose |
|---|---|---|---|
| `unit-test` | "write/update tests", after src change | `simple-runner` per module (parallel), escalate to `deep-worker` | Generate vitest `*.test.ts` specs |
| `builder` | "build the project", after code change | `simple-runner` (or `deep-worker` for hard errors) | `typecheck` + `tsup` build, delegate fix on error |
| `git-commit` | "commit" | `simple-runner` | Conventional commit: `feat\|fix\|chore: subject` |

### Subagents

| Agent | Model | Use for |
|---|---|---|
| `simple-runner` | *(inherits main thread — pick a free/cheap model)* | Deterministic mechanical tasks: scaffolding tests, formatting commit messages |
| `deep-worker` | `anthropic/claude-sonnet-4-6` | Non-trivial logic: complex bug fixes, hard type errors, edge-case test design |

When a skill says "spawn a parallel agent", use the `task` tool (subagent_type matches the agent name). Prefer launching multiple agents in a single message (one tool call per module) when work is independent.

## MCP Tooling

Three MCP tools exposed by `src/mcp/server.ts`:

| Tool | Input schema | Output |
|---|---|---|
| `upload_own_stickers` | `{ text: string }` | `{ count, stickers }` |
| `get_own_stickers` | `{}` | `{ count, stickers }` |
| `compare_collection` | `{ text: string }` | `{ missing, count }` |

`compare_collection` = stickers the **other person has that you don't** (what you can receive).

## What NOT to Do

- Do not add LLM SDK calls to `src/domain/`, `src/parser/`, `src/storage/`, or `src/core/`.
- Do not hardcode data paths — always use `DATA_DIR` env var.
- Do not commit `dist/`, `node_modules/`, or `data/`.
- Do not introduce new runtime dependencies without updating `Dockerfile`.
