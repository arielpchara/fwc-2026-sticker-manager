---
name: builder
description: Use when asked to build the project, after making code changes, or when typecheck or bundle errors need to be fixed. Runs npm run typecheck and npm run build (tsup dual-entry), then delegates compile errors to a subagent and re-runs until green.
---

# Skill: builder

Build the `figurinhas-da-copa-troca` project after a code change.

## When to trigger

- "build the project", "run the build", "check if it compiles"
- After editing any file in `src/`
- After updating `package.json` or `tsconfig.json`
- Before committing (use alongside `git-commit` skill)

## Build commands

```bash
npm run typecheck   # tsc --noEmit — catches type errors fast
npm run build       # tsup dual-entry → dist/cli.js + dist/mcp.js
```

Both must pass before the build is considered green.

## Workflow

1. Run `npm run typecheck`. Capture output.
2. If errors → classify:
   - **Simple** (missing import, wrong type annotation, typo): delegate to `simple-runner`.
   - **Complex** (architectural mismatch, generics, deep inference): delegate to `deep-worker`.
3. Agent fixes the error(s). Re-run `npm run typecheck`.
4. Repeat until typecheck is clean (max 3 rounds; escalate to `deep-worker` if `simple-runner` can't fix in 2).
5. Run `npm run build` (tsup).
6. If tsup errors → follow same delegate pattern.
7. Report: build status, entry points produced (`dist/cli.js`, `dist/mcp.js`), any warnings.

## Success criteria

```
dist/cli.js   — exists and is non-empty
dist/mcp.js   — exists and is non-empty
typecheck     — exits 0
build         — exits 0
```

## Dual-entry reminder

`tsup.config.ts` must declare both entries:
```typescript
entry: ['src/cli/index.ts', 'src/mcp/server.ts']
```
If only one entry is built, the config is wrong — check `tsup.config.ts`.

## Architecture rules (do not violate during fixes)

- `cli/mcp` → `core` → `storage/parser/domain`
- No LLM/AI SDK imports in `src/`
- No `require()` — ESM only
- `DATA_DIR` env var, never hardcoded paths
