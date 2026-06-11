import type { Item } from './types'
import { makeItem } from './types'
import { fetchViaProxy } from './proxy'

export const GOODREADS_SHELVES = ['to-read', 'currently-reading', 'read'] as const
export type GoodreadsShelf = (typeof GOODREADS_SHELVES)[number]

/**
 * Goodreads killed its API in 2020, but per-shelf RSS feeds still work:
 * goodreads.com/review/list_rss/<userId>?shelf=<shelf>
 * Accepts a raw numeric id or a pasted profile URL like
 * goodreads.com/user/show/12345-jane-doe.
 */
export async function fetchGoodreadsShelf(userIdOrUrl: string, shelf: GoodreadsShelf): Promise<Item[]> {
  const id = /(\d{3,})/.exec(userIdOrUrl.trim())?.[1]
  if (!id) throw new Error('Need a Goodreads user id or profile URL')
  const xml = await fetchViaProxy(`https://www.goodreads.com/review/list_rss/${id}?shelf=${shelf}`)
  const items = parseRss(xml)
  if (!items.length) throw new Error(`Shelf "${shelf}" is empty or the profile is private`)
  return items
}

function parseRss(xml: string): Item[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  if (doc.querySelector('parsererror')) return []
  return [...doc.querySelectorAll('item')].flatMap((node) => {
    const title = node.querySelector('title')?.textContent?.trim()
    if (!title) return []
    const author = node.getElementsByTagName('author_name')[0]?.textContent?.trim()
    const image = node.getElementsByTagName('book_medium_image_url')[0]?.textContent?.trim()
    return [makeItem(title, { meta: author || undefined, image: image || undefined })]
  })
}
