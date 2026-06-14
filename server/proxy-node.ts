/**
 * Node CORS proxy for self-hosting on a VPS — wraps the same handleProxy() the
 * Cloudflare entries use, so the security allowlist stays in one place
 * (worker/proxy-core.ts).
 *
 * Node 18+ provides fetch/Request/Response globally; Node 23.6+ runs this .ts
 * file with no build step. Run it directly:
 *
 *   node server/proxy-node.ts            # listens on :8787 (or $PORT)
 *
 * Put it behind your existing reverse proxy (nginx/Caddy) on a path or
 * subdomain, then point the app's VITE_PROXY_URL at that public URL.
 * For production, supervise it with systemd or pm2 so it restarts on crash.
 */
import { createServer } from 'node:http'
import { handleProxy } from '../worker/proxy-core.ts'

const port = Number(process.env.PORT ?? 8787)
const origin = `http://localhost:${port}`

createServer(async (req, res) => {
  // Adapt Node's req into a web Request for handleProxy, then stream the
  // web Response back out through Node's res.
  const request = new Request(new URL(req.url ?? '/', origin), { method: req.method })
  const out = await handleProxy(request)
  res.statusCode = out.status
  out.headers.forEach((v, k) => res.setHeader(k, v))
  res.end(await out.text())
}).listen(port, () => console.log(`Randomizr proxy on :${port}`))
