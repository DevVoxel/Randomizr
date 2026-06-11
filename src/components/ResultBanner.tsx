import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useItems } from '../state/useItems'
import { getMethod } from '../lib/types'
import { encodeResult } from '../lib/share'

/**
 * The verdict: an inverted ink stamp that floats OVER the stage instead of
 * pushing the page down. Mounts fresh per result (methods clear their winner
 * before each run), so dismissal naturally resets.
 */
export function ResultBanner({ label, image, meta }: { label: string; image?: string; meta?: string }) {
  const [copied, setCopied] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // the method lives in the URL path, so the link replays in the same arena
  const share = async () => {
    const code = encodeResult({ label, meta, image })
    await navigator.clipboard.writeText(`${location.origin}${location.pathname}?result=${code}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key={label + (meta ?? '')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 grid place-items-center p-4 cursor-pointer"
          onClick={() => setDismissed(true)}
          role="dialog"
          aria-label={`Verdict: ${label}`}
        >
          {/* halftone scrim: the stage stays visible behind the stamp */}
          <div className="absolute inset-0 bg-background/75 halftone-faint" aria-hidden />
          <motion.div
            initial={{ opacity: 0, scale: 1.25, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-foreground text-background px-4 sm:px-7 py-4 text-center hard-shadow max-w-full min-w-0 cursor-auto"
          >
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss verdict"
              className="absolute top-1.5 right-2 text-background/70 hover:text-background text-sm leading-none"
            >
              ×
            </button>
            <div className="border border-dashed border-background/50 px-3 sm:px-5 py-3">
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-70 mb-1.5">· verdict ·</div>
              {image && <img src={image} alt="" className="mx-auto mb-2 max-h-40 object-cover border-2 border-background" />}
              <div className="font-brand text-2xl sm:text-3xl leading-tight break-words">
                {label}
                {meta && <span className="ml-2 text-base opacity-70">({meta})</span>}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em]">
              <button onClick={share} className="opacity-70 hover:opacity-100 underline underline-offset-2">
                {copied ? 'link copied' : 'share this verdict'}
              </button>
              <span className="opacity-40">tap outside to keep playing</span>
            </div>
          </motion.div>
        </motion.div>
      )}
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
