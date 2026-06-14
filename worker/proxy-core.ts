/**
 * Shared CORS-proxy logic — runtime-agnostic.
 *
 * The app cannot fetch Letterboxd / Goodreads directly (no CORS headers), and
 * public proxies have all died or gone paid. handleProxy() fetches an
 * allowlisted upstream and re-serves it with CORS headers so the browser is
 * happy. It depends only on web-standard globals (fetch, Request, Response,
 * URL, AbortSignal) so the same code runs on Cloudflare Workers, Cloudflare
 * Pages Functions, and Node 18+ — see the thin wrappers in this directory,
 * functions/, and server/.
 *
 * Request:  GET /?url=<encoded upstream url>
 * Response: the upstream body, verbatim, plus Access-Control-Allow-Origin: *
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// The proxy's security boundary. Without this check the proxy is an OPEN PROXY:
// anyone who finds the URL can route arbitrary traffic through it on your
// account. Only these hosts (and their subdomains, over https) are fetchable.
export const ALLOWED_HOSTS = ['letterboxd.com', 'goodreads.com']

export function isAllowed(target: URL): boolean {
  if (target.protocol !== 'https:') return false
  // Exact host, or a subdomain anchored on a leading dot so a lookalike like
  // "evil-letterboxd.com" can never satisfy the check.
  return ALLOWED_HOSTS.some(
    (h) => target.hostname === h || target.hostname.endsWith('.' + h),
  )
}

/** Handle one proxy request. No edge caching — wrappers add that where available. */
export async function handleProxy(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: CORS })

  const raw = new URL(req.url).searchParams.get('url')
  if (!raw) return new Response('Missing ?url', { status: 400, headers: CORS })

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return new Response('Bad url', { status: 400, headers: CORS })
  }

  if (!isAllowed(target)) return new Response('Host not allowed', { status: 403, headers: CORS })

  let upstream: Response
  try {
    // Follow redirects MANUALLY and re-check every hop: default fetch follows
    // 3xx automatically, so an allowlisted host that redirects to
    // http://169.254.169.254 / localhost / a private IP would bypass the
    // allowlist (SSRF). Each Location must itself pass isAllowed().
    let current = target
    for (let hop = 0; ; hop++) {
      if (hop >= 5) return new Response('Too many redirects', { status: 502, headers: CORS })
      const res = await fetch(current.toString(), {
        headers: { 'User-Agent': 'Randomizr/1.0 (+https://github.com)' },
        redirect: 'manual',
        signal: AbortSignal.timeout(12_000),
      })
      const location = res.status >= 300 && res.status < 400 ? res.headers.get('location') : null
      if (!location) {
        upstream = res
        break
      }
      const next = new URL(location, current) // resolves relative redirects
      if (!isAllowed(next)) return new Response('Redirect to disallowed host', { status: 403, headers: CORS })
      current = next
    }
  } catch {
    return new Response('Upstream fetch failed', { status: 502, headers: CORS })
  }

  if (!upstream.ok) return new Response(`Upstream ${upstream.status}`, { status: 502, headers: CORS })

  const body = await upstream.text()
  return new Response(body, {
    headers: {
      ...CORS,
      'Content-Type': upstream.headers.get('Content-Type') ?? 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
    },
  })
}
