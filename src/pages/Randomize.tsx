import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import type { Item, MethodId } from '../lib/types'
import { METHODS, getMethod } from '../lib/types'
import { decodeShare, decodeResult, type SharedResult } from '../lib/share'
import { useItems } from '../state/useItems'
import SourcePanel from '../components/source/SourcePanel'
import { HistoryPanel } from '../components/ResultBanner'
import Wheel from '../components/methods/Wheel'
import Cards from '../components/methods/Cards'
import Slots from '../components/methods/Slots'
import Ladder from '../components/methods/Ladder'
import Bracket from '../components/methods/Bracket'
import Teams from '../components/methods/Teams'
import Straws from '../components/methods/Straws'
import Eeny from '../components/methods/Eeny'
import SortRace from '../components/methods/SortRace'
import Plinko from '../components/methods/Plinko'
import Bottle from '../components/methods/Bottle'
import Balloons from '../components/methods/Balloons'
import Marbles from '../components/methods/Marbles'
import EightBall from '../components/methods/EightBall'
import Dice from '../components/methods/Dice'
import NumberGen from '../components/methods/NumberGen'
import Coin from '../components/methods/Coin'
import Timeline from '../components/methods/Timeline'

export default function Randomize() {
  const { method: methodId } = useParams()
  const method = getMethod(methodId)
  const { items, setItems, setSourceName, recordResult } = useItems()
  const [params, setParams] = useSearchParams()
  // ?result= carries a single verdict; decoded once at mount, URL cleaned below
  const [sharedResult] = useState<SharedResult | null>(() => {
    const r = new URLSearchParams(window.location.search).get('result')
    return r ? decodeResult(r) : null
  })

  // ?share= carries a whole list; read once, then clean both params off the URL
  useEffect(() => {
    const share = params.get('share')
    if (!share && !params.get('result')) return
    if (share) {
      const decoded = decodeShare(share)
      if (decoded) {
        setItems(decoded.items)
        setSourceName(decoded.name)
      }
      params.delete('share')
    }
    params.delete('result')
    setParams(params, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!method) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-brand text-4xl">No such method</h1>
        <p className="mt-3 text-muted-foreground text-sm">That randomizer doesn't exist. Yet.</p>
        <Link to="/" className="btn-ink mt-8 inline-block px-6 py-2.5 font-semibold">
          Back to the index
        </Link>
      </main>
    )
  }

  const record = (item: Item) =>
    recordResult({ id: item.id, label: item.label, image: item.image, meta: item.meta, method: method.id })
  const recordLabel = (label: string) =>
    recordResult({ id: crypto.randomUUID(), label, method: method.id })

  const needsItems = method.minItems > items.length
  const methodNo = METHODS.findIndex((m) => m.id === method.id) + 1

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      {/* a verdict someone sent over */}
      {sharedResult && (
        <div className="mb-6 bg-foreground text-background px-5 py-4 hard-shadow flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            {sharedResult.image && <img src={sharedResult.image} alt="" className="max-h-16 object-cover border-2 border-background" />}
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-70">someone sent you a verdict</div>
              <div className="font-brand text-2xl break-words">
                {sharedResult.label}
                {sharedResult.meta && <span className="ml-2 text-base opacity-70">({sharedResult.meta})</span>}
              </div>
            </div>
          </div>
          <span className="text-xs opacity-70">{method.name} called it. Run your own below.</span>
        </div>
      )}

      {/* method switcher: wrapping chips, never a horizontal scroll */}
      <div className="flex flex-wrap gap-1.5 pb-4 border-b-2 border-foreground">
        {METHODS.map((m, i) => (
          <Link
            key={m.id}
            to={`/randomize/${m.id}`}
            className={`px-2.5 py-1.5 text-xs whitespace-nowrap border-2 border-foreground ${
              m.id === method.id
                ? 'bg-foreground text-background font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span className="font-brand mr-1.5">{String(i + 1).padStart(2, '0')}</span>
            {m.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Step 1 · Load a list
            </h2>
            <SourcePanel />
          </div>
          <HistoryPanel />
        </aside>

        <section>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Step 2 · Let chance decide
          </h2>
          <div className="ink-card hard-shadow min-h-[480px] flex flex-col">
          <header className="border-b-2 border-foreground px-6 py-4 flex items-baseline gap-4">
            <span className="font-brand text-3xl text-muted-foreground">{String(methodNo).padStart(2, '0')}</span>
            <div>
              <h1 className="font-brand text-3xl leading-none">{method.name}</h1>
              <p className="text-xs text-muted-foreground mt-1.5">{method.description}</p>
            </div>
          </header>

          <div className="flex-1 grid place-items-center p-4 sm:p-10 *:min-w-0 *:max-w-full">
            {needsItems ? (
              <div className="text-center max-w-sm">
                <div className="halftone-faint size-16 mx-auto mb-4" aria-hidden />
                <p className="font-semibold">
                  This one needs at least {method.minItems} items.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Type a list, grab a preset, drop a spreadsheet, or pull a watchlist in the left panel.
                </p>
              </div>
            ) : (
              <Stage methodId={method.id} items={items} onItem={record} onLabel={recordLabel} />
            )}
          </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function Stage({
  methodId, items, onItem, onLabel,
}: {
  methodId: MethodId
  items: Item[]
  onItem: (item: Item) => void
  onLabel: (label: string) => void
}) {
  switch (methodId) {
    case 'wheel': return <Wheel items={items} onResult={onItem} />
    case 'cards': return <Cards items={items} onResult={onItem} />
    case 'slots': return <Slots items={items} onResult={onItem} />
    case 'ladder': return <Ladder items={items} onResult={onItem} />
    case 'bracket': return <Bracket items={items} onResult={onItem} />
    case 'teams': return <Teams items={items} onLabel={onLabel} />
    case 'straws': return <Straws items={items} onResult={onItem} />
    case 'eeny': return <Eeny items={items} onResult={onItem} />
    case 'sortrace': return <SortRace items={items} onItem={onItem} onLabel={onLabel} />
    // keyed so a list change rebuilds the board with fresh bins/seats
    case 'plinko': return <Plinko key={items.map((i) => i.id).join()} items={items} onResult={onItem} />
    case 'bottle': return <Bottle key={items.map((i) => i.id).join()} items={items} onResult={onItem} />
    case 'balloons': return <Balloons items={items} onResult={onItem} />
    case 'marbles': return <Marbles items={items} onResult={onItem} />
    case 'dice': return <Dice items={items} onResult={onItem} />
    case 'number': return <NumberGen onResult={onLabel} />
    case 'coin': return <Coin onResult={onLabel} />
    case 'eightball': return <EightBall onResult={onLabel} />
    case 'timeline': return <Timeline items={items} onResult={onItem} />
  }
}
