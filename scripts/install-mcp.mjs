#!/usr/bin/env node
/**
 * install-mcp.mjs — Install sticker-trade as an MCP server
 *
 * Usage:
 *   node scripts/install-mcp.mjs <target> [options]
 *   npm run mcp:install -- <target> [options]
 *
 * Targets:  opencode | copilot | vscode | claude | docker | all
 *
 * Options:
 *   --skip-build            Skip `docker build`
 *   --image  <tag>          Docker image tag          (default: sticker-trade)
 *   --name   <server>       MCP server name           (default: sticker-trade)
 *   --volume <vol>          Docker volume for /data   (default: sticker-data)
 *   --vscode-config <path>  Override VS Code user mcp.json path
 *   --remove                Remove the server entry instead of adding
 *
 * Config file locations (user-global):
 *   opencode  ~/.config/opencode/opencode.json
 *   copilot   ~/.copilot/mcp-config.json  (or $COPILOT_HOME/mcp-config.json)
 *   vscode    ~/Library/Application Support/Code/User/mcp.json  (macOS)
 *             ~/.config/Code/User/mcp.json                       (Linux)
 *             %APPDATA%\Code\User\mcp.json                       (Windows)
 *   claude    `claude mcp add/remove` CLI
 *   docker    `docker mcp catalog create/add` + gateway snippet
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'

// ─── paths ───────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const PROJECT_ROOT = dirname(dirname(__filename))
const CATALOG_YAML = join(PROJECT_ROOT, 'docker-mcp', 'sticker-trade.catalog.yaml')

// ─── colors ──────────────────────────────────────────────────────────────────

const RESET = '\x1b[0m'
const BOLD  = '\x1b[1m'
const GREEN = '\x1b[32m'
const YELLOW= '\x1b[33m'
const RED   = '\x1b[31m'
const CYAN  = '\x1b[36m'
const DIM   = '\x1b[2m'

// ─── cli args ────────────────────────────────────────────────────────────────

const { values: opts, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'skip-build':    { type: 'boolean', default: false },
    image:           { type: 'string',  default: 'sticker-trade' },
    name:            { type: 'string',  default: 'sticker-trade' },
    volume:          { type: 'string',  default: 'sticker-data' },
    'vscode-config': { type: 'string'  },
    remove:          { type: 'boolean', default: false },
    help:            { type: 'boolean', default: false },
  },
  allowPositionals: true,
  strict: false,
})

const VALID_TARGETS = ['opencode', 'copilot', 'vscode', 'claude', 'docker', 'all']
const rawTarget = positionals[0]

if (opts.help || !rawTarget) {
  printUsage()
  process.exit(0)
}

if (!VALID_TARGETS.includes(rawTarget)) {
  err(`Unknown target: "${rawTarget}". Valid targets: ${VALID_TARGETS.join(', ')}`)
  process.exit(1)
}

const TARGETS = rawTarget === 'all'
  ? ['opencode', 'copilot', 'vscode', 'claude', 'docker']
  : [rawTarget]

// ─── helpers ─────────────────────────────────────────────────────────────────

function log(msg)      { console.log(`  ${msg}`) }
function ok(msg)       { console.log(`  ${GREEN}✓${RESET} ${msg}`) }
function warn(msg)     { console.log(`  ${YELLOW}⚠${RESET}  ${msg}`) }
function err(msg)      { console.error(`  ${RED}✗${RESET}  ${msg}`) }
function info(msg)     { console.log(`  ${CYAN}→${RESET} ${msg}`) }
function heading(msg)  { console.log(`\n${BOLD}${msg}${RESET}`) }
function dim(msg)      { console.log(`  ${DIM}${msg}${RESET}`) }

function printUsage() {
  console.log(`
${BOLD}Usage:${RESET}
  node scripts/install-mcp.mjs <target> [options]
  npm run mcp:install -- <target> [options]

${BOLD}Targets:${RESET}
  opencode    Register in ~/.config/opencode/opencode.json
  copilot     Register in ~/.copilot/mcp-config.json
  vscode      Register in VS Code user mcp.json
  claude      Register via \`claude mcp add\`
  docker      Build image + add to Docker MCP custom catalog
  all         All of the above

${BOLD}Options:${RESET}
  --skip-build           Skip \`docker build\`
  --image  <tag>         Docker image tag         (default: sticker-trade)
  --name   <server>      MCP server name          (default: sticker-trade)
  --volume <vol>         Docker volume for /data  (default: sticker-data)
  --vscode-config <path> Override VS Code user mcp.json path
  --remove               Remove server entry instead of adding

${BOLD}Examples:${RESET}
  npm run mcp:install -- all
  npm run mcp:install -- opencode --skip-build
  npm run mcp:install -- docker --image sticker-trade:dev
  npm run mcp:install -- all --remove
`.trim())
}

/** Run a shell command. Returns { ok, stdout, stderr, status }. */
function run(cmd, args = [], opts = {}) {
  const result = spawnSync(cmd, args, {
    cwd: opts.cwd ?? PROJECT_ROOT,
    encoding: 'utf-8',
    stdio: opts.stdio ?? 'pipe',
  })
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status,
    error: result.error,
  }
}

/** Read a JSON file safely. Returns { content, raw }.
 *  content is null if file has comments / is unparseable. */
function readJsonSafe(filePath) {
  if (!existsSync(filePath)) return { content: {}, raw: null }
  const raw = readFileSync(filePath, 'utf-8')
  try {
    return { content: JSON.parse(raw), raw }
  } catch {
    return { content: null, raw }
  }
}

/** Write a JSON file, creating parent dirs as needed. */
function writeJsonFile(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf-8')
}

/** Set a nested key: setNested(obj, ['a','b'], val) → obj.a.b = val */
function setNested(obj, keys, value) {
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (typeof cur[keys[i]] !== 'object' || cur[keys[i]] === null) cur[keys[i]] = {}
    cur = cur[keys[i]]
  }
  cur[keys.at(-1)] = value
}

/** Delete a nested key. Removes empty parent objects. */
function deleteNested(obj, keys) {
  if (keys.length === 1) { delete obj[keys[0]]; return }
  const parent = keys.slice(0, -1).reduce((o, k) => o?.[k], obj)
  if (parent) delete parent[keys.at(-1)]
}

/**
 * Merge a server entry into a JSON config file (idempotent).
 * If the file has comments/won't parse: back it up, print a snippet.
 * If --remove: delete the key instead.
 */
function mergeEntry(filePath, keyPath, value, label) {
  const { content, raw } = readJsonSafe(filePath)

  if (content === null) {
    // File has comments or is invalid JSON — back it up and print manual snippet
    const backup = filePath + '.bak'
    copyFileSync(filePath, backup)
    warn(`${label}: could not parse "${filePath}" (comments?). Backed up to ${backup}.`)
    warn(`Add this manually:\n`)
    const snippet = {}
    setNested(snippet, keyPath, value)
    console.log(JSON.stringify(snippet, null, 2)
      .split('\n').map(l => '    ' + l).join('\n'))
    console.log()
    return false
  }

  if (opts.remove) {
    deleteNested(content, keyPath)
    writeJsonFile(filePath, content)
    ok(`${label}: removed "${opts.name}" from ${filePath}`)
  } else {
    setNested(content, keyPath, value)
    writeJsonFile(filePath, content)
    ok(`${label}: wrote "${opts.name}" to ${filePath}`)
  }
  return true
}

// ─── docker run args (shared across targets) ─────────────────────────────────

function dockerRunArgs() {
  return ['run', '--rm', '-i', '-v', `${opts.volume}:/data`, opts.image]
}

// ─── preflight ───────────────────────────────────────────────────────────────

function preflight() {
  const r = run('docker', ['info'])
  if (!r.ok) {
    err('Docker daemon is not running or docker is not on PATH.')
    err('Start Docker Desktop (or Docker daemon) and retry.')
    process.exit(1)
  }
  ok('Docker daemon is running')
}

// ─── build ───────────────────────────────────────────────────────────────────

function buildImage() {
  info(`Building image "${opts.image}" …`)
  const r = run('docker', ['build', '-t', opts.image, '.'], { stdio: 'inherit' })
  if (!r.ok) {
    err(`docker build failed (exit ${r.status})`)
    process.exit(1)
  }
  ok(`Image "${opts.image}" built`)
}

// ─── targets ─────────────────────────────────────────────────────────────────

function configureOpenCode() {
  heading('opencode')
  const filePath = join(homedir(), '.config', 'opencode', 'opencode.json')
  const entry = {
    type: 'local',
    command: ['docker', ...dockerRunArgs()],
    enabled: true,
  }
  mergeEntry(filePath, ['mcp', opts.name], entry, 'opencode')
  if (!opts.remove) {
    dim(`Restart opencode to pick up the change.`)
    dim(`Verify: type /mcp in an opencode session.`)
  }
}

function configureCopilot() {
  heading('GitHub Copilot CLI')
  const copilotHome = process.env['COPILOT_HOME'] ?? join(homedir(), '.copilot')
  const filePath = join(copilotHome, 'mcp-config.json')
  const entry = {
    command: 'docker',
    args: dockerRunArgs(),
  }
  mergeEntry(filePath, ['mcpServers', opts.name], entry, 'copilot')
  if (!opts.remove) {
    dim(`Restart Copilot CLI (copilot) to pick up the change.`)
    dim(`Verify: /mcp in an interactive Copilot CLI session.`)
  }
}

function configureVSCode() {
  heading('VS Code')

  let filePath = opts['vscode-config']
  if (!filePath) {
    const os = platform()
    if (os === 'darwin') {
      filePath = join(homedir(), 'Library', 'Application Support', 'Code', 'User', 'mcp.json')
    } else if (os === 'win32') {
      filePath = join(process.env['APPDATA'] ?? join(homedir(), 'AppData', 'Roaming'), 'Code', 'User', 'mcp.json')
    } else {
      filePath = join(homedir(), '.config', 'Code', 'User', 'mcp.json')
    }
  }

  const entry = {
    type: 'stdio',
    command: 'docker',
    args: dockerRunArgs(),
  }
  mergeEntry(filePath, ['servers', opts.name], entry, 'vscode')
  if (!opts.remove) {
    dim(`Reload VS Code window (Developer: Reload Window) to activate.`)
    dim(`Verify: Command Palette → "MCP: List Servers".`)
  }
}

function configureClaude() {
  heading('Claude Code (claude CLI)')

  const claudeCheck = run('claude', ['--version'])
  if (!claudeCheck.ok && claudeCheck.error?.code === 'ENOENT') {
    warn('`claude` not found on PATH. Run this command manually:')
    const args = ['docker', ...dockerRunArgs()]
    console.log(`\n    claude mcp add ${opts.name} --scope user -- ${args.join(' ')}\n`)
    return
  }

  if (opts.remove) {
    const r = run('claude', ['mcp', 'remove', opts.name, '--scope', 'user'])
    if (r.ok) {
      ok(`claude: removed "${opts.name}"`)
    } else {
      warn(`claude mcp remove exited ${r.status} — may not have been registered.`)
    }
    return
  }

  // Remove first (idempotent — ignore errors), then add
  run('claude', ['mcp', 'remove', opts.name, '--scope', 'user'])
  const addArgs = ['mcp', 'add', opts.name, '--scope', 'user', '--', 'docker', ...dockerRunArgs()]
  const r = run('claude', addArgs)
  if (r.ok) {
    ok(`claude: registered "${opts.name}" (scope: user)`)
    dim(`Verify: claude mcp list`)
  } else {
    warn(`claude mcp add exited ${r.status}. Fallback — run this manually:`)
    console.log(`\n    claude mcp add ${opts.name} --scope user -- docker ${dockerRunArgs().join(' ')}\n`)
  }
}

function configureDocker() {
  heading('Docker MCP Toolkit')

  // OCI-style catalog reference used by docker mcp catalog commands
  const catalogRef = `${opts.name}:latest`
  const serverRef  = `docker://${opts.image}`

  if (opts.remove) {
    // docker mcp catalog remove <oci-ref>
    const r = run('docker', ['mcp', 'catalog', 'remove', catalogRef])
    if (r.ok) {
      ok(`docker: removed catalog "${catalogRef}"`)
    } else if (r.error?.code === 'ENOENT' || r.stderr.includes('unknown command')) {
      warn('`docker mcp` is not available on this Docker version.')
      warn(`Run manually:  docker mcp catalog remove ${catalogRef}`)
    } else {
      // "not found" etc. — acceptable
      warn(`docker mcp catalog remove exited ${r.status} — may not have existed.`)
    }
    return
  }

  // ── check docker mcp is available ────────────────────────────────────────
  const check = run('docker', ['mcp', '--help'])
  if (!check.ok && (check.error?.code === 'ENOENT' || check.stderr.includes('unknown command'))) {
    warn('`docker mcp` not found. Requires Docker Desktop 4.40+.')
    printDockerManual(catalogRef, serverRef)
    return
  }

  // ── create catalog with the server embedded ───────────────────────────────
  // docker mcp catalog create <oci-ref> --title <title> --server docker://<image>
  info(`Creating catalog "${catalogRef}" with server "${serverRef}" …`)
  const createResult = run('docker', [
    'mcp', 'catalog', 'create', catalogRef,
    '--title', 'Sticker Trade',
    '--server', serverRef,
  ])

  if (!createResult.ok) {
    if (createResult.stderr.includes('unknown command') || createResult.stderr.includes('unknown flag')) {
      warn(`docker mcp catalog create syntax mismatch (exit ${createResult.status}).`)
      printDockerManual(catalogRef, serverRef)
      return
    }
    // Local-only image: Docker MCP catalog requires images to be in a registry.
    // For local use, the direct docker run approach works without a catalog.
    if (createResult.stderr.includes('UNAUTHORIZED') ||
        createResult.stderr.includes('authentication required') ||
        createResult.stderr.includes('failed to resolve image') ||
        createResult.stderr.includes('not found')) {
      warn(`Image "${opts.image}" is local-only and not in a registry.`)
      warn(`Docker MCP Toolkit's catalog requires a registry-hosted image.`)
      console.log(`
  ${BOLD}Use the direct docker run approach instead:${RESET}

    Configure your MCP client with:`)
      const directSnippet = {
        mcpServers: {
          [opts.name]: {
            command: 'docker',
            args: dockerRunArgs(),
          },
        },
      }
      console.log(JSON.stringify(directSnippet, null, 2)
        .split('\n').map(l => '    ' + l).join('\n'))
      console.log()
      dim(`To use the Docker MCP Toolkit/Gateway, push the image to a registry:`)
      dim(`  docker tag ${opts.image} <registry>/<namespace>/${opts.image}:latest`)
      dim(`  docker push <registry>/<namespace>/${opts.image}:latest`)
      dim(`Then re-run: npm run mcp:install -- docker --image <registry>/<namespace>/${opts.image}:latest`)
      console.log()
      return
    }
    // "already exists" → try updating via server add
    if (createResult.stderr.toLowerCase().includes('already')) {
      info(`Catalog exists — adding/updating server entry …`)
      const addResult = run('docker', [
        'mcp', 'catalog', 'server', 'add', catalogRef,
        '--server', serverRef,
      ])
      if (!addResult.ok) {
        warn(`docker mcp catalog server add exited ${addResult.status}: ${addResult.stderr.trim()}`)
        warn('Gateway snippet below still works with the existing catalog.')
      } else {
        ok(`Server updated in catalog "${catalogRef}"`)
      }
    } else {
      warn(`docker mcp catalog create exited ${createResult.status}: ${createResult.stderr.trim()}`)
      printDockerManual(catalogRef, serverRef)
      return
    }
  } else {
    ok(`Catalog "${catalogRef}" created with server "${opts.image}"`)
  }

  // ── print gateway run + client snippet ────────────────────────────────────
  printDockerSuccess(catalogRef)
}

function printDockerManual(catalogRef, serverRef) {
  console.log(`
  Run these commands manually:

    docker mcp catalog create ${catalogRef} --title "Sticker Trade" --server ${serverRef}

  Then start the Gateway:
    docker mcp gateway run
`)
  printDockerSuccess(catalogRef)
}

function printDockerSuccess(catalogName) {
  console.log(`
  ${BOLD}Start the MCP Gateway:${RESET}
    docker mcp gateway run

  ${BOLD}Connect any MCP client to the Gateway (stdio):${RESET}`)
  const clientSnippet = {
    servers: {
      MCP_DOCKER: {
        type: 'stdio',
        command: 'docker',
        args: ['mcp', 'gateway', 'run'],
      },
    },
  }
  console.log(JSON.stringify(clientSnippet, null, 2)
    .split('\n').map(l => '    ' + l).join('\n'))
  console.log(`
  ${BOLD}For Claude Desktop specifically:${RESET}`)
  const claudeSnippet = {
    mcpServers: {
      MCP_DOCKER: {
        command: 'docker',
        args: ['mcp', 'gateway', 'run'],
      },
    },
  }
  console.log(JSON.stringify(claudeSnippet, null, 2)
    .split('\n').map(l => '    ' + l).join('\n'))
  console.log()
  dim(`Data is persisted in Docker volume "sticker-data" (mounted at /data).`)
  dim(`Verify catalog: docker mcp catalog show ${catalogName}`)
}

// ─── main ─────────────────────────────────────────────────────────────────────

console.log(`\n${BOLD}sticker-trade MCP installer${RESET}`)
console.log(`  mode   : ${opts.remove ? 'REMOVE' : 'INSTALL'}`)
console.log(`  targets: ${TARGETS.join(', ')}`)
console.log(`  image  : ${opts.image}`)
console.log(`  name   : ${opts.name}`)
console.log(`  volume : ${opts.volume}`)

const needsDocker = TARGETS.some(t => ['docker', 'opencode', 'copilot', 'vscode', 'claude'].includes(t))

if (!opts.remove) {
  // Preflight always for docker-dependent targets
  if (needsDocker) {
    heading('Preflight')
    preflight()
  }

  // Build unless skipped or only running the docker-catalog target
  if (!opts['skip-build']) {
    heading('Docker build')
    buildImage()
  } else {
    info('Skipping docker build (--skip-build)')
  }
}

for (const target of TARGETS) {
  switch (target) {
    case 'opencode': configureOpenCode(); break
    case 'copilot':  configureCopilot();  break
    case 'vscode':   configureVSCode();   break
    case 'claude':   configureClaude();   break
    case 'docker':   configureDocker();   break
  }
}

console.log(`\n${GREEN}${BOLD}Done.${RESET}\n`)
