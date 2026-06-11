import { useState } from 'react'
import { Shuffle } from 'lucide-react'
import type { Item } from '../../lib/types'
import { splitTeams } from '../../lib/random'

export default function Teams({ items, onLabel }: { items: Item[]; onLabel: (label: string) => void }) {
  const [count, setCount] = useState(2)
  const [teams, setTeams] = useState<Item[][] | null>(null)

  const maxTeams = Math.min(6, Math.floor(items.length / 2))

  const deal = () => {
    const result = splitTeams(items, count)
    setTeams(result)
    onLabel(`${items.length} split into ${result.length} teams`)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground mr-1">Teams:</span>
        {Array.from({ length: Math.max(maxTeams - 1, 1) }, (_, i) => i + 2).map((n) => (
          <button
            key={n}
            onClick={() => setCount(n)}
            className={`size-9 border-2 border-foreground font-brand text-lg ${
              count === n ? 'bg-foreground text-background' : 'hover:bg-muted'
            }`}
            aria-pressed={count === n}
          >
            {n}
          </button>
        ))}
      </div>

      <button onClick={deal} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Shuffle className="size-5" />
        {teams ? 'Deal again' : 'Deal teams'}
      </button>

      {teams && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {teams.map((team, t) => (
            <section key={t} className="ink-card hard-shadow-sm">
              <h3 className="font-brand text-xl px-3 py-1.5 bg-foreground text-background">
                Team {t + 1}
                <span className="float-right text-sm pt-1">{team.length}</span>
              </h3>
              <ul className="p-3 text-sm flex flex-col gap-1">
                {team.map((member) => (
                  <li key={member.id} className="flex items-center gap-2">
                    {member.image && <img src={member.image} alt="" className="size-5 object-cover border border-foreground" />}
                    <span className="truncate">{member.label}</span>
                    {member.meta && <span className="text-xs text-muted-foreground shrink-0">({member.meta})</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
