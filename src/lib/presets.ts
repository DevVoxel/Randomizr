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
  {
    id: 'icebreakers',
    name: 'Icebreakers',
    emoji: '🧊',
    description: 'For meetings that start too quietly',
    items: [
      'What was your first job?', 'Weirdest food you actually like?',
      'Best concert you ever saw?', 'What skill would you master overnight?',
      'Your most controversial kitchen opinion?', 'Worst haircut era?',
      'What were you obsessed with at age ten?', 'Karaoke song of choice?',
      'A place you could move tomorrow?', 'Best purchase under $50?',
      'What would your talk show be about?', 'Phone wallpaper: explain it',
      'Your default road-trip snack?', 'A rule you always break?',
      'What animal underrates itself?', 'Last thing you Googled?',
    ],
  },
  {
    id: 'datenight',
    name: 'Date Night',
    emoji: '💡',
    description: 'Stop saying "I don\'t know, what do you want to do"',
    items: [
      'Cook a new cuisine together', 'Sunset walk + ice cream', 'Trivia night',
      'Pottery or paint class', 'Stargazing drive', 'Thrift store challenge',
      'Build a blanket fort + movie', 'Try the new place in town',
      'Couples massage', 'Bookstore date — pick for each other',
      'Mini road trip, no map', 'Game night, loser does dishes',
      'Fancy dessert, sweatpants dress code', 'Climbing gym',
      'Make pasta from scratch', 'Photo walk: 10 shots each',
    ],
  },
  {
    id: 'chores',
    name: 'Chore Wheel',
    emoji: '🧹',
    description: 'The roommate peace treaty',
    items: [
      'Dishes', 'Trash + recycling', 'Bathroom deep clean', 'Vacuum everything',
      'Grocery run', 'Cook dinner', 'Laundry', 'Mop the kitchen',
      'Clean the fridge', 'Water the plants', 'Dust the shelves', 'Windows',
    ],
  },
  {
    id: 'boardgames',
    name: 'Game Shelf',
    emoji: '🎲',
    description: 'Which box comes off the shelf tonight',
    items: [
      'Catan', 'Ticket to Ride', 'Codenames', 'Wingspan', 'Azul',
      'Splendor', 'Carcassonne', 'Pandemic', '7 Wonders', 'Dominion',
      'Wavelength', 'Just One', 'Skull', 'Cascadia', 'Spirit Island',
      'Betrayal at House on the Hill', 'Camel Up', 'Chess', 'Uno (sorry)',
    ],
  },
  {
    id: 'karaoke',
    name: 'Karaoke Draw',
    emoji: '🎤',
    description: 'You sing what the wheel says',
    items: [
      'Bohemian Rhapsody', "Don't Stop Believin'", 'Dancing Queen',
      'Mr. Brightside', 'I Want It That Way', 'Wonderwall', 'Africa',
      'Livin\' on a Prayer', 'Shallow', 'Total Eclipse of the Heart',
      'Hey Ya!', 'Take On Me', 'My Heart Will Go On', 'Valerie',
      'Sweet Caroline', 'Believe', 'Like a Prayer', 'Lose Yourself',
    ],
  },
  {
    id: 'travel',
    name: 'Next Trip',
    emoji: '🧭',
    description: 'Close your eyes and point at the map',
    items: [
      'Tokyo', 'Lisbon', 'Mexico City', 'Istanbul', 'Seoul', 'Marrakech',
      'Buenos Aires', 'Reykjavik', 'Hanoi', 'Rome', 'Cape Town', 'Oaxaca',
      'Kyoto', 'Tbilisi', 'New Orleans', 'Montreal', 'Taipei', 'Athens',
      'Edinburgh', 'Bali',
    ],
  },
]

export function presetItems(preset: Preset): Item[] {
  return preset.items.map((label) => ({ id: crypto.randomUUID(), label }))
}
