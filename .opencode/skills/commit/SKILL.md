---
name: commit
description: After a plan and build, AI commits the changes using Conventional Commit format.
---

# Skill: commit

before start a new prompt commit the current change

## Workflow

1. Verify `npm run typecheck` passes (both root and `web/`)
2. Inspect `git status` and `git diff`
3. Classify change as `feat`, `fix`, or `chore`
4. Stage intended files (never `dist/`, `node_modules/`, `data/`)
5. Commit with `feat|fix|chore: subject`
