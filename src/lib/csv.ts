import type { Item } from './types'
import { makeItem } from './types'

/** RFC-4180-ish parser; handles quoted fields, escaped quotes, CRLF. */
export function parseCsv(text: string, delim = ','): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') inQuotes = false
      else field += c
    } else if (c === '"') inQuotes = true
    else if (c === delim) { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((f) => f.trim())) rows.push(row)
      row = []
    } else field += c
  }
  row.push(field)
  if (row.some((f) => f.trim())) rows.push(row)
  return rows
}

/** Parses CSV or TSV, picking the delimiter that yields more columns. */
export function parseDelimited(text: string): string[][] {
  const comma = parseCsv(text, ',')
  const tab = parseCsv(text, '\t')
  const width = (rows: string[][]) => (rows[0]?.length ?? 0)
  return width(tab) > width(comma) ? tab : comma
}

/**
 * Heuristic: a first row with no numeric-only cells and no empty cells is
 * probably a header ("Name,Year" yes; "Pulp Fiction,1994" no).
 */
export function looksLikeHeader(rows: string[][]): boolean {
  const first = rows[0]
  if (!first || rows.length < 2) return false
  return first.every((cell) => cell.trim() !== '' && !/^[\d.,/\s-]+$/.test(cell.trim()))
}

/** Builds items from one column of a parsed sheet. */
export function columnToItems(rows: string[][], col: number, skipHeader: boolean): Item[] {
  return rows
    .slice(skipHeader ? 1 : 0)
    .flatMap((r) => (r[col]?.trim() ? [makeItem(r[col])] : []))
}

/**
 * Turns a Google Sheets share link into its CSV export URL (which serves
 * with open CORS, unlike the sheet page itself). Returns null for
 * non-Sheets URLs.
 */
export function sheetsCsvUrl(url: string): string | null {
  const m = /docs\.google\.com\/spreadsheets\/d\/(e\/)?([\w-]+)/.exec(url.trim())
  if (!m) return null
  const id = m[2]
  const gid = /[#&?]gid=(\d+)/.exec(url)?.[1] ?? '0'
  // "publish to web" links (/d/e/…) use a different export route
  if (m[1]) return `https://docs.google.com/spreadsheets/d/e/${id}/pub?output=csv&gid=${gid}`
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`
}

export async function fetchSheetCsv(url: string): Promise<string> {
  const csvUrl = sheetsCsvUrl(url)
  if (!csvUrl) throw new Error('Not a Google Sheets link')
  const res = await fetch(csvUrl, { signal: AbortSignal.timeout(15_000) })
  if (!res.ok) {
    throw new Error(
      res.status === 401 || res.status === 403 || res.status === 404
        ? 'Sheet is private. Set sharing to "Anyone with the link"'
        : `Sheet fetch failed (HTTP ${res.status})`,
    )
  }
  return res.text()
}
