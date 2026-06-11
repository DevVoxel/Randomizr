import { useState } from 'react'
import { motion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import type { Item } from '../../lib/types'
import { pick } from '../../lib/random'
import { DotR } from '../Logo'
import { ResultBanner } from '../ResultBanner'

const DECK_SIZE = 12

export default function Cards({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [flippedIdx, setFlippedIdx] = useState<number | null>(null)
  const [winner, setWinner] = useState<Item | null>(null)
  const [round, setRound] = useState(0)

  const deckCount = Math.min(DECK_SIZE, Math.max(items.length, 3))

  const flip = (idx: number) => {
    if (flippedIdx !== null) return
    const item = pick(items)
    setWinner(item)
    setFlippedIdx(idx)
    onResult(item)
  }

  const reset = () => {
    setFlippedIdx(null)
    setWinner(null)
    setRound((r) => r + 1)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted-foreground">
        {flippedIdx === null ? 'Trust your gut. Pick a card.' : 'The cards have spoken.'}
      </p>
      <div key={round} className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-lg">
        {Array.from({ length: deckCount }, (_, i) => {
          const isFlipped = flippedIdx === i
          const isOther = flippedIdx !== null && !isFlipped
          return (
            <motion.button
              key={i}
              onClick={() => flip(i)}
              initial={{ opacity: 0, y: 24, rotate: -3 + (i % 3) * 3 }}
              animate={{ opacity: isOther ? 0.2 : 1, y: 0, rotate: isOther ? -3 + (i % 3) * 3 : 0, scale: isFlipped ? 1.08 : 1 }}
              transition={{ delay: flippedIdx === null ? i * 0.04 : 0, type: 'spring', stiffness: 250, damping: 20 }}
              whileHover={flippedIdx === null ? { y: -8 } : undefined}
              className="relative aspect-[2.5/3.5] w-20 sm:w-24 cursor-pointer disabled:cursor-default"
              disabled={flippedIdx !== null}
              style={{ perspective: 800 }}
              aria-label={isFlipped && winner ? winner.label : `Card ${i + 1}`}
            >
              <motion.div
                className="absolute inset-0"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* back: ink, with the dotted R as the card pattern */}
                <div
                  className="absolute inset-0 bg-foreground border-2 border-foreground grid place-items-center"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <DotR className="h-10 w-auto text-background/60" />
                </div>
                {/* face */}
                <div
                  className="absolute inset-0 bg-background border-2 border-foreground grid place-items-center p-1.5 text-center"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {isFlipped && winner ? (
                    winner.image ? (
                      <img src={winner.image} alt={winner.label} className="absolute inset-0 size-full object-cover" />
                    ) : (
                      <span className="text-[10px] sm:text-xs font-semibold leading-tight">{winner.label}</span>
                    )
                  ) : null}
                </div>
              </motion.div>
            </motion.button>
          )
        })}
      </div>

      {winner && (
        <>
          <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />
          <button onClick={reset} className="btn-paper inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold">
            <RotateCcw className="size-4" /> Shuffle again
          </button>
        </>
      )}
    </div>
  )
}
