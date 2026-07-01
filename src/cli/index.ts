import { parseArgs } from 'node:util'
import { readFile } from 'node:fs/promises'
import { setOwn, getOwn, compareWith, getExtras, addSurplus } from '../core/stickerService.js'
import { codesOf } from '../domain/inventory.js'

const [, , command, ...argv] = process.argv

function die(msg: string): never {
  console.error(`Error: ${msg}`)
  process.exit(1)
}

function printUsage(): void {
  console.log(`
Usage:
  sticker-trade own --text "BRA1,BRA2" | --file list.txt | --list
  sticker-trade compare --text "BRA1,BRA3" | --file their.txt
  sticker-trade surplus --text "RSA5 (x1)" | --file surplus.txt
  sticker-trade extras
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
    const stickers = codesOf(record.inv)
    if (stickers.length === 0) {
      console.log('No stickers saved yet.')
    } else {
      const total = Object.values(record.inv).reduce((a, b) => a + b, 0)
      console.log(`Your stickers (${total} copies of ${stickers.length} unique):`)
      for (const code of stickers) {
        const qty = record.inv[code]
        console.log(`  ${code}${qty > 1 ? ` x${qty}` : ''}`)
      }
    }
    return
  }

  const text = typeof values['text'] === 'string'
    ? values['text']
    : typeof values['file'] === 'string'
      ? await readFile(values['file'], 'utf-8')
      : die('Either --text or --file is required')
  const result = await setOwn(text)

  if (!result.saved) {
    console.log(`No changes — collection unchanged (${result.count} unique stickers, ${result.totalCopies} total copies).`)
  } else {
    console.log(`Saved ${result.count} unique stickers (${result.totalCopies} total copies):`)
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

  const text = typeof values['text'] === 'string'
    ? values['text']
    : typeof values['file'] === 'string'
      ? await readFile(values['file'], 'utf-8')
      : die('Either --text or --file is required')
  const result = await compareWith(text)

  if (result.count === 0) {
    console.log('You already have everything the other person has.')
  } else {
    console.log(`Stickers you can receive (${result.count}):`)
    console.log(result.missing.join(', '))
  }
}

async function cmdSurplus(): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      text: { type: 'string' },
      file: { type: 'string' },
    },
    strict: false,
  })

  const text = typeof values['text'] === 'string'
    ? values['text']
    : typeof values['file'] === 'string'
      ? await readFile(values['file'], 'utf-8')
      : die('Either --text or --file is required')
  const result = await addSurplus(text)

  if (result.count === 0) {
    console.log('No surplus changes — collection unchanged.')
  } else {
    console.log(`Updated ${result.count} stickers with surplus:`)
    for (const code of result.updated) {
      const record = await getOwn()
      console.log(`  ${code} x${record.inv[code]}`)
    }
  }
}

async function cmdExtras(): Promise<void> {
  const result = await getExtras()
  if (result.totalUnique === 0) {
    console.log('No extra stickers (all owned in single copies).')
  } else {
    console.log(`Extra stickers (${result.totalUnique} codes, ${result.totalSurplus} surplus):`)
    for (const item of result.items) {
      console.log(`  ${item.code} x${item.qty} (surplus: ${item.surplus})`)
    }
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
    case 'surplus':
      await cmdSurplus()
      break
    case 'extras':
      await cmdExtras()
      break
    default:
      printUsage()
      if (command && command !== '--help' && command !== '-h') {
        die(`Unknown command: ${command}`)
      }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Unexpected error:', err instanceof Error ? err.message : String(err))
    process.exit(1)
  })
