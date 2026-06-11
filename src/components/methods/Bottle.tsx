import { useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { pickIndex, randomFloat, shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const LABELED_MAX = 14 // beyond this, seats show numbers and a legend carries the names
const SPIN_MS = 3200

export default function Bottle({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  // the circle is fixed for this mount; Randomize remounts Bottle when the list changes
  const [circle] = useState<Item[]>(() => shuffle(items))
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Item | null>(null)
  const pendingRef = useRef<Item | null>(null)

  const n = circle.length
  const labeled = n <= LABELED_MAX

  const spin = () => {
    if (spinning || n < 2) return
    const idx = pickIndex(n)
    pendingRef.current = circle[idx]
    setWinner(null)
    setSpinning(true)
    // the bottle graphic points up; aim its neck at the chosen seat, plus jitter
    const target = (idx / n) * 360 + (randomFloat() - 0.5) * (300 / n)
    const current = ((rotation % 360) + 360) % 360
    const delta = ((target - current + 360) % 360) + 360 * 4
    setRotation(rotation + delta)
  }

  const settle = () => {
    if (!spinning) return
    setSpinning(false)
    const item = pendingRef.current
    if (item) {
      setWinner(item)
      onResult(item)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative size-80 sm:size-96">
        {circle.map((item, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2
          const isWinner = winner?.id === item.id
          return (
            <div
              key={item.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 truncate border-2 text-center ${
                labeled ? 'max-w-24 px-1.5 py-0.5 text-xs' : 'px-1 text-[9px] leading-4'
              } ${
                isWinner ? 'bg-foreground text-background border-foreground font-semibold' : 'border-foreground'
              }`}
              style={{
                left: `${50 + 44 * Math.cos(angle)}%`,
                top: `${50 + 44 * Math.sin(angle)}%`,
              }}
            >
              {labeled ? item.label : i + 1}
            </div>
          )
        })}

        {/* the bottle, neck up, spinning in the middle */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.85, 0.1, 1)` : 'none',
          }}
          onTransitionEnd={settle}
        >
          <svg viewBox="0 0 40 120" className="h-32 sm:h-36 w-auto" aria-hidden>
            {/* neck */}
            <rect x="15" y="2" width="10" height="30" fill="var(--ink)" />
            {/* shoulders + body */}
            <path d="M15 32 Q6 42 6 56 L6 110 Q6 118 14 118 L26 118 Q34 118 34 110 L34 56 Q34 42 25 32 Z" fill="var(--ink)" />
            {/* label band */}
            <rect x="6" y="66" width="28" height="22" fill="var(--paper)" />
            <circle cx="20" cy="77" r="6" fill="var(--ink)" />
          </svg>
        </div>
      </div>

      {!labeled && (
        <ol className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs w-full max-w-lg max-h-36 overflow-y-auto">
          {circle.map((item, i) => (
            <li
              key={item.id}
              className={`truncate ${winner?.id === item.id ? 'bg-foreground text-background px-1 font-semibold' : 'text-muted-foreground'}`}
            >
              {i + 1}· {item.label}
            </li>
          ))}
        </ol>
      )}

      <button onClick={spin} disabled={spinning || n < 2} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {spinning ? 'Spinning…' : 'Spin the bottle'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
