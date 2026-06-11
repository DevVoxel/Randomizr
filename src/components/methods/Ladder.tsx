import { useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { pickIndex, randomFloat, shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const MAX_COLS = 8
const ROWS = 10
const COL_W = 56
const ROW_H = 30
const PAD = 24
const TRACE_MS = 1700

interface Layout {
  order: Item[]
  rungs: boolean[][] // rungs[row][col] = rung between col and col+1
  target: number
  winnerCol: number
  path: string
}

/** Amidakuji: randomness lives in the rung placement, the walk is deterministic. */
function buildLayout(items: Item[]): Layout {
  const order = items.length > MAX_COLS ? shuffle(items).slice(0, MAX_COLS) : shuffle(items)
  const cols = order.length
  const rungs: boolean[][] = Array.from({ length: ROWS }, () => Array(cols - 1).fill(false))
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols - 1; c++) {
      // no two rungs may share an endpoint in the same row
      if (!(c > 0 && rungs[r][c - 1]) && randomFloat() < 0.42) rungs[r][c] = true
    }
  }
  const target = pickIndex(cols)

  const walk = (start: number) => {
    let pos = start
    for (let r = 0; r < ROWS; r++) {
      if (pos < cols - 1 && rungs[r][pos]) pos++
      else if (pos > 0 && rungs[r][pos - 1]) pos--
    }
    return pos
  }
  let winnerCol = 0
  for (let c = 0; c < cols; c++) if (walk(c) === target) { winnerCol = c; break }

  // trace the winner's path as SVG points
  const x = (c: number) => PAD + c * COL_W
  const y = (r: number) => PAD + r * ROW_H
  let pos = winnerCol
  const pts: string[] = [`${x(pos)},${y(0)}`]
  for (let r = 0; r < ROWS; r++) {
    const midY = y(r) + ROW_H / 2
    if (pos < cols - 1 && rungs[r][pos]) {
      pts.push(`${x(pos)},${midY}`, `${x(pos + 1)},${midY}`)
      pos++
    } else if (pos > 0 && rungs[r][pos - 1]) {
      pts.push(`${x(pos)},${midY}`, `${x(pos - 1)},${midY}`)
      pos--
    }
  }
  pts.push(`${x(pos)},${y(ROWS)}`)
  return { order, rungs, target, winnerCol, path: pts.join(' ') }
}

export default function Ladder({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [layout, setLayout] = useState<Layout | null>(null)
  const [phase, setPhase] = useState<'idle' | 'tracing' | 'done'>('idle')
  const timerRef = useRef<number | undefined>(undefined)

  const run = () => {
    if (phase === 'tracing') return
    window.clearTimeout(timerRef.current)
    const next = buildLayout(items)
    setLayout(next)
    setPhase('tracing')
    timerRef.current = window.setTimeout(() => {
      setPhase('done')
      onResult(next.order[next.winnerCol])
    }, TRACE_MS)
  }

  const cols = layout?.order.length ?? Math.min(items.length, MAX_COLS)
  const width = PAD * 2 + (cols - 1) * COL_W
  const height = PAD * 2 + ROWS * ROW_H
  const winner = layout && phase === 'done' ? layout.order[layout.winnerCol] : null

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {items.length > MAX_COLS && (
        <p className="text-xs text-muted-foreground">
          Ladders hold {MAX_COLS} rails — each run draws {MAX_COLS} of your {items.length} items.
        </p>
      )}

      {layout && (
        <div className="w-full overflow-x-auto flex justify-center">
          <div>
            <svg width={width} height={height} className="block">
              {/* rails */}
              {layout.order.map((_, c) => (
                <line
                  key={c}
                  x1={PAD + c * COL_W} y1={PAD}
                  x2={PAD + c * COL_W} y2={PAD + ROWS * ROW_H}
                  stroke="currentColor" strokeWidth="2"
                />
              ))}
              {/* rungs */}
              {layout.rungs.flatMap((row, r) =>
                row.map((on, c) =>
                  on ? (
                    <line
                      key={`${r}-${c}`}
                      x1={PAD + c * COL_W} y1={PAD + r * ROW_H + ROW_H / 2}
                      x2={PAD + (c + 1) * COL_W} y2={PAD + r * ROW_H + ROW_H / 2}
                      stroke="currentColor" strokeWidth="2"
                    />
                  ) : null,
                ),
              )}
              {/* the traced path, drawn on like a pen stroke */}
              <polyline
                key={layout.path}
                points={layout.path}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="square"
                pathLength={1}
                strokeDasharray={1}
                style={{
                  strokeDashoffset: phase === 'idle' ? 1 : 0,
                  transition: `stroke-dashoffset ${TRACE_MS}ms linear`,
                }}
              />
              {/* numbered tops */}
              {layout.order.map((_, c) => (
                <g key={c}>
                  <circle cx={PAD + c * COL_W} cy={PAD} r="11" fill="var(--paper)" stroke="currentColor" strokeWidth="2" />
                  <text x={PAD + c * COL_W} y={PAD + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor">
                    {c + 1}
                  </text>
                </g>
              ))}
              {/* the marked bottom slot */}
              <g>
                <rect
                  x={PAD + layout.target * COL_W - 12} y={PAD + ROWS * ROW_H - 2}
                  width="24" height="24" fill="currentColor"
                />
                <text
                  x={PAD + layout.target * COL_W} y={PAD + ROWS * ROW_H + 14}
                  textAnchor="middle" fontSize="13" fill="var(--paper)"
                >
                  ★
                </text>
              </g>
            </svg>
            <ol className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
              {layout.order.map((item, c) => (
                <li
                  key={item.id}
                  className={`truncate ${phase === 'done' && c === layout.winnerCol ? 'bg-foreground text-background px-1 font-semibold' : 'text-muted-foreground'}`}
                >
                  {c + 1}· {item.label}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <button onClick={run} disabled={phase === 'tracing'} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {phase === 'tracing' ? 'Tracing…' : layout ? 'New ladder' : 'Build the ladder'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
