import { useState } from 'react'
import { motion } from 'motion/react'
import { Shuffle } from 'lucide-react'
import type { Item } from '../../lib/types'
import { shuffle } from '../../lib/random'

export default function Timeline({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [order, setOrder] = useState<Item[] | null>(null)
  const [round, setRound] = useState(0)

  const run = () => {
    const shuffled = shuffle(items)
    setOrder(shuffled)
    setRound((r) => r + 1)
    onResult(shuffled[0])
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl">
      <p className="text-sm text-muted-foreground text-center">
        One Fisher–Yates pass over the whole list. Turn order, rankings, backlog triage.
      </p>
      <button onClick={run} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Shuffle className="size-5" />
        {order ? 'Shuffle again' : 'Shuffle'}
      </button>

      {order && (
        <ol key={round} className="relative w-full flex flex-col">
          {/* dotted spine */}
          <div className="absolute left-[17px] top-4 bottom-4 border-l-2 border-dotted border-muted-foreground/60" />
          {order.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 22 }}
              className="relative flex items-center gap-4 py-1.5"
            >
              <span
                className={`z-10 grid place-items-center size-9 border-2 border-foreground font-brand text-base shrink-0 ${
                  i === 0 ? 'bg-foreground text-background' : 'bg-background text-muted-foreground'
                }`}
              >
                {i + 1}
              </span>
              <span className={`flex items-center gap-2 min-w-0 ${i === 0 ? 'text-lg font-semibold' : 'text-sm'}`}>
                {item.image && <img src={item.image} alt="" className="size-8 object-cover border border-foreground" />}
                <span className="truncate">{item.label}</span>
                {item.meta && <span className="text-xs text-muted-foreground shrink-0">({item.meta})</span>}
              </span>
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  )
}
