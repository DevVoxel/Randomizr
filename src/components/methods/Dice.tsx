import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { randomInt } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
}

export default function Dice({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [count, setCount] = useState(2)
  const [faces, setFaces] = useState<number[]>([3, 5])
  const [rolling, setRolling] = useState(false)
  const [total, setTotal] = useState<number | null>(null)
  const [mapped, setMapped] = useState<Item | null>(null)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearInterval(timerRef.current), [])

  const roll = () => {
    if (rolling) return
    setRolling(true)
    setTotal(null)
    setMapped(null)
    const final = Array.from({ length: count }, () => randomInt(1, 6))
    // visible tumble: cycle faces fast, then settle
    timerRef.current = window.setInterval(() => {
      setFaces(Array.from({ length: count }, () => randomInt(1, 6)))
    }, 90)
    window.setTimeout(() => {
      window.clearInterval(timerRef.current)
      setFaces(final)
      const sum = final.reduce((a, b) => a + b, 0)
      setTotal(sum)
      setRolling(false)
      const item = items.length >= 2 ? items[(sum - count) % items.length] : null
      setMapped(item)
      onResult(item ?? { id: `dice-${sum}`, label: `Rolled ${sum}` })
    }, 1200)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground mr-1">Dice:</span>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            onClick={() => { setCount(n); setFaces(Array.from({ length: n }, () => randomInt(1, 6))); setTotal(null); setMapped(null) }}
            className={`size-9 border-2 border-foreground font-brand text-lg ${
              count === n ? 'bg-foreground text-background' : 'hover:bg-muted'
            }`}
            aria-pressed={count === n}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {faces.map((face, i) => (
          <motion.div
            key={i}
            animate={rolling ? { rotate: [0, -12, 10, -8, 0], y: [0, -14, 0, -8, 0] } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.5, repeat: rolling ? Infinity : 0 }}
            className="size-20 sm:size-24 bg-background border-2 border-foreground hard-shadow-sm grid grid-cols-3 grid-rows-3 p-3"
          >
            {Array.from({ length: 9 }, (_, cell) => {
              const r = Math.floor(cell / 3)
              const c = cell % 3
              const on = PIPS[face].some(([pr, pc]) => pr === r && pc === c)
              return <span key={cell} className={`m-auto size-2.5 sm:size-3 rounded-full ${on ? 'bg-foreground' : ''}`} />
            })}
          </motion.div>
        ))}
      </div>

      <button onClick={roll} disabled={rolling} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {rolling ? 'Rolling…' : 'Roll'}
      </button>

      {total !== null && (
        <div className="text-center">
          <div className="font-brand text-5xl">{total}</div>
          {mapped && (
            <p className="text-xs text-muted-foreground mt-1">
              Total maps to item #{((total - count) % items.length) + 1} of your list
            </p>
          )}
        </div>
      )}
      {mapped && <ResultBanner label={mapped.label} image={mapped.image} meta={mapped.meta} />}
    </div>
  )
}
