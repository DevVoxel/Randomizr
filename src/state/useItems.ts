import { useContext } from 'react'
import { ItemsCtx } from './ItemsContext'
import type { ItemsState } from './ItemsContext'

export function useItems(): ItemsState {
  const ctx = useContext(ItemsCtx)
  if (!ctx) throw new Error('useItems must be used inside ItemsProvider')
  return ctx
}
