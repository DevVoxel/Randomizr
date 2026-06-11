/**
 * Sites without CORS headers (Letterboxd, Goodreads) are fetched through
 * public CORS proxies, first one that answers wins.
 */
const PROXIES = [
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
]

export async function fetchViaProxy(url: string, timeoutMs = 12_000): Promise<string> {
  let lastError: Error | null = null
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(url), { signal: AbortSignal.timeout(timeoutMs) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastError ?? new Error('All proxies failed')
}
