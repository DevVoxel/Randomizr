import { randomInt } from './random'

/**
 * Wikipedia's REST API serves CORS-open JSON, no proxy needed.
 * Random article: /page/random/summary
 * On this day:    /feed/onthisday/events/{mm}/{dd}
 */
const WIKI = 'https://en.wikipedia.org/api/rest_v1'

export interface WikiCard {
  title: string
  extract: string
  meta?: string
  image?: string
  url: string
}

interface RestSummary {
  title?: string
  description?: string
  extract?: string
  thumbnail?: { source?: string }
  content_urls?: { desktop?: { page?: string } }
}

async function fetchSummary(): Promise<WikiCard | null> {
  const res = await fetch(`${WIKI}/page/random/summary`, { signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`Wikipedia answered HTTP ${res.status}`)
  const data = (await res.json()) as RestSummary
  if (!data.title || !data.extract) return null
  return {
    title: data.title,
    extract: data.extract,
    meta: data.description || undefined,
    image: data.thumbnail?.source,
    url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
  }
}

export async function randomArticle(): Promise<WikiCard> {
  for (let tries = 0; tries < 4; tries++) {
    const card = await fetchSummary()
    if (card) return card
  }
  throw new Error('Wikipedia kept dealing blanks, try again')
}

const PERSON_HINT =
  /\b(actor|actress|singer|musician|writer|author|poet|painter|artist|politician|player|footballer|athlete|scientist|physicist|chemist|biologist|mathematician|engineer|director|producer|composer|journalist|historian|philosopher|economist|comedian|dancer|architect|activist|general|admiral|bishop|monarch|king |queen |emperor|president|minister|judge|lawyer|professor|coach|wrestler|boxer|cyclist|swimmer|racing driver|born \d{4}|\d{4}–\d{4}|\(born)\b/i

/** Redraws until the description smells like a biography. */
export async function randomPerson(): Promise<WikiCard> {
  for (let tries = 0; tries < 12; tries++) {
    const card = await fetchSummary()
    if (card && PERSON_HINT.test(`${card.meta ?? ''} ${card.extract.slice(0, 160)}`)) return card
  }
  throw new Error('No people in this hand of cards, try again')
}

interface OnThisDayEvent {
  year?: number
  text?: string
  pages?: { content_urls?: { desktop?: { page?: string } }; thumbnail?: { source?: string }; title?: string }[]
}

export async function randomOnThisDay(): Promise<WikiCard> {
  // a random calendar day, capped at 28 so every month is valid
  const mm = String(randomInt(1, 12)).padStart(2, '0')
  const dd = String(randomInt(1, 28)).padStart(2, '0')
  const res = await fetch(`${WIKI}/feed/onthisday/events/${mm}/${dd}`, { signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`Wikipedia answered HTTP ${res.status}`)
  const data = (await res.json()) as { events?: OnThisDayEvent[] }
  const events = (data.events ?? []).filter((e) => e.text && e.year)
  if (!events.length) throw new Error('History was quiet that day, try again')
  const e = events[randomInt(0, events.length - 1)]
  const page = e.pages?.[0]
  const monthName = new Date(2000, Number(mm) - 1, Number(dd)).toLocaleDateString('en', { month: 'long' })
  return {
    title: `${monthName} ${Number(dd)}, ${e.year}`,
    extract: e.text ?? '',
    meta: 'on this day',
    image: page?.thumbnail?.source,
    url: page?.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${monthName}_${Number(dd)}`,
  }
}
