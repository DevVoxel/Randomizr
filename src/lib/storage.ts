import type { Item, SavedList, SpinResult } from './types'

const LISTS_KEY = 'randomizr.lists.v1'
const HISTORY_KEY = 'randomizr.history.v1'
const HISTORY_MAX = 50

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable - data stays in-memory only
  }
}

export function loadLists(): SavedList[] {
  return read<SavedList[]>(LISTS_KEY, [])
}

export function saveList(name: string, items: Item[], id?: string): SavedList {
  const lists = loadLists()
  const now = Date.now()
  // images as data URLs blow past localStorage quotas - strip them on save
  const slim = items.map(({ image, ...rest }) =>
    image && image.startsWith('data:') ? rest : { ...rest, image },
  )
  const existing = id ? lists.find((l) => l.id === id) : undefined
  if (existing) {
    existing.name = name
    existing.items = slim
    existing.updatedAt = now
    write(LISTS_KEY, lists)
    return existing
  }
  const list: SavedList = { id: crypto.randomUUID(), name, items: slim, createdAt: now, updatedAt: now }
  write(LISTS_KEY, [list, ...lists])
  return list
}

export function deleteList(id: string) {
  write(LISTS_KEY, loadLists().filter((l) => l.id !== id))
}

export function loadHistory(): SpinResult[] {
  return read<SpinResult[]>(HISTORY_KEY, [])
}

export function pushHistory(result: SpinResult) {
  const next = [result, ...loadHistory()].slice(0, HISTORY_MAX)
  // drop data-URL images from history too
  write(HISTORY_KEY, next.map(({ image, ...rest }) =>
    image && image.startsWith('data:') ? rest : { ...rest, image },
  ))
}

export function clearHistory() {
  write(HISTORY_KEY, [])
}
