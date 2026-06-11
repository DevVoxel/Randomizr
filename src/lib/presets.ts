import type { Item } from './types'

export interface Preset {
  id: string
  name: string
  emoji: string
  description: string
  items: string[]
}

export const PRESETS: Preset[] = [
  {
    id: 'movies',
    name: 'Movie Night',
    emoji: '🎬',
    description: 'Crowd-pleasers across every genre',
    items: [
      'The Shawshank Redemption', 'Pulp Fiction', 'Spirited Away', 'The Dark Knight',
      'Parasite', 'Inception', 'Goodfellas', 'Interstellar', 'The Matrix',
      'Back to the Future', 'Alien', 'The Big Lebowski', 'Whiplash', 'Mad Max: Fury Road',
      'Everything Everywhere All at Once', 'The Grand Budapest Hotel', 'Jurassic Park',
      'Blade Runner 2049', 'La La Land', 'Get Out', 'Knives Out', 'Dune',
      'Arrival', 'Her', 'The Truman Show', 'Princess Mononoke', 'Oldboy',
      'Heat', 'No Country for Old Men', 'The Social Network',
    ],
  },
  {
    id: 'food',
    name: 'What to Eat',
    emoji: '🍜',
    description: 'Dinner decided for you',
    items: [
      'Pizza', 'Sushi', 'Tacos', 'Ramen', 'Burgers', 'Thai curry', 'Pho',
      'Fried chicken', 'Pasta carbonara', 'Burritos', 'Dumplings', 'BBQ',
      'Falafel wrap', 'Pad thai', 'Bibimbap', 'Fish and chips', 'Poke bowl',
      'Shawarma', 'Indian curry', 'Greek gyros', 'Hot pot', 'Sandwiches',
      'Salad bowl', 'Korean fried chicken', 'Quesadillas',
    ],
  },
  {
    id: 'names',
    name: 'Name Picker',
    emoji: '🙋',
    description: 'Sample names — replace with your crew',
    items: [
      'Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Avery',
      'Quinn', 'Charlie', 'Dakota', 'Emerson', 'Finley', 'Hayden', 'Jamie', 'Kendall',
    ],
  },
  {
    id: 'activities',
    name: 'Weekend Plans',
    emoji: '🎯',
    description: 'Beat the boredom',
    items: [
      'Hiking', 'Movie marathon', 'Board game night', 'Try a new restaurant',
      'Museum visit', 'Bike ride', 'Cook something new', 'Bowling', 'Mini golf',
      'Picnic in the park', 'Karaoke', 'Escape room', 'Farmers market',
      'Road trip', 'Beach day', 'Arcade', 'Concert', 'Rock climbing',
      'Photography walk', 'Volunteer somewhere',
    ],
  },
  {
    id: 'games',
    name: 'Game Backlog',
    emoji: '🎮',
    description: 'Classics worth (re)playing',
    items: [
      'The Legend of Zelda: Breath of the Wild', 'Elden Ring', 'Hades', 'Portal 2',
      'Hollow Knight', 'Stardew Valley', 'Red Dead Redemption 2', 'Celeste',
      'The Witcher 3', 'Outer Wilds', 'Disco Elysium', 'Baldur’s Gate 3',
      'Minecraft', 'Half-Life 2', 'Super Mario Odyssey', 'Dark Souls',
      'Tetris Effect', 'Slay the Spire', 'God of War', 'Undertale',
    ],
  },
  {
    id: 'debates',
    name: 'Hot Takes',
    emoji: '🔥',
    description: 'Conversation starters',
    items: [
      'Is a hot dog a sandwich?', 'Pineapple on pizza?', 'Cake or pie?',
      'Books or movies?', 'Morning person or night owl?', 'Dogs or cats?',
      'Sweet or savory breakfast?', 'Beach or mountains?', 'Texting or calling?',
      'Tabs or spaces?', 'Cereal: milk first or cereal first?', 'Aliens: real?',
    ],
  },
]

export function presetItems(preset: Preset): Item[] {
  return preset.items.map((label) => ({ id: crypto.randomUUID(), label }))
}
