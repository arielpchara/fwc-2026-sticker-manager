---
name: unit-test
description: Use when asked to write, generate, or update unit tests in this project, or after changing source files under src/. Generates vitest *.test.ts specs using parallel simple-runner agents (one per module), escalating hard modules to deep-worker. Runs npm test at the end.
---

# Skill: unit-test

Generate and maintain vitest unit tests for `figurinhas-da-copa-troca`.

## When to trigger

- "write tests", "add unit tests", "update tests", "generate specs"
- After a source file in `src/` changes that lacks coverage
- After the `builder` skill reports passing build (good time to add tests)

## Test file locations

All test files live in `src/tests/` and are named `<module>.test.ts`.

| Source module | Test file |
|---|---|
| `src/domain/sticker.ts` | `src/tests/sticker.test.ts` |
| `src/domain/collection.ts` | `src/tests/collection.test.ts` |
| `src/parser/textParser.ts` | `src/tests/textParser.test.ts` |
| `src/storage/ownRepository.ts` | `src/tests/ownRepository.test.ts` |
| `src/core/stickerService.ts` | `src/tests/stickerService.test.ts` |

## Required test cases per module

### sticker.test.ts
- Valid: `BRA1`, `BRA20`, `BRA00`, `ARG1`, `FWC3`, `00`
- Invalid: `BRA0`, `BRA21`, `BR1`, `BRAA1`, `1BRA`, `bra1`, `123`, empty string
- Normalization: lowercase input (`bra1`) uppercased before validation

### textParser.test.ts
- Space / comma / newline separation all work
- Mixed garbage tokens (`!!!`, `hello`, `999`) are silently ignored
- Deduplication: `"BRA1 BRA1"` → `["BRA1"]`
- Empty string → `[]`
- Only valid codes survive

### collection.test.ts
- `missing(mine, theirs)` returns codes in `theirs` not in `mine`
- Both empty → `[]`
- Full overlap → `[]`
- No overlap → all of `theirs`
- Partial overlap → correct subset

### ownRepository.test.ts
- Fresh load (no file) → `{ stickers: [], hash: "", updatedAt: "" }` or similar empty state
- `save` then `load` roundtrip → same stickers
- **Unchanged hash → no file write** (spy/mock `fs.writeFile`, assert not called)
- Changed hash → writes `own.json` AND `own_YYYYMMDD.json`
- Uses a real temp directory (e.g. `os.tmpdir()`) to avoid side effects

### stickerService.test.ts
- `setOwn(text)` then `getOwn()` roundtrip
- `compareWith(theirText)` returns correct missing list
- Double `setOwn` with same text is idempotent (no second write)
- `compareWith` when own is empty returns everything from their text

## Workflow

1. Read the source module to understand its API.
2. Launch a `simple-runner` subagent **per module** (in parallel) to scaffold the test file.
   - Give each agent: the source file content, the required cases from above, and the vitest import style.
3. If a module has complex logic (e.g. `ownRepository` with fs mocking), escalate that module to `deep-worker`.
4. Write all returned test files to `src/tests/`.
5. Run `npm test` — if failures, read the error, delegate fix to `deep-worker`.
6. Report: modules covered, test count, pass/fail.

## Vitest style

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
// ESM imports — no require()
// Use vi.spyOn / vi.fn for mocking
// Use import type for type-only imports
```
