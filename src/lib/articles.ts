export type Block =
  | { t: 'p'; text: string }
  | { t: 'h2'; text: string }
  | { t: 'code'; text: string }
  | { t: 'quote'; text: string }

export interface Article {
  slug: string
  title: string
  deck: string
  date: string
  minutes: number
  blocks: Block[]
}

export const ARTICLES: Article[] = [
  {
    slug: 'two-kinds-of-random',
    title: 'Two kinds of random',
    deck: 'Pseudorandom numbers are made by math. True random numbers are harvested from the physical world. Both are useful; only one is unpredictable in principle.',
    date: '2026-06-11',
    minutes: 4,
    blocks: [
      {
        t: 'p',
        text: 'Ask a computer for a random number and you have a problem: computers are deterministic machines. Give one the same starting state twice and it will do exactly the same thing twice. There is no coin inside. So where do random numbers come from?',
      },
      { t: 'h2', text: 'Pseudorandom: math pretending' },
      {
        t: 'p',
        text: 'A pseudorandom number generator (PRNG) is a formula. You feed it a starting value called a seed, and it stretches that seed into a long stream of numbers that look random: they pass statistical tests, they spread out evenly, they do not visibly repeat. But the stream is fully determined by the seed. Know the seed (or recover the internal state) and you can predict every number that will ever come out. The classic example is the linear congruential generator, three multiplications and a remainder, which powered decades of video game loot and Monte Carlo simulations.',
      },
      {
        t: 'p',
        text: 'For games, simulations, and shuffling a playlist, this is fine. For lotteries, cryptographic keys, and anything an adversary would love to predict, it is not. People have emptied slot machines and broken session tokens by reverse-engineering PRNG state.',
      },
      { t: 'h2', text: 'True random: physics, sampled' },
      {
        t: 'p',
        text: 'A true random number generator (TRNG) measures something the universe refuses to make predictable: electrical noise in a diode, timing jitter between clock ticks, radioactive decay, atmospheric radio crackle, the swirl of a lava lamp. The measurement gets digitized, cleaned up (whitened, in the jargon), and served as bits. No seed, no formula, no replay.',
      },
      {
        t: 'quote',
        text: 'A PRNG answers the question "what number comes next?" A TRNG makes sure that question has no answer.',
      },
      { t: 'h2', text: 'The practical middle: CSPRNG' },
      {
        t: 'p',
        text: 'Modern systems mostly use a hybrid. The operating system collects entropy from hardware events (interrupt timing, device noise, dedicated RNG instructions) into a pool, then uses that pool to key a cryptographically secure PRNG, a CSPRNG. It has the speed of math and the unpredictability of physics, and it reseeds itself continuously. That is what sits behind crypto.getRandomValues() in your browser, and behind every wheel spin on this site.',
      },
      {
        t: 'p',
        text: 'The distinction worth keeping: "random-looking" and "unpredictable" are different properties. Statistics can certify the first. Only physics, or a well-fed CSPRNG, gets you the second.',
      },
    ],
  },
  {
    slug: 'how-this-site-rolls',
    title: 'How theRandomizr rolls',
    deck: 'Every spin, draw, and drop on this site comes from the same three lines of discipline: a CSPRNG, rejection sampling, and a Fisher-Yates shuffle.',
    date: '2026-06-11',
    minutes: 5,
    blocks: [
      {
        t: 'p',
        text: 'No method on this site uses Math.random(). Every random draw, from the roulette wheel to the plinko pegs, goes through crypto.getRandomValues(), the browser\'s cryptographically secure generator, seeded by your operating system\'s entropy pool.',
      },
      { t: 'h2', text: 'The modulo trap' },
      {
        t: 'p',
        text: 'Getting a random 32-bit integer is easy. Turning it into a fair pick from, say, 7 items is where most code quietly cheats. The obvious move, value % 7, is biased: 2^32 is not divisible by 7, so some remainders occur one extra time in the wrap-around. The bias is small, about one part in six hundred million here, but it is real, it grows with list size, and it is completely avoidable.',
      },
      {
        t: 'p',
        text: 'The fix is rejection sampling: throw away the sliver of values at the top of the range that would wrap unevenly, and draw again. This is the actual picker used on every page of this site:',
      },
      {
        t: 'code',
        text: 'export function randomInt(min, max) {\n  const range = max - min + 1\n  const limit = 0xffffffff - (0xffffffff % range)\n  const buf = new Uint32Array(1)\n  let v\n  do {\n    crypto.getRandomValues(buf)\n    v = buf[0]\n  } while (v >= limit)   // reject the biased sliver\n  return min + (v % range)\n}',
      },
      { t: 'h2', text: 'Shuffling without favorites' },
      {
        t: 'p',
        text: 'The second classic mistake is shuffling with sort(() => Math.random() - 0.5). Sort algorithms expect a consistent comparator; feed them noise and some orderings come up measurably more often than others. The fair way is the Fisher-Yates shuffle: walk the list backwards, swapping each position with a uniformly chosen earlier one. Every permutation lands with exactly equal probability, and it runs in one pass.',
      },
      {
        t: 'code',
        text: 'export function shuffle(arr) {\n  const out = [...arr]\n  for (let i = out.length - 1; i > 0; i--) {\n    const j = randomInt(0, i)\n    ;[out[i], out[j]] = [out[j], out[i]]\n  }\n  return out\n}',
      },
      { t: 'h2', text: 'Where the theater fits' },
      {
        t: 'p',
        text: 'A confession about the showmanship: in most methods the pick is decided the instant you click, and the spin, the reel, the bracket reveal are animation layered on top of an already-final answer. The exceptions are the physics methods. Plinko and the marble race inject fresh CSPRNG values into every bounce and every frame, so their outcomes genuinely are not known until the disc lands. Either way the distribution is the same: flat, fair, and indifferent to how much you wanted the other answer.',
      },
    ],
  },
  {
    slug: 'the-lava-lamp-wall',
    title: 'Entropy you can point a camera at',
    deck: 'Cloudflare secures a slice of the internet with a wall of lava lamps. The principle is older than it looks, and it is the next thing this site wants to build.',
    date: '2026-06-11',
    minutes: 4,
    blocks: [
      {
        t: 'p',
        text: 'In the lobby of Cloudflare\'s San Francisco office stands a wall of about a hundred lava lamps. A camera watches them. The blobs rise and fall chaotically, the image sensor adds its own thermal noise, passers-by drift through the frame, and every frame is hashed into a stream of unpredictable bits. The system is called LavaRand, and it feeds entropy into the keys that encrypt a meaningful fraction of web traffic.',
      },
      { t: 'h2', text: 'Why a lamp, of all things' },
      {
        t: 'p',
        text: 'The idea predates Cloudflare: Silicon Graphics engineers patented Lavarand in 1996. Wax convection in a lava lamp is a fluid dynamics problem sensitive enough to initial conditions that predicting future blob shapes is hopeless. The camera does not even need the lamps to be the only source. Sensor noise alone carries entropy; the lamps make the entropy enormous, continuous, and impossible to model from outside the room.',
      },
      {
        t: 'quote',
        text: 'The camera is the dice. The lamps are just a very slow, very photogenic way of rolling them forever.',
      },
      {
        t: 'p',
        text: 'Crucially, nobody serves lava lamp bits raw. The frames are condensed through a cryptographic hash and mixed into a CSPRNG alongside the operating system\'s own entropy. Even if someone pointed their own camera at the wall, sensor noise differs per device, so their bits would not match. The lamps do not replace the math; they feed it.',
      },
      { t: 'h2', text: 'The plan for this site' },
      {
        t: 'p',
        text: 'theRandomizr currently draws from crypto.getRandomValues(), which is the right tool and will stay. But the roadmap has a hardware item on it: a camera pointed at a lava lamp, frames hashed into an entropy feed, and that feed mixed into the draws you see here. Same fairness, but with photons in the supply chain. When it ships, the lamp gets its own page and, naturally, a live camera view.',
      },
      {
        t: 'p',
        text: 'Until then, treat this article as the design document. Peers worth studying: Cloudflare\'s LavaRand writeups, the chaotic pendulums at their London office, and the wall of entropy displays people have built from radios, fish tanks, and dice-rolling machines. Randomness, it turns out, photographs well.',
      },
    ],
  },
  {
    slug: 'radios-decay-and-dice',
    title: 'Radios, decay, and dice towers',
    deck: 'random.org has served true random numbers harvested from atmospheric radio noise since 1998. It is not the only machine listening to the universe.',
    date: '2026-06-11',
    minutes: 4,
    blocks: [
      {
        t: 'p',
        text: 'In 1998, Mads Haahr at Trinity College Dublin hung radio receivers tuned between stations and started publishing the static. Atmospheric noise, the crackle produced by thousands of lightning discharges happening around the planet at any moment, is chaotic enough that the digitized signal makes excellent random bits. That service became random.org, which has since drawn lotteries, assigned clinical trial groups, and settled an enormous number of arguments.',
      },
      { t: 'h2', text: 'Ideas worth stealing' },
      {
        t: 'p',
        text: 'Beyond the radios, random.org got several things right that any randomness service should copy. It publishes its statistical test results instead of asking for trust. It separates the entropy source from the delivery so the science is auditable. And it keeps the interface honest: a number, a range, a timestamp, no mystique. The verdict stamps and the visible rejection-sampling code on this site are descendants of that honesty.',
      },
      {
        t: 'p',
        text: 'Other listening posts exist. HotBits, run since 1996 from Fourmilab in Switzerland, times the gaps between radioactive decays of a cesium-137 source; quantum mechanics guarantees those intervals are unpredictable. The Australian National University streams quantum vacuum fluctuations measured off a laser. Intel ships a hardware instruction, RDRAND, fed by thermal noise in the processor itself. Different physics, same contract: no seed, no replay.',
      },
      {
        t: 'quote',
        text: 'Every true randomness service is the same machine wearing different physics: pick something the universe will not repeat, measure it, hash it, serve it.',
      },
      { t: 'h2', text: 'What it means for a humble wheel' },
      {
        t: 'p',
        text: 'Does a movie-night wheel need lightning-grade entropy? No. The browser\'s CSPRNG is overkill already, and overkill is the correct amount. The lesson from random.org is not that everyone needs radios on the roof. It is that randomness is an engineering subject with sources, failure modes, and receipts, and that showing your work makes the dice trustworthy. That is the whole reason this Learn section exists.',
      },
    ],
  },
]

export function getArticle(slug: string | undefined): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}
