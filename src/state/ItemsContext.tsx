import { createContext, useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Item, SpinResult } from '../lib/types'
import { loadHistory, pushHistory, clearHistory as wipeHistory } from '../lib/storage'

export interface ItemsState {
  items: Item[]
  setItems: (items: Item[]) => void
  sourceName: string
  setSourceName: (name: string) => void
  history: SpinResult[]
  recordResult: (result: Omit<SpinResult, 'at'>) => void
  clearHistory: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const ItemsCtx = createContext<ItemsState | null>(null)

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const [sourceName, setSourceName] = useState('')
  const [history, setHistory] = useState<SpinResult[]>(() => loadHistory())

  const recordResult = useCallback((result: Omit<SpinResult, 'at'>) => {
    const full: SpinResult = { ...result, at: Date.now() }
    pushHistory(full)
    setHistory((h) => [full, ...h].slice(0, 50))
  }, [])

  const clearHistory = useCallback(() => {
    wipeHistory()
    setHistory([])
  }, [])

  const value = useMemo(
    () => ({ items, setItems, sourceName, setSourceName, history, recordResult, clearHistory }),
    [items, sourceName, history, recordResult, clearHistory],
  )
  return <ItemsCtx.Provider value={value}>{children}</ItemsCtx.Provider>
}
