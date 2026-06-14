/**
 * Standalone Cloudflare Worker entry — wraps the shared handleProxy() with
 * Cloudflare's edge cache so popular feeds are served from the nearest POP.
 *
 * Deploy:  cd worker && npx wrangler deploy   (or paste into the dashboard editor)
 * Then set the app's VITE_PROXY_URL to the resulting *.workers.dev URL.
 */
import { handleProxy } from './proxy-core.ts'

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== 'GET') return handleProxy(req)

    const target = new URL(req.url).searchParams.get('url')
    if (!target) return handleProxy(req)

    // These feeds change slowly and public users hammer them — cache at the edge.
    const cache = caches.default
    const key = new Request(target)
    const hit = await cache.match(key)
    if (hit) return hit

    const res = await handleProxy(req)
    if (res.ok) await cache.put(key, res.clone())
    return res
  },
}
