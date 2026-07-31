import { ZstdInit, ZstdSimple } from '@oneidentity/zstd-js'

let ready: Promise<void> | null = null

function init(): Promise<void> {
  if (!ready) {
    ready = ZstdInit().then(() => {})
  }
  return ready
}

function toBase64(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s)
}

function fromBase64(s: string): Uint8Array {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

const MIN_INPUT = 101

export async function compress(data: string): Promise<string> {
  await init()
  let buf = data
  if (buf.length < MIN_INPUT) {
    buf = data + "\0".repeat(MIN_INPUT - data.length)
  }
  const input = new TextEncoder().encode(buf)
  const compressed = ZstdSimple.compress(input)
  return toBase64(compressed)
}

export async function decompress(data: string): Promise<string> {
  await init()
  const input = fromBase64(data)
  const decompressed = ZstdSimple.decompress(input)
  let result = new TextDecoder().decode(decompressed)
  result = result.replace(/\0+$/, "")
  return result
}
