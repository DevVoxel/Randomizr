import type { Item } from './types'
import { makeItem } from './types'

/**
 * Lists travel between people as a ?share= URL param: UTF-8-safe base64 of
 * [label, meta?] tuples. Data-URL images are dropped (megabytes), http image
 * URLs are kept. Encoding fails past ~6 KB — URLs have practical limits.
 */
const MAX_ENCODED = 6_000

type Packed = [string, string?, string?] // label, meta, image-url

export function encodeShare(items: Item[], name: string): string {
  const packed: Packed[] = items.map((i) => {
    const tuple: Packed = [i.label]
    if (i.meta) tuple[1] = i.meta
    if (i.image && /^https?:/.test(i.image)) tuple[2] = i.image
    return tuple
  })
  const json = JSON.stringify({ n: name, i: packed })
  const b64 = bytesToB64(new TextEncoder().encode(json))
  if (b64.length > MAX_ENCODED) {
    // retry without images, then give up
    const slim = JSON.stringify({ n: name, i: packed.map((t) => t.slice(0, 2)) })
    const slimB64 = bytesToB64(new TextEncoder().encode(slim))
    if (slimB64.length > MAX_ENCODED) throw new Error('List too long to fit in a link')
    return slimB64
  }
  return b64
}

export function decodeShare(param: string): { items: Item[]; name: string } | null {
  try {
    const json = new TextDecoder().decode(b64ToBytes(param))
    const data = JSON.parse(json) as { n?: unknown; i?: unknown }
    if (!Array.isArray(data.i)) return null
    const items = (data.i as Packed[]).flatMap((t) => {
      const label = typeof t?.[0] === 'string' ? t[0].trim() : ''
      if (!label) return []
      return [makeItem(label, { meta: t[1] || undefined, image: t[2] || undefined })]
    })
    if (!items.length) return null
    return { items, name: typeof data.n === 'string' && data.n ? data.n : 'Shared list' }
  } catch {
    return null
  }
}

function bytesToB64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  // url-safe alphabet
  return btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function b64ToBytes(s: string): Uint8Array {
  const bin = atob(s.replaceAll('-', '+').replaceAll('_', '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}
