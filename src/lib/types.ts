export interface Item {
  id: string
  label: string
  image?: string
  meta?: string
}

export interface SavedList {
  id: string
  name: string
  items: Item[]
  createdAt: number
  updatedAt: number
}

export interface SpinResult {
  id: string
  label: string
  image?: string
  meta?: string
  method: string
  at: number
}

export type MethodId =
  | 'wheel'
  | 'cards'
  | 'slots'
  | 'dice'
  | 'ladder'
  | 'bracket'
  | 'teams'
  | 'straws'
  | 'eeny'
  | 'sortrace'
  | 'plinko'
  | 'number'
  | 'coin'
  | 'eightball'
  | 'timeline'

export interface MethodDef {
  id: MethodId
  name: string
  tagline: string
  description: string
  /** items needed before the method can run; 0 = works without a list */
  minItems: number
}

export const METHODS: MethodDef[] = [
  {
    id: 'wheel',
    name: 'Roulette Wheel',
    tagline: 'the classic',
    description: 'Every item gets a slice. Flick it, watch it slow down, argue with the result, spin again.',
    minItems: 2,
  },
  {
    id: 'cards',
    name: 'Card Draw',
    tagline: 'pick one, any one',
    description: 'Your list, face down on the table. The card you pick was always going to be the card you picked.',
    minItems: 2,
  },
  {
    id: 'slots',
    name: 'Slot Machine',
    tagline: 'three reels',
    description: 'Three reels, one verdict. The lever does the deciding so you don’t have to.',
    minItems: 2,
  },
  {
    id: 'ladder',
    name: 'Ladder Lottery',
    tagline: 'amidakuji',
    description: 'The Japanese ghost-leg ladder. Items at the top, random rungs in the middle, one marked slot at the bottom.',
    minItems: 2,
  },
  {
    id: 'bracket',
    name: 'Tournament',
    tagline: 'single elimination',
    description: 'Your list seeds a bracket. The RNG referees every matchup, round by round, until one champion is left.',
    minItems: 3,
  },
  {
    id: 'teams',
    name: 'Team Splitter',
    tagline: 'fair groups',
    description: 'Deals your list into random teams. Nobody gets picked last, nobody gets to blame the captain.',
    minItems: 4,
  },
  {
    id: 'straws',
    name: 'Short Straw',
    tagline: 'pull one',
    description: 'A fist of straws, one cut short. Pull any straw to open the hand. Whoever holds the short one takes the verdict.',
    minItems: 2,
  },
  {
    id: 'eeny',
    name: 'Eeny Meeny',
    tagline: 'counting-out',
    description: 'The schoolyard rhyme, run to completion. Counting eliminates items one at a time until a single survivor remains.',
    minItems: 3,
  },
  {
    id: 'sortrace',
    name: 'Sort Race',
    tagline: 'algorithms, racing',
    description: 'Your items get secret random ranks, then bubble, insertion, and selection sort race to put them in order. The nerdiest shuffle on the site.',
    minItems: 3,
  },
  {
    id: 'plinko',
    name: 'Plinko',
    tagline: 'aim, drop, pray',
    description: 'A board of ink pegs, a disc, and gravity. Aim the drop wherever you like. The bounces have other plans.',
    minItems: 2,
  },
  {
    id: 'dice',
    name: 'Dice Roll',
    tagline: '1d6 to 6d6',
    description: 'Roll up to six dice. Take the total raw, or map it onto your list.',
    minItems: 0,
  },
  {
    id: 'number',
    name: 'Number Generator',
    tagline: 'raw RNG',
    description: 'Numbers in any range, with or without repeats. Rejection-sampled, no modulo bias.',
    minItems: 0,
  },
  {
    id: 'coin',
    name: 'Coin Flip',
    tagline: '50/50',
    description: 'Two sides, named whatever you want. The oldest decision engine there is.',
    minItems: 0,
  },
  {
    id: 'eightball',
    name: 'Magic 8-Ball',
    tagline: 'ask it anything',
    description: 'Twenty stock answers, one shaken sphere. No list required, just a question you were going to answer yourself anyway.',
    minItems: 0,
  },
  {
    id: 'timeline',
    name: 'Timeline Shuffle',
    tagline: 'full reorder',
    description: 'Shuffles the whole list into one random sequence. Turn order, rankings, backlogs.',
    minItems: 2,
  },
]

export function getMethod(id: string | undefined): MethodDef | undefined {
  return METHODS.find((m) => m.id === id)
}

export function makeItem(label: string, extra?: Partial<Item>): Item {
  return {
    id: crypto.randomUUID(),
    label: label.trim(),
    ...extra,
  }
}
