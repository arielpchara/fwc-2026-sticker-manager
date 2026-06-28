/**
 * Core use cases — orchestrates domain, parser, and storage.
 * Has no knowledge of CLI or MCP transports.
 * Takes an injected repository for testability.
 */

import { parseText } from '../parser/textParser.js'
import { missing, dedupe } from '../domain/collection.js'
import { load, save, type OwnRecord } from '../storage/ownRepository.js'

export interface Repository {
  load(dir?: string): Promise<OwnRecord>
  save(stickers: string[], dir?: string): Promise<boolean>
}

export interface SetOwnResult {
  stickers: string[]
  count: number
  saved: boolean
}

export interface CompareResult {
  missing: string[]
  count: number
}

const defaultRepo: Repository = { load, save }

/**
 * Parse text and save as the user's own sticker collection.
 * Idempotent: no write if the parsed content matches current state.
 */
export async function setOwn(
  text: string,
  repo: Repository = defaultRepo,
): Promise<SetOwnResult> {
  const stickers = dedupe(parseText(text))
  const saved = await repo.save(stickers)
  return { stickers, count: stickers.length, saved }
}

/**
 * Return the current sticker collection.
 */
export async function getOwn(repo: Repository = defaultRepo): Promise<OwnRecord> {
  return repo.load()
}

/**
 * Parse another person's text and return stickers they have that the user doesn't.
 */
export async function compareWith(
  theirText: string,
  repo: Repository = defaultRepo,
): Promise<CompareResult> {
  const current = await repo.load()
  const theirs = parseText(theirText)
  const result = missing(current.stickers, theirs)
  return { missing: result, count: result.length }
}
