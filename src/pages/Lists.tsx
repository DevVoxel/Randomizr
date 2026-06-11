import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { SavedList } from '../lib/types'
import { loadLists, deleteList } from '../lib/storage'
import { useItems } from '../state/useItems'

export default function Lists() {
  const [lists, setLists] = useState<SavedList[]>(() => loadLists())
  const { setItems, setSourceName } = useItems()
  const navigate = useNavigate()

  const use = (list: SavedList) => {
    setItems(list.items)
    setSourceName(list.name)
    navigate('/randomize/wheel')
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-brand text-5xl">My Lists</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Saved in this browser, nowhere else. Load one into any method.
      </p>

      {lists.length === 0 ? (
        <div className="mt-12 ink-card p-12 text-center">
          <div className="halftone-faint size-16 mx-auto mb-5" aria-hidden />
          <p className="font-semibold">Nothing here yet.</p>
          <p className="text-sm mt-1 text-muted-foreground">
            Build a list on any method page, then hit Save in the Saved tab.
          </p>
          <Link to="/randomize/wheel" className="btn-ink mt-8 inline-block px-6 py-2.5 font-semibold">
            Start a list
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {lists.map((list) => (
            <div key={list.id} className="ink-card hard-shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-brand text-2xl">{list.name}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    ×{list.items.length} · updated {new Date(list.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => { deleteList(list.id); setLists(loadLists()) }}
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:line-through"
                  aria-label={`Delete ${list.name}`}
                >
                  del
                </button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {list.items.slice(0, 8).map((i) => i.label).join(', ')}
                {list.items.length > 8 && '…'}
              </p>
              <button onClick={() => use(list)} className="btn-paper self-start px-4 py-1.5 text-sm font-semibold">
                Randomize →
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
