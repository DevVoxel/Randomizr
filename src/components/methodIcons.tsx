import { Clapperboard, Clock, Coins, Dices, Hash, Layers, LoaderPinwheel, Split, Trophy, Users } from 'lucide-react'
import type { MethodId } from '../lib/types'

export const METHOD_ICONS: Record<MethodId, React.ReactNode> = {
  wheel: <LoaderPinwheel className="size-6" />,
  cards: <Layers className="size-6" />,
  slots: <Clapperboard className="size-6" />,
  ladder: <Split className="size-6" />,
  bracket: <Trophy className="size-6" />,
  teams: <Users className="size-6" />,
  dice: <Dices className="size-6" />,
  number: <Hash className="size-6" />,
  coin: <Coins className="size-6" />,
  timeline: <Clock className="size-6" />,
}
