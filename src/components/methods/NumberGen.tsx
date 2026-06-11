import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import { sampleRange } from '../../lib/random'

export default function NumberGen({ onResult }: { onResult: (label: string) => void }) {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [count, setCount] = useState(1)
  const [unique, setUnique] = useState(true)
  const [results, setResults] = useState<number[]>([])
  const [rolling, setRolling] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearInterval(timerRef.current), [])

  const generate = () => {
    if (rolling) return
    setRolling(true)
    const final = sampleRange(min, max, Math.max(1, count), unique)
    timerRef.current = window.setInterval(() => {
      setResults(sampleRange(min, max, Math.max(1, Math.min(count, 10)), false))
    }, 70)
    window.setTimeout(() => {
      window.clearInterval(timerRef.current)
      setResults(final)
      setRolling(false)
      onResult(final.join(', '))
    }, 900)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <div className="ink-card p-4 w-full grid grid-cols-2 gap-3 text-sm">
        <Field label="Min">
          <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="num-input" />
        </Field>
        <Field label="Max">
          <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="num-input" />
        </Field>
        <Field label="How many">
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))} className="num-input" />
        </Field>
        <Field label="Repeats">
          <button
            onClick={() => setUnique((u) => !u)}
            aria-pressed={!unique}
            className={`w-full border-2 border-foreground px-3 py-2 font-semibold transition-colors ${
              unique ? 'bg-foreground text-background' : 'hover:bg-muted'
            }`}
          >
            {unique ? 'No repeats' : 'Repeats allowed'}
          </button>
        </Field>
      </div>

      <button onClick={generate} disabled={rolling} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        Generate
      </button>

      {results.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {results.map((n, i) => (
            <motion.span
              key={`${i}-${n}-${rolling}`}
              initial={rolling ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: rolling ? 0 : i * 0.06, type: 'spring', stiffness: 300, damping: 18 }}
              className={`min-w-16 px-4 py-2 text-center font-brand text-4xl tabular-nums border-2 ${
                rolling ? 'border-dashed border-muted-foreground text-muted-foreground' : 'border-foreground bg-foreground text-background hard-shadow-sm'
              }`}
            >
              {n}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
