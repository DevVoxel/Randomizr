import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { randomInt, shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const MAX_SEEDS = 16
const ROUND_MS = 1100

type Slot = Item | null // null = bye

/** All rounds decided up front; the reveal is theater. */
function runTournament(items: Item[]): Slot[][] {
  const seeds = shuffle(items).slice(0, MAX_SEEDS)
  let size = 2
  while (size < seeds.length) size *= 2
  const first: Slot[] = [...seeds, ...Array(size - seeds.length).fill(null)]
  const rounds: Slot[][] = [first]
  while (rounds[rounds.length - 1].length > 1) {
    const prev = rounds[rounds.length - 1]
    const next: Slot[] = []
    for (let i = 0; i < prev.length; i += 2) {
      const [a, b] = [prev[i], prev[i + 1]]
      next.push(a && b ? (randomInt(0, 1) === 0 ? a : b) : (a ?? b))
    }
    rounds.push(next)
  }
  return rounds
}

export default function Bracket({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [rounds, setRounds] = useState<Slot[][] | null>(null)
  const [revealed, setRevealed] = useState(0)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearInterval(timerRef.current), [])

  const run = () => {
    window.clearInterval(timerRef.current)
    const t = runTournament(items)
    setRounds(t)
    setRevealed(1)
    timerRef.current = window.setInterval(() => {
      setRevealed((r) => {
        if (r + 1 >= t.length) {
          window.clearInterval(timerRef.current)
          const champ = t[t.length - 1][0]
          if (champ) onResult(champ)
        }
        return r + 1
      })
    }, ROUND_MS)
  }

  const running = rounds !== null && revealed < rounds.length
  const champion = rounds && revealed >= rounds.length ? rounds[rounds.length - 1][0] : null

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {items.length > MAX_SEEDS && (
        <p className="text-xs text-muted-foreground">
          Bracket caps at {MAX_SEEDS}, so each run seeds {MAX_SEEDS} random entrants from your {items.length}.
        </p>
      )}

      {rounds && (
        <div className="w-full overflow-x-auto">
          <div className="flex gap-6 min-w-max px-2 justify-center">
            {rounds.map((round, rIdx) => (
              <div key={rIdx} className="flex flex-col justify-around gap-2">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-center mb-1">
                  {rIdx === rounds.length - 1 ? 'Champion' : rIdx === rounds.length - 2 ? 'Final' : `Round ${rIdx + 1}`}
                </div>
                {round.map((slot, sIdx) => {
                  const isRevealed = rIdx < revealed
                  const isChampion = rIdx === rounds.length - 1 && isRevealed
                  return (
                    <div
                      key={sIdx}
                      className={`w-36 px-2 py-1.5 text-xs truncate border-2 text-center ${
                        !isRevealed
                          ? 'border-dashed border-muted-foreground/40 text-transparent select-none'
                          : slot === null
                            ? 'border-muted-foreground/40 border-dashed text-muted-foreground'
                            : isChampion
                              ? 'border-foreground bg-foreground text-background font-brand text-base'
                              : 'border-foreground'
                      }`}
                      title={isRevealed && slot ? slot.label : undefined}
                    >
                      {isRevealed ? (slot?.label ?? 'bye') : '?'}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={run} disabled={running} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {running ? 'Playing out…' : rounds ? 'Rematch' : 'Seed the bracket'}
      </button>

      {champion && <ResultBanner label={champion.label} image={champion.image} meta={champion.meta} />}
    </div>
  )
}
