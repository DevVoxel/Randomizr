import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { randomFloat, shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const MAX_LANES = 10

export default function Marbles({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [lanes, setLanes] = useState<Item[] | null>(null)
  const [winner, setWinner] = useState<Item | null>(null)
  const [running, setRunning] = useState(false)
  const marbleRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef(0)

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const race = () => {
    if (running) return
    cancelAnimationFrame(rafRef.current)
    const order = items.length > MAX_LANES ? shuffle(items).slice(0, MAX_LANES) : shuffle(items)
    setLanes(order)
    setWinner(null)
    setRunning(true)

    const positions = order.map(() => 0)
    let done = false
    const step = () => {
      for (let i = 0; i < positions.length; i++) {
        if (done) break
        // genuine race: every marble surges or stalls at random, every frame
        positions[i] += 0.0015 + randomFloat() * 0.007
        const el = marbleRefs.current[i]
        if (el) el.style.left = `${Math.min(positions[i], 1) * 100}%`
        if (positions[i] >= 1 && !done) {
          done = true
          setRunning(false)
          setWinner(order[i])
          onResult(order[i])
        }
      }
      if (!done) rafRef.current = requestAnimationFrame(step)
    }
    // wait a tick so the refs exist for a fresh lane list
    requestAnimationFrame(() => {
      marbleRefs.current.forEach((el) => { if (el) el.style.left = '0%' })
      rafRef.current = requestAnimationFrame(step)
    })
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      {items.length > MAX_LANES && (
        <p className="text-xs text-muted-foreground">
          The track has {MAX_LANES} lanes, drawn from your {items.length} items.
        </p>
      )}

      {lanes && (
        <div className="w-full flex flex-col">
          {lanes.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 border-b-2 border-dotted border-muted-foreground/40 py-1.5">
              <span className={`w-24 sm:w-32 shrink-0 truncate text-xs text-right ${winner?.id === item.id ? 'font-semibold' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {/* the lane: marble rides from left wall to finish line */}
              <div className="relative flex-1 h-6">
                <div className="absolute inset-y-0 left-0 w-0.5 bg-foreground/30" />
                <div className="absolute inset-y-0 right-0 w-1 bg-foreground" style={{ backgroundImage: 'repeating-linear-gradient(0deg, var(--ink) 0 3px, var(--paper) 3px 6px)' }} />
                <div
                  ref={(el) => { marbleRefs.current[i] = el }}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-full size-4 rounded-full border-2 border-foreground ${
                    winner?.id === item.id ? 'bg-foreground' : i % 2 ? 'bg-foreground' : 'bg-background'
                  }`}
                  style={{ left: '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={race} disabled={running} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {running ? 'They’re off…' : lanes ? 'Race again' : 'Marbles to the line'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
