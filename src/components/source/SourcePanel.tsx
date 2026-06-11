import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import type { Item, SavedList } from '../../lib/types'
import { makeItem } from '../../lib/types'
import { PRESETS, presetItems } from '../../lib/presets'
import { fetchLetterboxdRss, parseLetterboxdCsv } from '../../lib/letterboxd'
import { GOODREADS_SHELVES, fetchGoodreadsShelf, type GoodreadsShelf } from '../../lib/goodreads'
import { parseDelimited, looksLikeHeader, columnToItems, fetchSheetCsv } from '../../lib/csv'
import { encodeShare } from '../../lib/share'
import { loadLists, saveList, deleteList } from '../../lib/storage'
import { useItems } from '../../state/useItems'

type Tab = 'list' | 'presets' | 'images' | 'sheet' | 'services' | 'saved'

const TABS: { id: Tab; label: string }[] = [
  { id: 'list', label: 'Type' },
  { id: 'presets', label: 'Presets' },
  { id: 'images', label: 'Images' },
  { id: 'sheet', label: 'Sheet' },
  { id: 'services', label: 'Watchlists' },
  { id: 'saved', label: 'Saved' },
]

export default function SourcePanel() {
  const { items, setItems, sourceName, setSourceName } = useItems()
  const [tab, setTab] = useState<Tab>('list')
  const [params] = useSearchParams()

  // ?preset=movies deep-link from Home
  useEffect(() => {
    const presetId = params.get('preset')
    if (!presetId || items.length) return
    const preset = PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setItems(presetItems(preset))
      setSourceName(preset.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="ink-card hard-shadow-sm flex flex-col">
      <div className="flex flex-wrap border-b-2 border-foreground">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-2.5 py-1.5 text-xs border-r-2 border-foreground last:border-r-0 ${
              tab === t.id
                ? 'bg-foreground text-background font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {tab === 'list' && <ListTab />}
        {tab === 'presets' && <PresetsTab />}
        {tab === 'images' && <ImagesTab />}
        {tab === 'sheet' && <SheetTab />}
        {tab === 'services' && <ServicesTab />}
        {tab === 'saved' && <SavedTab />}

        {items.length > 0 && (
          <CurrentItems
            items={items}
            sourceName={sourceName}
            onRemove={(id) => setItems(items.filter((i) => i.id !== id))}
            onClear={() => { setItems([]); setSourceName('') }}
          />
        )}
      </div>
    </div>
  )
}

function ListTab() {
  const { items, setItems, setSourceName } = useItems()
  const [text, setText] = useState('')

  const apply = () => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) return
    setItems([...items, ...lines.map((l) => makeItem(l))])
    setSourceName('Typed list')
    setText('')
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'One per line…\nPizza\nSushi\nTacos'}
        rows={5}
        className="num-input text-sm resize-y"
      />
      <button onClick={apply} disabled={!text.trim()} className="btn-paper self-end px-4 py-1.5 text-sm font-semibold">
        Add items
      </button>
    </div>
  )
}

function PresetsTab() {
  const { setItems, setSourceName } = useItems()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          onClick={() => { setItems(presetItems(p)); setSourceName(p.name) }}
          className="text-left border-2 border-dashed border-foreground hover:border-solid hover:bg-muted px-3 py-2 transition-colors"
        >
          <div className="font-semibold text-sm">{p.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            ×{p.items.length} · {p.description}
          </div>
        </button>
      ))}
    </div>
  )
}

function ImagesTab() {
  const { items, setItems, setSourceName } = useItems()
  const [url, setUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const addUrl = () => {
    const u = url.trim()
    if (!u) return
    const label = decodeURIComponent(u.split('/').pop()?.split('?')[0] ?? 'Image').replace(/\.[a-z0-9]+$/i, '')
    setItems([...items, makeItem(label || 'Image', { image: u })])
    setSourceName('Images')
    setUrl('')
  }

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return
    const list = [...files].filter((f) => f.type.startsWith('image/'))
    Promise.all(
      list.map(
        (f) =>
          new Promise<Item>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(makeItem(f.name.replace(/\.[a-z0-9]+$/i, ''), { image: String(reader.result) }))
            reader.readAsDataURL(f)
          }),
      ),
    ).then((newItems) => {
      setItems([...items, ...newItems])
      setSourceName('Images')
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-foreground hover:bg-muted py-6 text-sm text-muted-foreground transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
      >
        Drop images here, or click
      </button>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addUrl()}
          placeholder="…or paste an image URL"
          className="num-input flex-1 text-sm"
        />
        <button onClick={addUrl} disabled={!url.trim()} className="btn-paper px-4 text-sm font-semibold">
          Add
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Images stay in your browser. Nothing is uploaded anywhere.
      </p>
    </div>
  )
}

function SheetTab() {
  const { setItems, setSourceName } = useItems()
  const [rows, setRows] = useState<string[][] | null>(null)
  const [source, setSource] = useState('')
  const [col, setCol] = useState(0)
  const [skipHeader, setSkipHeader] = useState(false)
  const [sheetUrl, setSheetUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const loadText = (text: string, name: string) => {
    const parsed = parseDelimited(text)
    if (!parsed.length || !parsed.some((r) => r.some((c) => c.trim()))) {
      setError('Nothing readable in there')
      return
    }
    setError('')
    setRows(parsed)
    setSource(name)
    setCol(0)
    setSkipHeader(looksLikeHeader(parsed))
  }

  const onFile = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    file.text().then((text) => loadText(text, file.name))
  }

  const fetchSheet = async () => {
    setLoading(true)
    setError('')
    try {
      const text = await fetchSheetCsv(sheetUrl)
      loadText(text, 'Google Sheet')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }

  const preview = useMemo(() => (rows ? columnToItems(rows, col, skipHeader) : []), [rows, col, skipHeader])
  const colCount = rows?.[0]?.length ?? 0

  const apply = () => {
    if (!preview.length) return
    setItems(preview)
    setSourceName(source)
    setRows(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files) }}
        className="border-2 border-dashed border-foreground hover:bg-muted py-5 text-sm text-muted-foreground transition-colors"
      >
        Drop a .csv / .tsv here, or click
      </button>
      <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" hidden onChange={(e) => onFile(e.target.files)} />

      <div className="flex gap-2">
        <input
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sheetUrl.trim() && fetchSheet()}
          placeholder="…or a Google Sheets link"
          className="num-input flex-1 text-sm"
        />
        <button onClick={fetchSheet} disabled={!sheetUrl.trim() || loading} className="btn-paper px-4 text-sm font-semibold">
          {loading ? <Loader2 className="size-4 animate-spin" /> : 'Fetch'}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Sheets need link-sharing on ("Anyone with the link"). Excel users: save as CSV first.
      </p>

      {rows && (
        <div className="border-t-2 border-dotted border-muted-foreground/50 pt-3 flex flex-col gap-2">
          {colCount > 1 && (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground shrink-0">Column:</span>
              <select value={col} onChange={(e) => setCol(Number(e.target.value))} className="num-input flex-1 text-sm">
                {rows[0].map((cell, i) => (
                  <option key={i} value={i}>
                    {i + 1}: {(cell || '(empty)').slice(0, 30)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={skipHeader} onChange={(e) => setSkipHeader(e.target.checked)} className="accent-current size-4" />
            First row is a header
          </label>
          <button onClick={apply} disabled={!preview.length} className="btn-ink self-start px-4 py-1.5 text-sm font-semibold">
            Use {preview.length} items
          </button>
        </div>
      )}
      {error && <p className="text-xs font-semibold underline decoration-wavy">{error}</p>}
    </div>
  )
}

function ServicesTab() {
  const { setItems, setSourceName } = useItems()
  const [lbUser, setLbUser] = useState('')
  const [grUser, setGrUser] = useState('')
  const [shelf, setShelf] = useState<GoodreadsShelf>('to-read')
  const [loading, setLoading] = useState<'lb' | 'gr' | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchLb = async () => {
    setLoading('lb')
    setError('')
    try {
      const films = await fetchLetterboxdRss(lbUser)
      setItems(films)
      setSourceName(`Letterboxd: ${lbUser.trim()}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setLoading(null)
    }
  }

  const fetchGr = async () => {
    setLoading('gr')
    setError('')
    try {
      const books = await fetchGoodreadsShelf(grUser, shelf)
      setItems(books)
      setSourceName(`Goodreads: ${shelf}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setLoading(null)
    }
  }

  const importCsv = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    file.text().then((text) => {
      const films = parseLetterboxdCsv(text)
      if (!films.length) {
        setError('No films found in that file')
        return
      }
      setError('')
      setItems(films)
      setSourceName(`Letterboxd: ${file.name}`)
    })
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <section className="flex flex-col gap-2">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Letterboxd</h3>
        <div className="flex gap-2">
          <input
            value={lbUser}
            onChange={(e) => setLbUser(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lbUser.trim() && fetchLb()}
            placeholder="username"
            className="num-input flex-1 text-sm"
          />
          <button onClick={fetchLb} disabled={!lbUser.trim() || loading !== null} className="btn-paper px-4 text-sm font-semibold">
            {loading === 'lb' ? <Loader2 className="size-4 animate-spin" /> : 'Fetch'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Recent diary/watchlist activity via public RSS. For the full watchlist,
          export from Settings → Data and import the CSV:
        </p>
        <button onClick={() => fileRef.current?.click()} className="btn-paper px-3 py-1.5 text-sm">
          Import watchlist.csv
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => importCsv(e.target.files)} />
      </section>

      <section className="flex flex-col gap-2 border-t-2 border-dotted border-muted-foreground/50 pt-3">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Goodreads</h3>
        <input
          value={grUser}
          onChange={(e) => setGrUser(e.target.value)}
          placeholder="profile URL or user id"
          className="num-input text-sm"
        />
        <div className="flex gap-2">
          <select value={shelf} onChange={(e) => setShelf(e.target.value as GoodreadsShelf)} className="num-input flex-1 text-sm">
            {GOODREADS_SHELVES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={fetchGr} disabled={!grUser.trim() || loading !== null} className="btn-paper px-4 text-sm font-semibold">
            {loading === 'gr' ? <Loader2 className="size-4 animate-spin" /> : 'Fetch'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Shelf RSS. Works while your profile is public.</p>
      </section>

      {error && <p className="text-xs font-semibold underline decoration-wavy">{error}</p>}
    </div>
  )
}

function SavedTab() {
  const { items, setItems, sourceName, setSourceName } = useItems()
  const [lists, setLists] = useState<SavedList[]>(() => loadLists())
  const [name, setName] = useState('')

  const save = () => {
    const listName = name.trim() || sourceName || `List of ${items.length}`
    saveList(listName, items)
    setLists(loadLists())
    setName('')
  }

  return (
    <div className="flex flex-col gap-3">
      {items.length > 0 && (
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Name current list (${items.length} items)`}
            className="num-input flex-1 text-sm"
          />
          <button onClick={save} className="btn-paper px-4 text-sm font-semibold">
            Save
          </button>
        </div>
      )}
      {lists.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing saved yet. Build a list, name it, keep it.</p>
      ) : (
        <div className="flex flex-col max-h-56 overflow-y-auto divide-y divide-dotted divide-muted-foreground/40">
          {lists.map((l) => (
            <div key={l.id} className="flex items-center gap-2 py-2">
              <button
                onClick={() => { setItems(l.items); setSourceName(l.name) }}
                className="flex-1 text-left text-sm font-medium hover:underline underline-offset-2"
              >
                {l.name}
                <span className="text-xs text-muted-foreground ml-2">×{l.items.length}</span>
              </button>
              <button
                onClick={() => { deleteList(l.id); setLists(loadLists()) }}
                className="text-xs text-muted-foreground hover:text-foreground hover:line-through"
                aria-label={`Delete ${l.name}`}
              >
                del
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CurrentItems({
  items, sourceName, onRemove, onClear,
}: {
  items: Item[]
  sourceName: string
  onRemove: (id: string) => void
  onClear: () => void
}) {
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'too-long'>('idle')

  const share = async () => {
    try {
      const code = encodeShare(items, sourceName || 'Shared list')
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}?share=${code}`)
      setShareState('copied')
    } catch {
      setShareState('too-long')
    }
    window.setTimeout(() => setShareState('idle'), 2000)
  }

  return (
    <div className="border-t-2 border-foreground pt-3 -mx-4 px-4">
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground truncate">
          {sourceName || 'Current list'} ×{items.length}
        </span>
        <span className="flex gap-3 text-[10px] uppercase tracking-[0.15em] shrink-0">
          <button onClick={share} className="text-muted-foreground hover:text-foreground hover:underline">
            {shareState === 'copied' ? 'link copied' : shareState === 'too-long' ? 'too long for a link' : 'share'}
          </button>
          <button onClick={onClear} className="text-muted-foreground hover:text-foreground hover:line-through">
            clear
          </button>
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
        {items.map((item) => (
          <span key={item.id} className="inline-flex items-center gap-1 border border-foreground pl-2 pr-1 py-0.5 text-xs">
            {item.image && <img src={item.image} alt="" className="size-4 object-cover" />}
            {item.label}
            {item.meta && <span className="text-muted-foreground">({item.meta})</span>}
            <button onClick={() => onRemove(item.id)} className="px-0.5 text-muted-foreground hover:text-foreground" aria-label={`Remove ${item.label}`}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
