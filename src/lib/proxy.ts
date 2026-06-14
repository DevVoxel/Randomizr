/**
 * Sites without CORS headers (Letterboxd, Goodreads) are fetched through
 * public CORS proxies, first one that answers wins. Public proxies are flaky
 * and rate-limit, so we keep several and fall through on any failure.
 *
 * Each entry returns the request URL plus a reader: most proxies stream the
 * raw body, but allorigins' reliable endpoint wraps it as JSON {contents}.
 */
type Proxy = {
  url: (target: string) => string
  read: (res: Response) => Promise<string>
}

const text = (res: Response) => res.text()
const allOriginsJson = async (res: Response) => {
  const { contents } = (await res.json()) as { contents: string }
  if (!contents) throw new Error('Empty proxy payload')
  return contents
}

// Our own Cloudflare Worker (worker/proxy-worker.ts) is the primary route when
// VITE_PROXY_URL is set at build time. Public proxies stay as a fallback for
// local dev / if the Worker is down, but they are unreliable (rate-limited,
// frequently dead) — the Worker is what makes this feature dependable.
const ownProxy = import.meta.env.VITE_PROXY_URL as string | undefined

const PROXIES: Proxy[] = [
  ...(ownProxy ? [{ url: (u: string) => `${ownProxy}?url=${encodeURIComponent(u)}`, read: text }] : []),
  { url: (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`, read: allOriginsJson },
  { url: (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`, read: text },
  { url: (u) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`, read: text },
  { url: (u) => `https://thingproxy.freeboard.io/fetch/${u}`, read: text },
]

export async function fetchViaProxy(url: string, timeoutMs = 12_000): Promise<string> {
  let lastError: Error | null = null
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy.url(url), { signal: AbortSignal.timeout(timeoutMs) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await proxy.read(res)
      if (!body.trim()) throw new Error('Empty response')
      return body
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastError ?? new Error('All proxies failed')
}
