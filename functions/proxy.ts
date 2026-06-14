/**
 * Cloudflare Pages Function — serves the CORS proxy at /proxy on the SAME
 * origin as the site. Because the repo is already deployed on Cloudflare
 * Pages, dropping this file in functions/ ships the proxy automatically on the
 * next build: no separate Worker, no extra domain, no wrangler.
 *
 * Same origin means the app can use a relative VITE_PROXY_URL=/proxy.
 *
 * Maps:  functions/proxy.ts  ->  https://<your-site>/proxy
 */
import { handleProxy } from '../worker/proxy-core.ts'

export const onRequest: PagesFunction = async ({ request }) => {
  if (request.method !== 'GET') return handleProxy(request)

  const target = new URL(request.url).searchParams.get('url')
  if (!target) return handleProxy(request)

  const cache = caches.default
  const key = new Request(target)
  const hit = await cache.match(key)
  if (hit) return hit

  const res = await handleProxy(request)
  if (res.ok) await cache.put(key, res.clone())
  return res
}
