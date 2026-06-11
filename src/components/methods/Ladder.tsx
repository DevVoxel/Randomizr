import { useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { pickIndex, randomFloat, shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const MAX_COLS = 10
const ROWS = 10
const COL_W = 72
const ROW_H = 34
const PAD_X = 40
const PAD_TOP = 86 // room for the rotated labels
const PAD_BOTTOM = 40
const TRACE_MS = 2000

interface Layout {
  order: Item[]
  rungs: boolean[][] // rungs[row][col] = rung between col and col+1
  target: number
  winnerCol: number
  path: string // SVG path of the winning walk
}

/** Amidakuji: randomness lives in the rung placement, the walk is deterministic. */
function buildLayout(items: Item[]): Layout {
  const order = items.length > MAX_COLS ? shuffle(items).slice(0, MAX_COLS) : shuffle(items)
  const cols = order.length
  const rungs: boolean[][] = Array.from({ length: ROWS }, () => Array(cols - 1).fill(false))
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols - 1; c++) {
      // no two rungs may share an endpoint in the same row
      if (!(c > 0 && rungs[r][c - 1]) && randomFloat() < 0.45) rungs[r][c] = true
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

  // trace the winner's walk as an SVG path
  const x = (c: number) => PAD_X + c * COL_W
  const y = (r: number) => PAD_TOP + r * ROW_H
  let pos = winnerCol
  let d = `M ${x(pos)},${y(0)}`
  for (let r = 0; r < ROWS; r++) {
    const midY = y(r) + ROW_H / 2
    if (pos < cols - 1 && rungs[r][pos]) {
      d += ` L ${x(pos)},${midY} L ${x(pos + 1)},${midY}`
      pos++
    } else if (pos > 0 && rungs[r][pos - 1]) {
      d += ` L ${x(pos)},${midY} L ${x(pos - 1)},${midY}`
      pos--
    }
  }
  d += ` L ${x(pos)},${y(ROWS)}`
  return { order, rungs, target, winnerCol, path: d }
}

export default function Ladder({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [layout, setLayout] = useState<Layout | null>(null)
  const [phase, setPhase] = useState<'idle' | 'tracing' | 'done'>('idle')
  const [round, setRound] = useState(0)
  const timerRef = useRef<number | undefined>(undefined)

  const run = () => {
    if (phase === 'tracing') return
    window.clearTimeout(timerRef.current)
    const next = buildLayout(items)
    setLayout(next)
    setRound((r) => r + 1)
    setPhase('tracing')
    timerRef.current = window.setTimeout(() => {
      setPhase('done')
      onResult(next.order[next.winnerCol])
    }, TRACE_MS)
  }

  const cols = layout?.order.length ?? Math.min(items.length, MAX_COLS)
  const width = PAD_X * 2 + (cols - 1) * COL_W
  const height = PAD_TOP + ROWS * ROW_H + PAD_BOTTOM
  const winner = layout && phase === 'done' ? layout.order[layout.winnerCol] : null

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {items.length > MAX_COLS && (
        <p className="text-xs text-muted-foreground">
          Ladders hold {MAX_COLS} rails, so each run draws {MAX_COLS} of your {items.length} items.
        </p>
      )}

      {layout && (
        <svg key={round} viewBox={`0 0 ${width} ${height}`} className="w-full max-w-2xl" role="img" aria-label="Ladder lottery board">
          {/* rotated item labels above each rail */}
          {layout.order.map((item, c) => (
            <text
              key={item.id}
              transform={`translate(${PAD_X + c * COL_W + 4}, ${PAD_TOP - 26}) rotate(-38)`}
              fontSize="12"
              fontWeight={phase === 'done' && c === layout.winnerCol ? 700 : 400}
              fill="currentColor"
            >
              {item.label.length > 12 ? item.label.slice(0, 11) + '…' : item.label}
            </text>
          ))}
          {/* rails */}
          {layout.order.map((_, c) => (
            <line
              key={c}
              x1={PAD_X + c * COL_W} y1={PAD_TOP}
              x2={PAD_X + c * COL_W} y2={PAD_TOP + ROWS * ROW_H}
              stroke="currentColor" strokeWidth="2"
            />
          ))}
          {/* rungs */}
          {layout.rungs.flatMap((row, r) =>
            row.map((on, c) =>
              on ? (
                <line
                  key={`${r}-${c}`}
                  x1={PAD_X + c * COL_W} y1={PAD_TOP + r * ROW_H + ROW_H / 2}
                  x2={PAD_X + (c + 1) * COL_W} y2={PAD_TOP + r * ROW_H + ROW_H / 2}
                  stroke="currentColor" strokeWidth="2"
                />
              ) : null,
            ),
          )}
          {/* the traced walk, drawn on like a pen stroke */}
          <path
            d={layout.path}
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
          {/* the runner: a disc that rides the path while it draws */}
          {phase === 'tracing' && (
            <circle r="8" fill="currentColor" stroke="var(--paper)" strokeWidth="2.5">
              <animateMotion dur={`${TRACE_MS}ms`} path={layout.path} fill="freeze" calcMode="linear" />
            </circle>
          )}
          {/* numbered tops */}
          {layout.order.map((_, c) => {
            const isStart = c === layout.winnerCol && phase !== 'idle'
            return (
              <g key={c}>
                <circle
                  cx={PAD_X + c * COL_W} cy={PAD_TOP} r="12"
                  fill={isStart ? 'currentColor' : 'var(--paper)'}
                  stroke="currentColor" strokeWidth="2"
                />
                <text
                  x={PAD_X + c * COL_W} y={PAD_TOP + 4}
                  textAnchor="middle" fontSize="11" fontWeight="600"
                  fill={isStart ? 'var(--paper)' : 'currentColor'}
                >
                  {c + 1}
                </text>
              </g>
            )
          })}
          {/* the marked bottom slot */}
          <g>
            <rect
              x={PAD_X + layout.target * COL_W - 13} y={PAD_TOP + ROWS * ROW_H + 2}
              width="26" height="26" fill="currentColor"
            />
            <text
              x={PAD_X + layout.target * COL_W} y={PAD_TOP + ROWS * ROW_H + 20}
              textAnchor="middle" fontSize="14" fill="var(--paper)"
            >
              ★
            </text>
          </g>
        </svg>
      )}

      {layout && (
        <p className="text-xs text-muted-foreground -mt-2">
          {phase === 'tracing' ? 'Walking the ladder…' : 'Whichever rail reaches the ★ wins.'}
        </p>
      )}

      <button onClick={run} disabled={phase === 'tracing'} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {phase === 'tracing' ? 'Tracing…' : layout ? 'New ladder' : 'Build the ladder'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
