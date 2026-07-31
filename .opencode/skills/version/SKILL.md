---
name: version
description: Use when asked to bump, set, or release the app semantic version. Triggers: "bump version", "version patch/minor/major", "semver", "release version", "set version".
---

# Skill: version

Bump or set the web app semantic version (`MAJOR.MINOR.PATCH`).

## Source of truth

`web/package.json` → `"version"`.

Injected at build by Vite `define` as `__APP_VERSION__`, rendered in `web/src/ui/common/Footer.tsx`.

Do **not** hand-edit Footer or invent a second version file.

## Bump rules (semver)

| User says | Level | Effect |
|---|---|---|
| `bump`, `patch`, `version` (no level) | patch | `1.2.3` → `1.2.4` |
| `minor` | minor | `1.2.3` → `1.3.0` |
| `major` | major | `1.2.3` → `2.0.0` |
| `set 1.4.0` / `version 1.4.0` | exact | write that version |

Default when ambiguous: **patch**.

## Workflow

1. Read current version from `web/package.json`.
2. Compute next version from the table.
3. Apply with npm (no git tag, no commit):

```bash
# patch | minor | major
npm version <level> --no-git-tag-version --prefix web

# exact
npm version <x.y.z> --no-git-tag-version --prefix web --allow-same-version
```

4. Confirm `web/package.json` `"version"` matches the target.
5. Report: `old → new` and stop.
6. Commit only if the user asks — then use `git-commit` (`chore: bump version to x.y.z`).

## Do NOT

- Touch root `package.json` or MCP `version` unless the user explicitly asks to sync them.
- Create git tags or run `npm version` without `--no-git-tag-version`.
- Add version libraries or changelog tooling unless asked.
- Hardcode the version string in source files.
