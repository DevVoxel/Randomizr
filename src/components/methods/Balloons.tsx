import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import type { Item } from '../../lib/types'
import { pickIndex, shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const MAX_BALLOONS = 24

interface Round {
  order: Item[]
  winnerIdx: number
}

export default function Balloons({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [round, setRound] = useState<Round | null>(null)
  const [popped, setPopped] = useState<Set<number>>(new Set())
  const [found, setFound] = useState(false)

  const inflate = () => {
    const order = items.length > MAX_BALLOONS ? shuffle(items).slice(0, MAX_BALLOONS) : shuffle(items)
    setRound({ order, winnerIdx: pickIndex(order.length) })
    setPopped(new Set())
    setFound(false)
  }

  const pop = (i: number) => {
    if (!round || found || popped.has(i)) return
    setPopped((p) => new Set(p).add(i))
    if (i === round.winnerIdx) {
      setFound(true)
      onResult(round.order[i])
    }
  }

  const winner = round && found ? round.order[round.winnerIdx] : null

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-xs text-muted-foreground text-center">
        One balloon hides the verdict. Pop until you find it.
        {items.length > MAX_BALLOONS && ` (${MAX_BALLOONS} balloons, drawn from your ${items.length}.)`}
      </p>

      {round && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-5 gap-y-7 max-w-2xl">
          {round.order.map((item, i) => {
            const isPopped = popped.has(i)
            const isWinner = i === round.winnerIdx
            return (
              <div key={item.id} className="flex flex-col items-center w-20">
                <AnimatePresence mode="wait">
                  {!isPopped ? (
                    <motion.button
                      key="balloon"
                      onClick={() => pop(i)}
                      disabled={found}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="group cursor-pointer disabled:cursor-default"
                      aria-label={`Pop balloon ${i + 1}`}
                    >
                      <motion.svg
                        viewBox="0 0 40 64"
                        className="w-12 h-auto"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2 + (i % 3) * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ellipse cx="20" cy="20" rx="15" ry="18" fill={i % 2 ? 'var(--ink)' : 'var(--paper)'} stroke="var(--ink)" strokeWidth="2" />
                        {i % 2 === 0 && <ellipse cx="20" cy="20" rx="15" ry="18" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="3 3" />}
                        <path d="M20 38 L17 42 L23 42 Z" fill="var(--ink)" />
                        <path d="M20 42 Q16 52 20 62" stroke="var(--ink)" strokeWidth="1.5" fill="none" />
                      </motion.svg>
                    </motion.button>
                  ) : (
                    <motion.div
                      key="reveal"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`h-[72px] grid place-items-center text-center text-xs px-1 w-full ${
                        isWinner ? 'bg-foreground text-background font-semibold' : 'text-muted-foreground line-through'
                      }`}
                    >
                      {item.label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}

      <button onClick={inflate} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        {round ? <RotateCcw className="size-5" /> : null}
        {round ? 'New balloons' : 'Inflate the balloons'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
