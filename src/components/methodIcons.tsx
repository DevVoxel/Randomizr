import {
  ArrowDownToDot, ArrowUpDown, CircleDot, Clapperboard, Clock, Coins, Dices,
  Flag, Hash, Layers, LoaderPinwheel, PartyPopper, Slash, Split, Target,
  Globe, Trophy, Users, Wine,
} from 'lucide-react'
import type { MethodId } from '../lib/types'

export const METHOD_ICONS: Record<MethodId, React.ReactNode> = {
  wheel: <LoaderPinwheel className="size-6" />,
  cards: <Layers className="size-6" />,
  slots: <Clapperboard className="size-6" />,
  ladder: <Split className="size-6" />,
  bracket: <Trophy className="size-6" />,
  teams: <Users className="size-6" />,
  straws: <Slash className="size-6" />,
  eeny: <Target className="size-6" />,
  sortrace: <ArrowUpDown className="size-6" />,
  plinko: <ArrowDownToDot className="size-6" />,
  bottle: <Wine className="size-6" />,
  balloons: <PartyPopper className="size-6" />,
  marbles: <Flag className="size-6" />,
  dice: <Dices className="size-6" />,
  number: <Hash className="size-6" />,
  coin: <Coins className="size-6" />,
  eightball: <CircleDot className="size-6" />,
  wiki: <Globe className="size-6" />,
  timeline: <Clock className="size-6" />,
}
