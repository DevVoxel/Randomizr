import { useState } from 'react'
import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { pick, shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const ROW_H = 72
const REEL_LEN = 24

export default function Slots({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [reels, setReels] = useState<Item[][] | null>(null)
  const [winner, setWinner] = useState<Item | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [round, setRound] = useState(0)

  const pull = () => {
    if (spinning) return
    const w = pick(items)
    // each reel: random filler ending on the winner
    const built = [0, 1, 2].map(() => {
      const filler: Item[] = []
      while (filler.length < REEL_LEN - 1) filler.push(...shuffle(items))
      return [...filler.slice(0, REEL_LEN - 1), w]
    })
    setWinner(null)
    setReels(built)
    setSpinning(true)
    setRound((r) => r + 1)
    window.setTimeout(() => {
      setSpinning(false)
      setWinner(w)
      onResult(w)
    }, 3100)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="ink-card hard-shadow p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-3 relative">
          {/* win line */}
          <div className="absolute -left-2 -right-2 top-1/2 -translate-y-1/2 h-[72px] border-y-2 border-dashed border-foreground pointer-events-none z-10" />
          {[0, 1, 2].map((reelIdx) => (
            <div
              key={reelIdx}
              className="w-28 sm:w-40 overflow-hidden bg-muted border-2 border-foreground"
              style={{ height: ROW_H * 3 }}
            >
              {reels ? (
                <motion.div
                  key={round}
                  initial={{ y: ROW_H }}
                  animate={{ y: -ROW_H * (REEL_LEN - 2) }}
                  transition={{ duration: 2.2 + reelIdx * 0.4, ease: [0.1, 0.7, 0.2, 1] }}
                >
                  {reels[reelIdx].map((item, i) => (
                    <ReelCell key={i} item={item} />
                  ))}
                </motion.div>
              ) : (
                <div style={{ paddingTop: ROW_H }}>
                  <ReelCell item={{ id: 'placeholder', label: '?' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={pull} disabled={spinning} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {spinning ? 'Rolling…' : 'Pull the lever'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}

function ReelCell({ item }: { item: Item }) {
  return (
    <div className="grid place-items-center px-2 text-center" style={{ height: ROW_H }}>
      {item.image ? (
        <img src={item.image} alt={item.label} className="max-h-[60px] object-cover border border-foreground" />
      ) : (
        <span className="text-sm font-semibold leading-tight line-clamp-2">{item.label}</span>
      )}
    </div>
  )
}
