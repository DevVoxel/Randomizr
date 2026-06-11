import { AnimatePresence, motion } from 'motion/react'
import { useItems } from '../state/useItems'
import { getMethod } from '../lib/types'

/** The verdict: an inverted ink block, stamped onto the page. */
export function ResultBanner({ label, image, meta }: { label: string; image?: string; meta?: string }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={label + (meta ?? '')}
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        className="bg-foreground text-background px-7 py-4 text-center hard-shadow"
      >
        <div className="border border-dashed border-background/50 px-5 py-3 -mx-2">
          <div className="text-[10px] uppercase tracking-[0.3em] opacity-70 mb-1.5">— verdict —</div>
          {image && <img src={image} alt="" className="mx-auto mb-2 max-h-40 object-cover border-2 border-background" />}
          <div className="font-brand text-3xl leading-none">
            {label}
            {meta && <span className="ml-2 text-base opacity-70">({meta})</span>}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function HistoryPanel() {
  const { history, clearHistory } = useItems()
  if (!history.length) return null
  return (
    <div className="ink-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          The record
        </span>
        <button
          onClick={clearHistory}
          className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:line-through"
        >
          burn it
        </button>
      </div>
      <ul className="flex flex-col max-h-48 overflow-y-auto text-sm divide-y divide-dotted divide-muted-foreground/40">
        {history.slice(0, 20).map((r) => (
          <li key={r.at + r.id} className="flex items-center justify-between gap-2 py-1">
            <span className="truncate">{r.label}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {getMethod(r.method)?.name ?? r.method}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
