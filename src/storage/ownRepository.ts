/**
 * Persistence layer for the user's own sticker collection.
 *
 * Files:
 *   {DATA_DIR}/own.json             — current state (always up to date)
 *   {DATA_DIR}/own_YYYYMMDD.json    — dated snapshot (written when hash changes)
 *
 * Write policy: only write if the sha256 hash of the sorted sticker list changes.
 */

import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export interface OwnRecord {
  stickers: string[]
  hash: string
  updatedAt: string
}

const EMPTY: OwnRecord = { stickers: [], hash: '', updatedAt: '' }

function dataDir(): string {
  return process.env['DATA_DIR'] ?? './data'
}

function computeHash(stickers: string[]): string {
  return createHash('sha256')
    .update(JSON.stringify([...stickers].sort()))
    .digest('hex')
}

function dateSuffix(): string {
  // YYYYMMDD in local time
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true })
}

/**
 * Load the current own.json. Returns EMPTY if file doesn't exist.
 */
export async function load(dir?: string): Promise<OwnRecord> {
  const base = dir ?? dataDir()
  const file = join(base, 'own.json')
  try {
    const raw = await readFile(file, 'utf-8')
    return JSON.parse(raw) as OwnRecord
  } catch (err: unknown) {
    if (isNodeError(err) && err.code === 'ENOENT') return { ...EMPTY }
    throw err
  }
}

/**
 * Save stickers to own.json (and dated snapshot) only if hash has changed.
 * Returns true if written, false if skipped (no change).
 */
export async function save(stickers: string[], dir?: string): Promise<boolean> {
  const base = dir ?? dataDir()
  const newHash = computeHash(stickers)

  const current = await load(base)
  if (current.hash === newHash) return false

  await ensureDir(base)

  const record: OwnRecord = {
    stickers: [...stickers].sort(),
    hash: newHash,
    updatedAt: new Date().toISOString(),
  }

  const json = JSON.stringify(record, null, 2)
  await writeFile(join(base, 'own.json'), json, 'utf-8')
  await writeFile(join(base, `own_${dateSuffix()}.json`), json, 'utf-8')

  return true
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err
}
