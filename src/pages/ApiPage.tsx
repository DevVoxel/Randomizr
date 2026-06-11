import { Link } from 'react-router-dom'

const SNIPPET = `// theRandomizr's picker, MIT licensed, take it.
// CSPRNG + rejection sampling, no modulo bias.
function randomInt(min, max) {
  const range = max - min + 1
  const limit = 0xffffffff - (0xffffffff % range)
  const buf = new Uint32Array(1)
  let v
  do {
    crypto.getRandomValues(buf)
    v = buf[0]
  } while (v >= limit)
  return min + (v % range)
}

// Fisher-Yates, every permutation equally likely
function shuffle(arr) {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}`

const SHARE_SPEC = `// a shared list is base64url-encoded JSON in ?share=
{
  "n": "Office Lunch",            // list name
  "i": [                          // items as tuples
    ["Ramen"],                    // [label]
    ["Dune", "2021"],             // [label, meta]
    ["Poster", null, "https://…"] // [label, meta, image-url]
  ]
}

// a shared verdict is one tuple in ?result=
["Dune", "2021"]`

const URL_RECIPES: [string, string][] = [
  ['/randomize/wheel?preset=movies', 'open a method with a built-in list loaded'],
  ['/randomize/dice', 'every method is addressable by its slug'],
  ['/randomize/wheel?share=<code>', 'open a method with your own list loaded'],
  ['/randomize/wheel?result=<code>', 'show someone a verdict you already got'],
]

export default function ApiPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24">
      <header className="pt-12 pb-6 border-b-2 border-foreground">
        <h1 className="font-brand text-5xl sm:text-6xl">The API</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything on this site is addressable, and the randomness itself is
          yours to copy. No keys, no accounts, no SDK with a mascot.
        </p>
      </header>

      <section className="pt-8">
        <h2 className="font-brand text-2xl mb-3">URLs are the interface</h2>
        <p className="text-sm leading-6 mb-4">
          The site runs entirely in the browser, so its public surface is links.
          Build them, share them, put them behind your own buttons.
        </p>
        <dl className="text-sm">
          {URL_RECIPES.map(([url, what]) => (
            <div key={url} className="py-2 border-b border-dotted border-muted-foreground/50">
              <dt className="font-semibold break-all">{url}</dt>
              <dd className="text-muted-foreground text-xs mt-0.5">{what}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pt-10">
        <h2 className="font-brand text-2xl mb-3">The share format</h2>
        <p className="text-sm leading-6 mb-4">
          Lists and verdicts travel as base64url-encoded JSON. Generate the code
          in any language, point a URL at it, and the site does the rest.
        </p>
        <pre className="bg-foreground text-background text-xs p-4 overflow-x-auto leading-relaxed hard-shadow-sm">
          <code>{SHARE_SPEC}</code>
        </pre>
      </section>

      <section className="pt-10">
        <h2 className="font-brand text-2xl mb-3">Take the dice with you</h2>
        <p className="text-sm leading-6 mb-4">
          The fairest API call is the one you do not make. This is the exact
          picker this site uses. It is explained line by line in{' '}
          <Link to="/learn/how-this-site-rolls" className="underline underline-offset-2 decoration-2 hover:decoration-dotted">
            How theRandomizr rolls
          </Link>
          .
        </p>
        <pre className="bg-foreground text-background text-xs p-4 overflow-x-auto leading-relaxed hard-shadow-sm">
          <code>{SNIPPET}</code>
        </pre>
      </section>

      <section className="pt-10">
        <h2 className="font-brand text-2xl mb-3">The hosted endpoint, eventually</h2>
        <p className="text-sm leading-6">
          A served JSON endpoint, the kind you can curl, needs a server, and this
          site does not have one yet. It arrives together with the lava lamp
          entropy feed, because they share the plumbing. The shape it will take
          is sketched in{' '}
          <Link to="/learn/blueprint-the-lamp" className="underline underline-offset-2 decoration-2 hover:decoration-dotted">
            Blueprint: the lamp
          </Link>
          . Until then the browser is the server, and it is a surprisingly good one.
        </p>
      </section>
    </main>
  )
}
