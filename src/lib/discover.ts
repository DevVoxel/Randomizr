import { randomInt } from './random'

/**
 * Discover channels pull one random thing from a public, keyless,
 * CORS-friendly API and shape it into a uniform card. Curated from
 * github.com/public-apis/public-apis plus a few proven regulars.
 */

export interface DiscoverCard {
  kicker: string
  title: string
  sub?: string
  image?: string
  body?: string
  lines?: string[]
  facts?: [string, string][]
  answer?: string
  link?: string
  linkLabel?: string
  embedUrl?: string
}

export interface Channel {
  id: string
  name: string
  note: string
  credit: string
  pull: () => Promise<DiscoverCard>
}

const get = async (url: string, timeoutMs = 12_000) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  if (!res.ok) throw new Error(`The API answered HTTP ${res.status}`)
  return res.json()
}

const decodeEntities = (s: string) => {
  const doc = new DOMParser().parseFromString(s, 'text/html')
  return doc.documentElement.textContent ?? s
}

/* ---------------- space ---------------- */

interface Apod {
  title?: string
  date?: string
  explanation?: string
  url?: string
  media_type?: string
  copyright?: string
}

async function pullSpace(): Promise<DiscoverCard> {
  // the community mirror answers in seconds; nasa.gov's demo gateway often does not
  let data: Apod[]
  try {
    data = (await get('https://apod.ellanan.com/api?count=1', 8_000)) as Apod[]
  } catch {
    data = (await get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=1')) as Apod[]
  }
  const a = data[0]
  if (!a?.title) throw new Error('NASA sent an empty sky')
  return {
    kicker: a.date ? `nasa apod · ${a.date}` : 'nasa apod',
    title: a.title,
    image: a.media_type === 'image' ? a.url : undefined,
    body: a.explanation,
    facts: a.copyright ? [['credit', a.copyright.trim()]] : undefined,
    link: `https://apod.nasa.gov/apod/`,
    linkLabel: 'apod archive →',
  }
}

/* ---------------- earth ---------------- */

interface NominatimAnswer {
  display_name?: string
  address?: { country?: string; state?: string; county?: string; city?: string; town?: string; village?: string }
  error?: string
}

async function pullEarth(): Promise<DiscoverCard> {
  // area-fair point on the sphere: longitude uniform, latitude arcsine-weighted
  const u = randomInt(0, 1_000_000) / 1_000_000
  const lat = (Math.asin(2 * u - 1) * 180) / Math.PI
  const lon = randomInt(-180_000, 180_000) / 1000
  const latR = lat.toFixed(4)
  const lonR = lon.toFixed(4)
  let where = 'Open water, most likely'
  let country = ''
  try {
    const geo = (await get(
      `https://nominatim.openstreetmap.org/reverse?lat=${latR}&lon=${lonR}&format=jsonv2&zoom=10&accept-language=en`,
    )) as NominatimAnswer
    if (geo.display_name) where = geo.display_name
    country = geo.address?.country ?? ''
  } catch {
    // the ocean does not return errors politely, keep the default
  }
  const d = 3
  return {
    kicker: 'a random point on earth',
    title: country || where.split(',')[0] || 'Somewhere',
    sub: where,
    facts: [
      ['latitude', `${latR}°`],
      ['longitude', `${lonR}°`],
    ],
    embedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d}%2C${lat - d}%2C${lon + d}%2C${lat + d}&layer=mapnik&marker=${latR}%2C${lonR}`,
    link: `https://www.openstreetmap.org/#map=8/${latR}/${lonR}`,
    linkLabel: 'open the map →',
  }
}

/* ---------------- art ---------------- */

interface ArticArtwork {
  title?: string
  artist_display?: string
  date_display?: string
  image_id?: string | null
  id?: number
}

async function pullArt(): Promise<DiscoverCard> {
  for (let tries = 0; tries < 4; tries++) {
    const page = randomInt(1, 1000)
    const data = (await get(
      `https://api.artic.edu/api/v1/artworks?page=${page}&limit=1&fields=id,title,artist_display,date_display,image_id`,
    )) as { data?: ArticArtwork[] }
    const a = data.data?.[0]
    if (a?.image_id && a.title) {
      return {
        kicker: 'art institute of chicago',
        title: a.title,
        sub: [a.artist_display, a.date_display].filter(Boolean).join(' · '),
        image: `https://www.artic.edu/iiif/2/${a.image_id}/full/843,/0/default.jpg`,
        link: a.id ? `https://www.artic.edu/artworks/${a.id}` : undefined,
        linkLabel: 'view at the museum →',
      }
    }
  }
  throw new Error('The museum kept sending empty frames, pull again')
}

/* ---------------- trivia ---------------- */

interface TriviaAnswer {
  results?: { category?: string; question?: string; correct_answer?: string; difficulty?: string }[]
}

async function pullTrivia(): Promise<DiscoverCard> {
  const data = (await get('https://opentdb.com/api.php?amount=1')) as TriviaAnswer
  const q = data.results?.[0]
  if (!q?.question || !q.correct_answer) throw new Error('The quizmaster is out')
  return {
    kicker: `open trivia db · ${decodeEntities(q.category ?? 'general')} · ${q.difficulty ?? ''}`,
    title: decodeEntities(q.question),
    answer: decodeEntities(q.correct_answer),
  }
}

/* ---------------- poetry ---------------- */

interface Poem {
  title?: string
  author?: string
  lines?: string[]
}

async function pullPoem(): Promise<DiscoverCard> {
  const data = (await get('https://poetrydb.org/random')) as Poem[]
  const p = data[0]
  if (!p?.lines?.length) throw new Error('The muse stepped out')
  const lines = p.lines.slice(0, 14)
  if (p.lines.length > 14) lines.push('…')
  return {
    kicker: 'poetrydb',
    title: p.title ?? 'Untitled',
    sub: p.author,
    lines,
  }
}

/* ---------------- country ---------------- */

interface Country {
  name?: { common?: string; official?: string }
  capital?: string[]
  population?: number
  region?: string
  subregion?: string
  languages?: Record<string, string>
  flags?: { svg?: string; png?: string }
  area?: number
}

let countryCache: Country[] | null = null

async function pullCountry(): Promise<DiscoverCard> {
  if (!countryCache) {
    countryCache = (await get(
      'https://restcountries.com/v3.1/all?fields=name,capital,population,region,subregion,languages,flags,area',
    )) as Country[]
  }
  const c = countryCache[randomInt(0, countryCache.length - 1)]
  if (!c?.name?.common) throw new Error('The atlas page was blank')
  return {
    kicker: 'rest countries',
    title: c.name.common,
    sub: c.name.official,
    image: c.flags?.svg ?? c.flags?.png,
    facts: [
      ['capital', c.capital?.join(', ') || 'none'],
      ['region', [c.region, c.subregion].filter(Boolean).join(' · ')],
      ['population', (c.population ?? 0).toLocaleString('en')],
      ['area', `${(c.area ?? 0).toLocaleString('en')} km²`],
      ['languages', Object.values(c.languages ?? {}).slice(0, 4).join(', ') || 'unlisted'],
    ],
  }
}

/* ---------------- meal ---------------- */

interface Meal {
  meals?: { strMeal?: string; strCategory?: string; strArea?: string; strMealThumb?: string; idMeal?: string }[]
}

async function pullMeal(): Promise<DiscoverCard> {
  const data = (await get('https://www.themealdb.com/api/json/v1/1/random.php')) as Meal
  const m = data.meals?.[0]
  if (!m?.strMeal) throw new Error('The kitchen is closed')
  return {
    kicker: 'themealdb',
    title: m.strMeal,
    sub: [m.strArea, m.strCategory].filter(Boolean).join(' · '),
    image: m.strMealThumb ? `${m.strMealThumb}/medium` : undefined,
    link: m.idMeal ? `https://www.themealdb.com/meal/${m.idMeal}` : undefined,
    linkLabel: 'full recipe →',
  }
}

/* ---------------- cocktail ---------------- */

interface Cocktail {
  drinks?: {
    strDrink?: string
    strCategory?: string
    strAlcoholic?: string
    strDrinkThumb?: string
    strInstructions?: string
  }[]
}

async function pullCocktail(): Promise<DiscoverCard> {
  const data = (await get('https://www.thecocktaildb.com/api/json/v1/1/random.php')) as Cocktail
  const c = data.drinks?.[0]
  if (!c?.strDrink) throw new Error('The bar is dry')
  return {
    kicker: 'thecocktaildb',
    title: c.strDrink,
    sub: [c.strAlcoholic, c.strCategory].filter(Boolean).join(' · '),
    image: c.strDrinkThumb ? `${c.strDrinkThumb}/medium` : undefined,
    body: c.strInstructions,
  }
}

/* ---------------- dog ---------------- */

interface DogAnswer {
  message?: string
  status?: string
}

async function pullDog(): Promise<DiscoverCard> {
  const data = (await get('https://dog.ceo/api/breeds/image/random')) as DogAnswer
  if (!data.message) throw new Error('No dogs answered')
  const breed = /breeds\/([^/]+)\//.exec(data.message)?.[1]?.replaceAll('-', ' ')
  return {
    kicker: 'dog.ceo · stanford dogs dataset',
    title: breed ? breed.replace(/\b\w/g, (ch) => ch.toUpperCase()) : 'Dog',
    image: data.message,
  }
}

export const CHANNELS: Channel[] = [
  {
    id: 'space',
    name: 'Space',
    note: 'a random astronomy picture of the day',
    credit: 'NASA APOD',
    pull: pullSpace,
  },
  {
    id: 'earth',
    name: 'Somewhere on Earth',
    note: 'an area-fair random coordinate, mapped',
    credit: 'OpenStreetMap · Nominatim',
    pull: pullEarth,
  },
  {
    id: 'art',
    name: 'Artwork',
    note: 'one piece from a 120,000-work collection',
    credit: 'Art Institute of Chicago',
    pull: pullArt,
  },
  {
    id: 'trivia',
    name: 'Trivia question',
    note: 'with the answer face down',
    credit: 'Open Trivia DB',
    pull: pullTrivia,
  },
  {
    id: 'poem',
    name: 'Poem',
    note: 'verse roulette',
    credit: 'PoetryDB',
    pull: pullPoem,
  },
  {
    id: 'country',
    name: 'Country',
    note: 'flag, facts, and figures',
    credit: 'REST Countries',
    pull: pullCountry,
  },
  {
    id: 'meal',
    name: 'Dinner idea',
    note: 'a dish you were not going to think of',
    credit: 'TheMealDB',
    pull: pullMeal,
  },
  {
    id: 'cocktail',
    name: 'Cocktail',
    note: 'mixed by the void',
    credit: 'TheCocktailDB',
    pull: pullCocktail,
  },
  {
    id: 'dog',
    name: 'Dog',
    note: 'science-grade dog pictures',
    credit: 'Dog CEO',
    pull: pullDog,
  },
]
