/**
 * CLI adapter — thin layer over core/stickerService.
 * Uses node:util parseArgs — no extra dependencies.
 *
 * Commands:
 *   sticker-trade own [--text "..."] [--file path] [--list]   (stdin fallback)
 *   sticker-trade compare [--text "..."] [--file path]        (stdin fallback)
 */

import { parseArgs } from 'node:util'
import { readFile } from 'node:fs/promises'
import { setOwn, getOwn, compareWith } from '../core/stickerService.js'

const [, , command, ...argv] = process.argv

async function readInput(
  values: Record<string, string | boolean | string[] | undefined>,
): Promise<string> {
  if (typeof values['text'] === 'string') return values['text']
  if (typeof values['file'] === 'string') return readFile(values['file'], 'utf-8')
  // stdin fallback
  return readStdin()
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    process.stdin.setEncoding('utf-8')
    process.stdin.on('data', (chunk) => (data += chunk))
    process.stdin.on('end', () => resolve(data))
    process.stdin.on('error', reject)
  })
}

function die(msg: string): never {
  console.error(`Error: ${msg}`)
  process.exit(1)
}

function printUsage(): void {
  console.log(`
Usage:
  sticker-trade own [--text "BRA1,BRA2"] [--file list.txt]
  sticker-trade own --list
  sticker-trade compare [--text "BRA1,BRA3"] [--file their.txt]

  Stdin is used when neither --text nor --file is provided.
`.trim())
}

async function cmdOwn(): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      text: { type: 'string' },
      file: { type: 'string' },
      list: { type: 'boolean', default: false },
    },
    strict: false,
  })

  if (values['list']) {
    const record = await getOwn()
    if (record.stickers.length === 0) {
      console.log('No stickers saved yet.')
    } else {
      console.log(`Your stickers (${record.stickers.length}):`)
      console.log(record.stickers.join(', '))
    }
    return
  }

  const text = await readInput(values)
  const result = await setOwn(text)

  if (!result.saved) {
    console.log(`No changes — collection unchanged (${result.count} stickers).`)
  } else {
    console.log(`Saved ${result.count} stickers:`)
    console.log(result.stickers.join(', '))
  }
}

async function cmdCompare(): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      text: { type: 'string' },
      file: { type: 'string' },
    },
    strict: false,
  })

  const text = await readInput(values)
  const result = await compareWith(text)

  if (result.count === 0) {
    console.log('You already have everything the other person has.')
  } else {
    console.log(`Stickers you can receive (${result.count}):`)
    console.log(result.missing.join(', '))
  }
}

async function main(): Promise<void> {
  switch (command) {
    case 'own':
      await cmdOwn()
      break
    case 'compare':
      await cmdCompare()
      break
    default:
      printUsage()
      if (command && command !== '--help' && command !== '-h') {
        die(`Unknown command: ${command}`)
      }
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
