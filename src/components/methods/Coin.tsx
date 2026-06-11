import { useState } from 'react'
import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import { randomInt } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

export default function Coin({ onResult }: { onResult: (label: string) => void }) {
  const [heads, setHeads] = useState('Heads')
  const [tails, setTails] = useState('Tails')
  const [rotation, setRotation] = useState(0)
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const flip = () => {
    if (flipping) return
    const isHeads = randomInt(0, 1) === 0
    setResult(null)
    setFlipping(true)
    // land at 0° mod 360 for heads, 180° for tails, after several full turns
    const base = rotation - (rotation % 360)
    setRotation(base + 360 * (5 + randomInt(0, 2)) + (isHeads ? 0 : 180))
    window.setTimeout(() => {
      setFlipping(false)
      const label = isHeads ? heads.trim() || 'Heads' : tails.trim() || 'Tails'
      setResult(label)
      onResult(label)
    }, 1900)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-3 text-sm">
        <input
          value={heads}
          onChange={(e) => setHeads(e.target.value)}
          placeholder="Heads"
          className="num-input w-32 text-center"
        />
        <span className="self-center text-muted-foreground">vs</span>
        <input
          value={tails}
          onChange={(e) => setTails(e.target.value)}
          placeholder="Tails"
          className="num-input w-32 text-center"
        />
      </div>

      <div style={{ perspective: 900 }}>
        <motion.div
          className="relative size-40 sm:size-48"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateX: rotation }}
          transition={{ duration: 1.9, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {/* heads is ink, tails is paper: two sides of the same press */}
          <CoinFace label={heads || 'Heads'} className="bg-foreground text-background" />
          <CoinFace label={tails || 'Tails'} className="bg-background text-foreground" flipped />
        </motion.div>
      </div>

      <button onClick={flip} disabled={flipping} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {flipping ? 'Flipping…' : 'Flip'}
      </button>

      {result && <ResultBanner label={result} />}
    </div>
  )
}

function CoinFace({ label, className, flipped }: { label: string; className: string; flipped?: boolean }) {
  return (
    <div
      className={`absolute inset-0 rounded-full border-4 border-foreground grid place-items-center px-4 text-center font-brand text-xl sm:text-2xl ${className}`}
      style={{ backfaceVisibility: 'hidden', transform: flipped ? 'rotateX(180deg)' : undefined }}
    >
      {label}
    </div>
  )
}
