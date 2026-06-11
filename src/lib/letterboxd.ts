import type { Item } from './types'
import { makeItem } from './types'
import { parseCsv } from './csv'
import { fetchViaProxy } from './proxy'

/**
 * Letterboxd has no public API and blocks cross-origin requests, so we fetch
 * the user's public RSS feed through a CORS proxy. Falls back to CSV import
 * (Letterboxd Settings → Data → Export) which works offline.
 */
export async function fetchLetterboxdRss(username: string): Promise<Item[]> {
  const user = username.trim().replace(/^@/, '')
  if (!/^[\w-]+$/.test(user)) throw new Error('Invalid username')
  const xml = await fetchViaProxy(`https://letterboxd.com/${user}/rss/`)
  const items = parseRss(xml)
  if (!items.length) throw new Error('Feed empty. Diary may be private or unused')
  return items
}

function parseRss(xml: string): Item[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  if (doc.querySelector('parsererror')) return []
  return [...doc.querySelectorAll('item')].flatMap((node) => {
    const film = node.getElementsByTagName('letterboxd:filmTitle')[0]?.textContent
    const year = node.getElementsByTagName('letterboxd:filmYear')[0]?.textContent
    const title = film ?? node.querySelector('title')?.textContent
    if (!title) return []
    // poster URL hides inside the description HTML
    const desc = node.querySelector('description')?.textContent ?? ''
    const image = /<img[^>]+src="([^"]+)"/.exec(desc)?.[1]
    return [makeItem(title, { meta: year ?? undefined, image })]
  })
}

/** Parses Letterboxd export CSVs (watchlist.csv / watched.csv: Date,Name,Year,Letterboxd URI) */
export function parseLetterboxdCsv(text: string): Item[] {
  const rows = parseCsv(text)
  if (!rows.length) return []
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const nameIdx = header.indexOf('name')
  const yearIdx = header.indexOf('year')
  if (nameIdx === -1) {
    // not a letterboxd export - treat first column as titles
    return rows.flatMap((r) => (r[0]?.trim() ? [makeItem(r[0])] : []))
  }
  return rows.slice(1).flatMap((r) => {
    const name = r[nameIdx]?.trim()
    if (!name) return []
    return [makeItem(name, { meta: r[yearIdx]?.trim() || undefined })]
  })
}
