---
name: git-commit
description: Use when asked to commit changes. Inspects git status and git diff, classifies the change as feat, fix, or chore, writes a Conventional Commit message, stages the intended files, and commits. Optionally delegates message drafting to simple-runner.
---

# Skill: git-commit

Create a Conventional Commit for changes in `figurinhas-da-copa-troca`.

## When to trigger

- "commit", "commit my changes", "git commit", "save my work"
- After a feature, bug fix, or maintenance task is complete and verified

## Change type classification

```
{{changeType(feat, fix, chore)}}
```

| Type | When to use |
|---|---|
| `feat` | New capability added (new command, new MCP tool, new domain logic) |
| `fix` | Bug corrected, broken behavior repaired |
| `chore` | No behavior change: deps update, config, docs, refactor, tests only |

**Rule**: when in doubt between `feat` and `chore`, prefer `chore`. When behavior is fixed, always use `fix`.

## Conventional Commit format

```
<type>: <subject>

[optional body — one paragraph max, explain WHY not WHAT]
```

- Subject: imperative mood, lowercase, no period, max 72 chars.
- Body: only if the "why" isn't obvious from the subject.
- No issue/ticket references unless explicitly provided by the user.

## Workflow

1. Run `git status` — identify changed/staged files.
2. Run `git diff HEAD` (or `git diff --cached` if already staged) — read the changes.
3. Classify change type using the table above.
4. Optionally delegate message drafting to `simple-runner`:
   - Give it: the diff summary, the classified type, and the format rules above.
   - It returns a candidate subject line (and optional body).
5. Stage intended files: `git add <files>` — **never** `git add .` blindly. Exclude:
   - `dist/`, `node_modules/`, `data/`, `.env*`, any secrets.
6. Run `git commit -m "<type>: <subject>"` (add `-m "<body>"` if body exists).
7. Report: commit hash, type used, subject, files staged.

## Do NOT

- Force-push, amend, or rebase without explicit user request.
- Commit `dist/` (built artifacts), `node_modules/`, or `data/` (runtime state).
- Add emoji to commit messages unless the user explicitly asks.
- Commit if `npm run typecheck` is failing — run `builder` skill first.

## Examples

```
feat: add compare_collection MCP tool
fix: handle empty own.json on fresh container start
chore: update tsup to v8.5 and adjust dual-entry config
chore: add ownRepository unit tests
```
