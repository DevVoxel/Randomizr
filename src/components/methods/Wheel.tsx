import { useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { pickIndex, randomFloat } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const SPIN_MS = 4200

/* slices cycle ink → paper → halftone → stripes; text flips to stay legible */
const FILLS = ['var(--ink)', 'var(--paper)', 'url(#wheel-dots)', 'url(#wheel-stripes)']
const TEXT_ON = ['var(--paper)', 'var(--ink)', 'var(--ink)', 'var(--ink)']

export default function Wheel({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Item | null>(null)
  const pendingRef = useRef<Item | null>(null)

  const n = items.length
  const sliceA = 360 / n

  const spin = () => {
    if (spinning || n < 2) return
    const idx = pickIndex(n)
    pendingRef.current = items[idx]
    setWinner(null)
    setSpinning(true)
    // land the chosen slice's center under the top pointer, with jitter inside the slice
    const centerDeg = idx * sliceA + sliceA / 2
    const jitter = (randomFloat() - 0.5) * sliceA * 0.7
    const targetEffective = (360 - centerDeg + jitter + 360) % 360
    const currentEffective = ((rotation % 360) + 360) % 360
    const delta = ((targetEffective - currentEffective + 360) % 360) + 5 * 360
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

  const showLabels = n <= 28

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* pointer */}
        <div className="absolute left-1/2 -top-1 z-10 -translate-x-1/2">
          <div className="size-0 border-x-[14px] border-x-transparent border-t-[22px] border-t-foreground" />
        </div>
        <div
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.8, 0.08, 1)` : 'none',
          }}
          onTransitionEnd={settle}
        >
          <svg viewBox="-105 -105 210 210" className="size-72 sm:size-96 select-none">
            <defs>
              <pattern id="wheel-dots" patternUnits="userSpaceOnUse" width="7" height="7">
                <rect width="7" height="7" fill="var(--paper)" />
                <circle cx="3.5" cy="3.5" r="1.1" fill="var(--ink)" opacity="0.45" />
              </pattern>
              <pattern id="wheel-stripes" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
                <rect width="7" height="7" fill="var(--paper)" />
                <line x1="0" y1="0" x2="0" y2="7" stroke="var(--ink)" strokeWidth="1.6" opacity="0.4" />
              </pattern>
            </defs>
            <circle r="102" fill="none" stroke="var(--ink)" strokeWidth="3" />
            {items.map((item, i) => {
              const start = ((i * sliceA - 90) * Math.PI) / 180
              const end = (((i + 1) * sliceA - 90) * Math.PI) / 180
              const largeArc = sliceA > 180 ? 1 : 0
              const x1 = 100 * Math.cos(start)
              const y1 = 100 * Math.sin(start)
              const x2 = 100 * Math.cos(end)
              const y2 = 100 * Math.sin(end)
              const mid = i * sliceA + sliceA / 2 - 90
              const fillIdx = i % FILLS.length
              return (
                <g key={item.id}>
                  <path
                    d={n === 1 ? 'M0,0 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0' : `M0,0 L${x1},${y1} A100,100 0 ${largeArc} 1 ${x2},${y2} Z`}
                    fill={FILLS[fillIdx]}
                    stroke="var(--ink)"
                    strokeWidth="1.5"
                  />
                  {showLabels && (
                    <text
                      transform={`rotate(${mid}) translate(58 0) ${mid > 90 || mid < -90 ? 'rotate(180)' : ''}`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={TEXT_ON[fillIdx]}
                      fontSize={n > 16 ? 5.5 : 7.5}
                      fontWeight="600"
                    >
                      {item.label.length > 18 ? item.label.slice(0, 17) + '…' : item.label}
                    </text>
                  )}
                </g>
              )
            })}
            <circle r="14" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
            <circle r="4" fill="var(--ink)" />
          </svg>
        </div>
      </div>

      <button onClick={spin} disabled={spinning} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {spinning ? 'Spinning…' : 'Spin'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
