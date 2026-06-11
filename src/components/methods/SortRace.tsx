import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const MAX_ITEMS = 12
const FRAME_MS = 90

/* each algorithm yields a snapshot after every mutation; the race is real operation counts */

function bubbleFrames(start: number[]): number[][] {
  const a = [...start]
  const frames: number[][] = []
  for (let i = a.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        frames.push([...a])
      }
    }
  }
  return frames
}

function insertionFrames(start: number[]): number[][] {
  const a = [...start]
  const frames: number[][] = []
  for (let i = 1; i < a.length; i++) {
    const v = a[i]
    let j = i - 1
    while (j >= 0 && a[j] > v) {
      a[j + 1] = a[j]
      frames.push([...a])
      j--
    }
    a[j + 1] = v
    frames.push([...a])
  }
  return frames
}

function selectionFrames(start: number[]): number[][] {
  const a = [...start]
  const frames: number[][] = []
  for (let i = 0; i < a.length - 1; i++) {
    let min = i
    for (let j = i + 1; j < a.length; j++) if (a[j] < a[min]) min = j
    if (min !== i) {
      ;[a[i], a[min]] = [a[min], a[i]]
      frames.push([...a])
    }
  }
  return frames
}

const ALGOS = [
  { name: 'bubble', build: bubbleFrames },
  { name: 'insertion', build: insertionFrames },
  { name: 'selection', build: selectionFrames },
]

interface Race {
  entrants: Item[] // entrants[v-1] = item with secret rank v
  start: number[]
  lanes: { name: string; frames: number[][] }[]
}

export default function SortRace({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [race, setRace] = useState<Race | null>(null)
  const [frame, setFrame] = useState(0)
  const [running, setRunning] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearInterval(timerRef.current), [])

  const run = () => {
    window.clearInterval(timerRef.current)
    const entrants = items.length > MAX_ITEMS ? shuffle(items).slice(0, MAX_ITEMS) : shuffle(items)
    // the randomness: which rank each item secretly holds
    const start = shuffle(Array.from({ length: entrants.length }, (_, i) => i + 1))
    const lanes = ALGOS.map((algo) => ({ name: algo.name, frames: algo.build(start) }))
    const total = Math.max(...lanes.map((l) => l.frames.length))
    setRace({ entrants, start, lanes })
    setFrame(0)
    setRunning(true)
    let f = 0
    timerRef.current = window.setInterval(() => {
      f++
      setFrame(f)
      if (f >= total) {
        window.clearInterval(timerRef.current)
        setRunning(false)
      }
    }, FRAME_MS)
  }

  // start[i] is the secret rank of entrants[i], so rank 1 belongs to entrants[start.indexOf(1)]
  const winner = race && !running && frame > 0 ? race.entrants[race.start.indexOf(1)] : null
  const fired = useRef(false)
  useEffect(() => {
    if (winner && !fired.current) {
      fired.current = true
      onResult(winner)
    }
    if (running) fired.current = false
  }, [winner, running, onResult])

  const maxVal = race?.start.length ?? 1

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {items.length > MAX_ITEMS && (
        <p className="text-xs text-muted-foreground">
          The track fits {MAX_ITEMS}, so each race seeds {MAX_ITEMS} of your {items.length} items.
        </p>
      )}

      {race && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          {race.lanes.map((lane) => {
            const f = Math.min(frame, lane.frames.length)
            const arr = f === 0 ? race.start : lane.frames[f - 1]
            const finished = frame >= lane.frames.length
            const isWinner = finished && lane.frames.length === Math.min(...race.lanes.map((l) => l.frames.length))
            return (
              <div key={lane.name} className={`border-2 p-2 ${isWinner && !running ? 'border-foreground hard-shadow-sm' : 'border-muted-foreground/40'}`}>
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">{lane.name}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums text-right shrink-0">
                    {f}/{lane.frames.length} ops{isWinner && !running ? ' · fastest' : ''}
                  </span>
                </div>
                <div className="flex items-end gap-0.5 h-20">
                  {arr.map((v, i) => (
                    <div
                      key={i}
                      className={finished ? 'bg-foreground flex-1' : 'bg-foreground/70 flex-1'}
                      style={{ height: `${(v / maxVal) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {race && !running && frame > 0 && (
        <ol className="text-xs grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 max-w-md w-full">
          {[...race.entrants]
            .map((item, i) => ({ item, rank: race.start[i] }))
            .sort((a, b) => a.rank - b.rank)
            .map(({ item, rank }) => (
              <li key={item.id} className={`truncate ${rank === 1 ? 'bg-foreground text-background px-1 font-semibold' : 'text-muted-foreground'}`}>
                {rank}· {item.label}
              </li>
            ))}
        </ol>
      )}

      <button onClick={run} disabled={running} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {running ? 'Sorting…' : race ? 'Race again' : 'Start the race'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
