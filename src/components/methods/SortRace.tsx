import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { shuffle } from '../../lib/random'
import { SORT_ALGOS, type Frames, type SortAlgoId } from '../../lib/sorts'
import { ResultBanner } from '../ResultBanner'

const MAX_RACERS = 16
const MAX_SORT = 60
const FRAME_MS = 80
const TARGET_TICKS = 140 // playback compresses so any run finishes in ~11s
const MAX_LANES = 4

type Mode = 'race' | 'sort'

interface Lane { id: SortAlgoId; name: string; frames: Frames }

interface Run {
  mode: Mode
  entrants: Item[]
  start: number[] // start[i] = secret/alphabetical rank of entrants[i]
  lanes: Lane[]
}

export default function SortRace({
  items, onItem, onLabel,
}: {
  items: Item[]
  onItem: (item: Item) => void
  onLabel: (label: string) => void
}) {
  const [mode, setMode] = useState<Mode>('race')
  const [picked, setPicked] = useState<SortAlgoId[]>(['bubble', 'quick', 'merge'])
  const [run, setRun] = useState<Run | null>(null)
  const [frame, setFrame] = useState(0)
  const [running, setRunning] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)
  const firedRef = useRef(false)

  useEffect(() => () => window.clearInterval(timerRef.current), [])

  const toggleAlgo = (id: SortAlgoId) => {
    setPicked((p) => {
      if (mode === 'sort') return [id] // sort mode wants exactly one algorithm
      if (p.includes(id)) return p.length > 1 ? p.filter((x) => x !== id) : p
      return p.length >= MAX_LANES ? p : [...p, id]
    })
  }

  const switchMode = (m: Mode) => {
    if (m === mode) return
    setMode(m)
    setRun(null)
    setFrame(0)
    window.clearInterval(timerRef.current)
    setRunning(false)
    if (m === 'sort') setPicked((p) => [p[0] ?? 'quick'])
    else setPicked((p) => (p.length >= 2 ? p : ['bubble', 'quick', 'merge']))
  }

  const start = () => {
    window.clearInterval(timerRef.current)
    firedRef.current = false

    let entrants: Item[]
    let values: number[]
    if (mode === 'race') {
      entrants = items.length > MAX_RACERS ? shuffle(items).slice(0, MAX_RACERS) : shuffle(items)
      // the randomness: which secret rank each item holds
      values = shuffle(Array.from({ length: entrants.length }, (_, i) => i + 1))
    } else {
      entrants = items.slice(0, MAX_SORT)
      // real data: each item's alphabetical rank, starting from current list order
      const sorted = [...entrants].sort((a, b) => a.label.localeCompare(b.label))
      values = entrants.map((it) => sorted.indexOf(it) + 1)
    }

    const algos = SORT_ALGOS.filter((a) => picked.includes(a.id))
    const lanes: Lane[] = algos.map((a) => ({ id: a.id, name: a.name, frames: a.build(values) }))
    const total = Math.max(1, ...lanes.map((l) => l.frames.length))

    setRun({ mode, entrants, start: values, lanes })
    setFrame(0)
    setRunning(true)
    // long runs (bubble over 60 items is thousands of ops) skip frames to stay watchable
    const perTick = Math.max(1, Math.ceil(total / TARGET_TICKS))
    let f = 0
    timerRef.current = window.setInterval(() => {
      f = Math.min(f + perTick, total)
      setFrame(f)
      if (f >= total) {
        window.clearInterval(timerRef.current)
        setRunning(false)
      }
    }, FRAME_MS)
  }

  // fire the result exactly once per finished run
  const finished = run !== null && !running && frame > 0
  useEffect(() => {
    if (!finished || !run || firedRef.current) return
    firedRef.current = true
    if (run.mode === 'race') {
      onItem(run.entrants[run.start.indexOf(1)])
    } else {
      const fastest = [...run.lanes].sort((a, b) => a.frames.length - b.frames.length)[0]
      onLabel(`Sorted ${run.entrants.length} items A to Z (${fastest.name} sort, ${fastest.frames.length} ops)`)
    }
  }, [finished, run, onItem, onLabel])

  const maxVal = run?.start.length ?? 1
  const winner = run && finished && run.mode === 'race' ? run.entrants[run.start.indexOf(1)] : null
  const minOps = run ? Math.min(...run.lanes.map((l) => l.frames.length)) : 0
  const capNote =
    mode === 'race' && items.length > MAX_RACERS
      ? `The track fits ${MAX_RACERS}, so each race seeds ${MAX_RACERS} of your ${items.length} items.`
      : mode === 'sort' && items.length > MAX_SORT
        ? `Sorting visualizes the first ${MAX_SORT} of your ${items.length} items.`
        : null

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* mode toggle */}
      <div className="flex border-2 border-foreground text-sm">
        <button
          onClick={() => switchMode('race')}
          aria-pressed={mode === 'race'}
          className={`px-4 py-1.5 ${mode === 'race' ? 'bg-foreground text-background font-semibold' : 'hover:bg-muted'}`}
        >
          Race (random ranks)
        </button>
        <button
          onClick={() => switchMode('sort')}
          aria-pressed={mode === 'sort'}
          className={`px-4 py-1.5 border-l-2 border-foreground ${mode === 'sort' ? 'bg-foreground text-background font-semibold' : 'hover:bg-muted'}`}
        >
          Sort my list A→Z
        </button>
      </div>

      {/* algorithm picker */}
      <div className="flex flex-wrap justify-center gap-1.5 max-w-lg">
        {SORT_ALGOS.map((a) => (
          <button
            key={a.id}
            onClick={() => toggleAlgo(a.id)}
            aria-pressed={picked.includes(a.id)}
            className={`px-2.5 py-1 text-xs border-2 border-foreground ${
              picked.includes(a.id) ? 'bg-foreground text-background font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        {mode === 'race' ? `Pick up to ${MAX_LANES} algorithms to race.` : 'Pick one algorithm to watch sort your actual list.'}
      </p>
      {capNote && <p className="text-xs text-muted-foreground -mt-3">{capNote}</p>}

      {run && (
        <div className={`grid grid-cols-1 gap-4 w-full max-w-2xl ${run.lanes.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {run.lanes.map((lane) => {
            const f = Math.min(frame, lane.frames.length)
            const arr = f === 0 ? run.start : lane.frames[f - 1]
            const laneDone = frame >= lane.frames.length
            const isWinner = finished && run.lanes.length > 1 && lane.frames.length === minOps
            return (
              <div key={lane.id} className={`border-2 p-2 ${isWinner ? 'border-foreground hard-shadow-sm' : laneDone && finished ? 'border-foreground' : 'border-muted-foreground/40'}`}>
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">{lane.name}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums text-right shrink-0">
                    {f}/{lane.frames.length} ops{isWinner ? ' · fastest' : ''}
                  </span>
                </div>
                <div className="flex items-end gap-0.5 h-24">
                  {arr.map((v, i) => (
                    <div
                      key={i}
                      className={laneDone ? 'bg-foreground flex-1' : 'bg-foreground/70 flex-1'}
                      style={{ height: `${(v / maxVal) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* the reveal: ranking in race mode, the alphabetized list in sort mode */}
      {run && finished && (
        <ol className="text-xs grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 max-w-lg w-full">
          {run.entrants
            .map((item, i) => ({ item, rank: run.start[i] }))
            .sort((a, b) => a.rank - b.rank)
            .map(({ item, rank }) => (
              <li
                key={item.id}
                className={`truncate ${run.mode === 'race' && rank === 1 ? 'bg-foreground text-background px-1 font-semibold' : 'text-muted-foreground'}`}
              >
                {rank}· {item.label}
              </li>
            ))}
        </ol>
      )}

      <button onClick={start} disabled={running} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {running ? 'Sorting…' : run ? (mode === 'race' ? 'Race again' : 'Sort again') : mode === 'race' ? 'Start the race' : 'Sort it'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
