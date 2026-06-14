# The watchlist proxy

Letterboxd and Goodreads serve public RSS but send **no CORS headers**, so the
browser refuses to read them directly. The app fetches them through a small
proxy that re-serves the response with `Access-Control-Allow-Origin: *`.

> Letterboxd/Goodreads also offer **CSV import**, which needs no proxy at all.
> The proxy only powers the "by username" / "by shelf" RSS path. If you skip
> deploying a proxy, CSV import still works and the RSS path falls back to
> public proxies (unreliable — see below).

## Why we self-host

The app originally relied on public CORS proxies (`corsproxy.io`,
`allorigins.win`, …). They have since died, started rate-limiting, or gone
paid (`corsproxy.io` now returns `403 Free usage is limited to localhost`).
They remain in `src/lib/proxy.ts` **only as a last-resort fallback**. The
dependable path is to run your own — it is ~60 lines and free.

## How it fits together

```
src/lib/proxy.ts        app picks VITE_PROXY_URL first, public proxies as fallback
worker/proxy-core.ts    shared logic: allowlist + fetch + CORS  (the security boundary)
worker/proxy-worker.ts  Cloudflare Worker wrapper  (+ edge cache)
functions/proxy.ts      Cloudflare Pages Function wrapper  (+ edge cache)
server/proxy-node.ts    Node server wrapper  (for a VPS)
```

All three runtimes call the **same** `handleProxy()`. The host allowlist lives
once, in `proxy-core.ts`:

```ts
export const ALLOWED_HOSTS = ['letterboxd.com', 'goodreads.com']
```

Only these hosts and their subdomains, over `https`, are fetchable. Everything
else gets `403`. This matters: a proxy with no allowlist is an **open proxy** —
anyone who finds the URL can route arbitrary traffic through your account.
To proxy another source later, add its host here.

Redirects are followed **manually** and every hop is re-checked through
`isAllowed()` (bounded to 5 hops). Otherwise an allowlisted host that replied
`302 → http://169.254.169.254/` or `→ http://localhost` would smuggle the proxy
into your internal network (SSRF). On Cloudflare the edge already refuses
private/loopback destinations; on a **self-hosted VPS**, for defence-in-depth
against DNS rebinding you may additionally resolve the target host and reject
loopback/private/link-local IPs before fetching.

After deploying by any method below, set the app env var and rebuild:

```bash
# .env
VITE_PROXY_URL=https://your-proxy-url    # absolute, or "/proxy" if same-origin
```

`VITE_PROXY_URL` is read at **build time** (Vite inlines it), so rebuild/redeploy
the front end after changing it.

---

## Option A — Cloudflare Pages Function (recommended if the site is on Cloudflare Pages)

You do **not** need a separate Worker. Because the site already deploys on
Cloudflare Pages, the `functions/` directory ships serverless functions
alongside the static build automatically. `functions/proxy.ts` is served at
`/proxy` on the **same origin** as the site — no extra domain, no CORS hop, no
`wrangler`.

1. Keep `functions/proxy.ts` in the repo (already here).
2. Push. Cloudflare Pages builds and deploys it with the site.
3. Set `VITE_PROXY_URL=/proxy` (relative — same origin) and redeploy.

That's it. Verify with:

```bash
curl "https://your-site/proxy?url=https%3A%2F%2Fletterboxd.com%2Fdave%2Frss%2F"
```

## Option B — Standalone Cloudflare Worker, from the dashboard (no CLI)

Answering "can I do it from Cloudflare itself?" — yes:

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Create Worker**.
2. **Edit code**, paste the contents of `worker/proxy-core.ts` and
   `worker/proxy-worker.ts` (inline the import, or paste core above the
   `export default`), **Deploy**.
3. Copy the `*.workers.dev` URL → `VITE_PROXY_URL=https://…workers.dev` →
   rebuild the front end.

You can also connect this Git repo under **Workers Builds** so Cloudflare
rebuilds the Worker on every push instead of pasting.

## Option C — Standalone Cloudflare Worker, via wrangler (CLI)

```bash
cd worker
npx wrangler login
npx wrangler deploy
```

Copy the printed `*.workers.dev` URL into `VITE_PROXY_URL`, rebuild the app.
Use `npx wrangler dev` to run it locally on `http://localhost:8787`.

## Option D — Self-host on a VPS (Node)

`server/proxy-node.ts` is the same logic as a plain Node HTTP server. Node 18+
provides `fetch`/`Response` globally and Node 23.6+ runs the `.ts` file with no
build step.

```bash
node server/proxy-node.ts        # listens on :8787 (override with PORT)
```

Front it with your existing reverse proxy and supervise it so it restarts on
crash.

**systemd** (`/etc/systemd/system/randomizr-proxy.service`):

```ini
[Unit]
Description=Randomizr CORS proxy
After=network.target

[Service]
WorkingDirectory=/srv/randomizr
ExecStart=/usr/bin/node server/proxy-node.ts
Environment=PORT=8787
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now randomizr-proxy
```

**nginx** — expose it on a subdomain (or a path) with TLS:

```nginx
server {
    server_name proxy.example.com;
    location / {
        proxy_pass http://127.0.0.1:8787;
    }
    # ... certbot-managed listen 443 / ssl_certificate lines ...
}
```

Then `VITE_PROXY_URL=https://proxy.example.com`, rebuild the app.

Prefer pm2? `pm2 start "node server/proxy-node.ts" --name randomizr-proxy`.

---

## Verifying any deployment

```bash
# allowed host -> 200 + RSS body
curl -i "https://your-proxy/?url=https%3A%2F%2Fletterboxd.com%2Fdave%2Frss%2F"
# blocked host -> 403
curl -i "https://your-proxy/?url=https://example.com"
# http scheme  -> 403
curl -i "https://your-proxy/?url=http://letterboxd.com/x"
```

A `200` with `<letterboxd:filmTitle>` in the body and
`access-control-allow-origin: *` in the headers means it works.
