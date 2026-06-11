export type Block =
  | { t: 'p'; text: string }
  | { t: 'h2'; text: string }
  | { t: 'code'; text: string }
  | { t: 'quote'; text: string }
  | { t: 'img'; src: string; alt: string; caption: string }

export interface Article {
  slug: string
  title: string
  deck: string
  date: string
  minutes: number
  pinned?: boolean
  blocks: Block[]
}

export const ARTICLES: Article[] = [
  {
    slug: 'where-the-wheel-started',
    title: 'Where the wheel started',
    deck: 'In 2010 this site was one button that picked a family movie with one line of Math.random(). This is the road from there to here, and where it goes next.',
    date: '2026-06-11',
    minutes: 5,
    pinned: true,
    blocks: [
      {
        t: 'p',
        text: 'The original theRandomizr, still viewable through the footer of this site, was a single page with a button labeled Random Movie. Below it sat a hand-typed list for family movie night. Despicable Me 2, spelled wrong. Kung Fu Panda 2. The Smurfs. Netflix, listed as if it were a film. Pressing the button bolded one of them in red, and that settled the evening.',
      },
      { t: 'h2', text: 'The random value we started with' },
      {
        t: 'p',
        text: 'The entire engine was this line, preserved exactly as written.',
      },
      {
        t: 'code',
        text: 'var selectedNumber =\n  Math.floor((Math.random() * moviesLi.length - 1) + 1);',
      },
      {
        t: 'p',
        text: 'Math.random() is the browser\'s built-in pseudorandom generator. No seed control, no fairness guarantees, and in 2010 most browsers ran weak generators behind it that researchers later showed could be predicted outright. Also, look closely at that arithmetic. It subtracts one and then adds one back. The correction cancels itself out, which means the line works by accident. A fitting start for a site about chance.',
      },
      {
        t: 'p',
        text: 'And for picking a movie, it was completely fine. That is an honest lesson too. The stakes define how good your randomness has to be, and no family has ever been harmed by a predictable Smurfs selection.',
      },
      { t: 'h2', text: 'Where we are' },
      {
        t: 'p',
        text: 'The rebuilt site retired Math.random() everywhere. Every draw now comes from crypto.getRandomValues(), the browser\'s cryptographically secure generator, with rejection sampling to kill modulo bias and Fisher-Yates for every shuffle. One movie list became nineteen methods, from a plinko board running live physics to a roulette that spins all of Wikipedia. The button is fancier. The promise is the same one from 2010. Press it and stop arguing.',
      },
      { t: 'h2', text: 'Where randomness runs the world' },
      {
        t: 'p',
        text: 'It is worth saying why any of this deserves care. Randomness is the closest thing civilization has to a neutral referee. Clinical trials assign patients to treatment groups at random because it is the only known cure for wishful thinking in medicine. Every https connection your browser opens starts with random keys, and a flaw in that randomness once let researchers break thousands of real encryption keys at a stroke. Lotteries, jury pools, green card drawings, military drafts, audit samples, and election spot checks all lean on chance precisely because chance cannot be lobbied.',
      },
      {
        t: 'quote',
        text: 'Randomness is fairness you can manufacture. That is why it is worth manufacturing well.',
      },
      { t: 'h2', text: 'Where this could go' },
      {
        t: 'p',
        text: 'The roadmap runs toward hardware. A lava lamp, a camera, and hashed frames mixed into the site\'s draws, with the full design already written up in the Blueprint edition of this press. Past that, the candidates are group rooms where friends spin one shared wheel, verdict histories you can verify after the fact, and whatever else turns out to be fun. The 2010 site picked one family\'s movie. The ceiling now is picking anything, for anyone, with randomness good enough that nobody has to take our word for it.',
      },
    ],
  },
  {
    slug: 'two-kinds-of-random',
    title: 'Two kinds of random',
    deck: 'Pseudorandom numbers are made by math. True random numbers are harvested from the physical world. Only one of them is unpredictable in principle.',
    date: '2026-06-11',
    minutes: 4,
    blocks: [
      {
        t: 'p',
        text: 'Ask a computer for a random number and you run into an awkward fact. Computers are deterministic machines. Give one the same starting state twice and it does exactly the same thing twice. There is no coin inside. So where do the numbers come from?',
      },
      { t: 'h2', text: 'Pseudorandom, or math pretending' },
      {
        t: 'p',
        text: 'A pseudorandom generator is a formula. You feed it a starting value called a seed, and it stretches that seed into a long stream of numbers that look random. They pass statistical tests. They spread out evenly. But the stream is fully determined by the seed, and anyone who knows the seed, or who recovers the internal state, can predict every number that will ever come out. The classic example is the linear congruential generator, which is three multiplications and a remainder, and which powered decades of video game loot.',
      },
      {
        t: 'p',
        text: 'For games and playlist shuffles this is fine. For lotteries and cryptographic keys it is not. People have emptied slot machines by reverse-engineering generator state, and they did not need to touch the machine to do it.',
      },
      { t: 'h2', text: 'True random, or physics sampled' },
      {
        t: 'p',
        text: 'A true random generator measures something the universe refuses to make predictable. Electrical noise in a diode. Timing jitter between clock ticks. Radioactive decay. The swirl of a lava lamp. The measurement gets digitized, cleaned up, and served as bits. No seed, no formula, no replay.',
      },
      {
        t: 'quote',
        text: 'A pseudorandom generator answers the question "what number comes next?" A true random generator makes sure that question has no answer.',
      },
      { t: 'h2', text: 'The practical middle' },
      {
        t: 'p',
        text: 'Modern systems mostly use a hybrid. The operating system collects entropy from hardware events into a pool, then uses that pool to key a cryptographically secure generator, a CSPRNG. It runs at the speed of math while staying unpredictable, because it keeps reseeding itself from physics. That is what sits behind crypto.getRandomValues() in your browser, and behind every wheel spin on this site.',
      },
      {
        t: 'p',
        text: 'The distinction worth keeping is that random-looking and unpredictable are different properties. Statistics can certify the first. Only physics, or a well-fed CSPRNG, gets you the second.',
      },
    ],
  },
  {
    slug: 'how-this-site-rolls',
    title: 'How theRandomizr rolls',
    deck: 'Every spin, draw, and drop on this site comes from the same discipline. A CSPRNG, rejection sampling, and a Fisher-Yates shuffle.',
    date: '2026-06-11',
    minutes: 5,
    blocks: [
      {
        t: 'p',
        text: 'No method on this site uses Math.random(). Every draw, from the roulette wheel to the plinko pegs, goes through crypto.getRandomValues(), the browser\'s cryptographically secure generator, which the operating system keeps fed with real entropy.',
      },
      { t: 'h2', text: 'The modulo trap' },
      {
        t: 'p',
        text: 'Getting a random 32-bit integer is easy. Turning it into a fair pick from, say, 7 items is where most code quietly cheats. The obvious move is value % 7, and it is biased. 2^32 does not divide evenly by 7, so some remainders occur one extra time in the wrap-around. The bias here is about one part in six hundred million, which sounds ignorable until you remember it grows with list size and costs nothing to remove.',
      },
      {
        t: 'p',
        text: 'The fix is called rejection sampling. Throw away the sliver of values at the top of the range that would wrap unevenly, and draw again. This is the actual picker used on every page of this site.',
      },
      {
        t: 'code',
        text: 'export function randomInt(min, max) {\n  const range = max - min + 1\n  const limit = 0xffffffff - (0xffffffff % range)\n  const buf = new Uint32Array(1)\n  let v\n  do {\n    crypto.getRandomValues(buf)\n    v = buf[0]\n  } while (v >= limit)   // reject the biased sliver\n  return min + (v % range)\n}',
      },
      { t: 'h2', text: 'Shuffling without favorites' },
      {
        t: 'p',
        text: 'The other classic mistake is shuffling with sort(() => Math.random() - 0.5). Sort algorithms expect a consistent comparator. Feed them noise and some orderings come up measurably more often than others. The fair way is the Fisher-Yates shuffle, which walks the list backwards and swaps each position with a uniformly chosen earlier one. Every permutation lands with equal probability, in one pass.',
      },
      {
        t: 'code',
        text: 'export function shuffle(arr) {\n  const out = [...arr]\n  for (let i = out.length - 1; i > 0; i--) {\n    const j = randomInt(0, i)\n    ;[out[i], out[j]] = [out[j], out[i]]\n  }\n  return out\n}',
      },
      { t: 'h2', text: 'Where the theater fits' },
      {
        t: 'p',
        text: 'A confession about the showmanship. In most methods the pick is decided the instant you click, and the spinning is animation layered over an already-final answer. The exceptions are the physics methods. Plinko and the marble race inject fresh CSPRNG values into every bounce and every frame, so their outcomes genuinely are not known until the disc lands. Either way you get the same flat, fair distribution, indifferent to how much you wanted the other answer.',
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
        text: 'In the lobby of Cloudflare\'s San Francisco office stands a wall of about a hundred lava lamps. A camera watches them. The blobs rise and fall chaotically, the image sensor adds its own thermal noise, passers-by drift through the frame, and every frame gets hashed into a stream of unpredictable bits. The system is called LavaRand, and it feeds entropy into keys that encrypt a meaningful fraction of web traffic.',
      },
      {
        t: 'img',
        src: '/learn/lavarand-wall.jpg',
        alt: 'The wall of lava lamps in the lobby of the Cloudflare office in San Francisco',
        caption: 'The wall itself, mid-shift. Photo by HaeB, CC BY-SA 4.0, via Wikimedia Commons.',
      },
      { t: 'h2', text: 'Why a lamp, of all things' },
      {
        t: 'p',
        text: 'The idea predates Cloudflare. Silicon Graphics engineers patented Lavarand in 1996. Wax convection in a lava lamp is sensitive enough to initial conditions that predicting future blob shapes is hopeless. And the lamps do not even need to carry the whole load. Sensor noise alone holds entropy. The lamps make it enormous, continuous, and impossible to model from outside the room.',
      },
      {
        t: 'quote',
        text: 'The camera is the dice. The lamps are just a very slow, very photogenic way of rolling them forever.',
      },
      {
        t: 'p',
        text: 'Nobody serves lava lamp bits raw. The frames are condensed through a cryptographic hash and mixed into a CSPRNG alongside the operating system\'s own entropy. Even someone pointing their own camera at the same wall would get different bits, because their sensor noise is not your sensor noise. The lamps do not replace the math. They feed it.',
      },
      { t: 'h2', text: 'The plan for this site' },
      {
        t: 'p',
        text: 'theRandomizr currently draws from crypto.getRandomValues(), which is the right tool and will stay. But the roadmap has a hardware item on it. A camera pointed at a lava lamp, frames hashed into an entropy feed, and that feed mixed into the draws you see here. Same fairness, but with photons in the supply chain. The full blueprint is written up in its own edition, one shelf over.',
      },
      {
        t: 'p',
        text: 'Until the lamp ships, treat this article as the pitch. Randomness, it turns out, photographs well.',
      },
    ],
  },
  {
    slug: 'why-random-feels-rigged',
    title: 'Why true random feels rigged',
    deck: 'Real randomness clumps, repeats, and streaks. Your brain hates that. Apple once made shuffle less random so it would feel more random.',
    date: '2026-06-11',
    minutes: 4,
    blocks: [
      {
        t: 'p',
        text: 'Spin a wheel of ten restaurants three times and there is a decent chance you hit the same place twice. People see that and assume the wheel is broken. The wheel is fine. The assumption is broken.',
      },
      { t: 'h2', text: 'Randomness has no memory' },
      {
        t: 'p',
        text: 'A fair generator does not know what it picked last time. Each draw starts from zero, so repeats are not just possible but expected. With ten items and three spins, the odds of at least one repeat are about 28 percent. With 23 people in a room, two of them probably share a birthday. Most people guess you would need a hundred. The math is the same in both cases, and it surprises almost everyone.',
      },
      {
        t: 'p',
        text: 'The mirror image of this is the gambler\'s fallacy, the feeling that a roulette table owes you a red after five blacks. It owes you nothing. The streak you just watched has no vote in the next spin, and the generator behind this site would not remember the streak even if it wanted to.',
      },
      { t: 'h2', text: 'The iPod confession' },
      {
        t: 'p',
        text: 'When the iPod\'s shuffle was honestly random, users complained it was rigged. The same artist twice in a row felt like a bug. So Apple shipped Smart Shuffle, which deliberately spread artists apart, and Steve Jobs described it on stage as making shuffle "less random to make it feel more random." That sentence is the whole psychology of this subject in eleven words.',
      },
      {
        t: 'quote',
        text: 'When a shuffle finally feels random, it has usually stopped being random.',
      },
      { t: 'h2', text: 'What this site does about it' },
      {
        t: 'p',
        text: 'Nothing. The draws here stay honest, clumps included. If the wheel gives you tacos two Fridays running, that is not a haunting. It is probability doing exactly what it said it would do, and the verdict stamp does not negotiate.',
      },
    ],
  },
  {
    slug: 'fair-coin-from-a-bent-one',
    title: 'A fair coin from a bent one',
    deck: 'John von Neumann needed fair bits from an unfair source and solved it with one move. The trick still runs inside chips today.',
    date: '2026-06-11',
    minutes: 3,
    blocks: [
      {
        t: 'p',
        text: 'Suppose your only coin is bent and lands heads 70 percent of the time. Can you still settle an argument fairly with it? You can, and the method fits in a sentence. Flip twice, and if the flips differ, take the first one. If they match, throw the pair away and start over.',
      },
      { t: 'h2', text: 'Why it works' },
      {
        t: 'p',
        text: 'Heads-then-tails has probability 0.7 times 0.3. Tails-then-heads has probability 0.3 times 0.7. Identical. The bias cancels because both mixed outcomes contain one head and one tail, just in different order. You pay for the fairness in wasted flips, and a badly bent coin wastes a lot of them, but the bits that survive are perfectly even.',
      },
      {
        t: 'code',
        text: 'function fairFlip(biasedCoin) {\n  for (;;) {\n    const a = biasedCoin()\n    const b = biasedCoin()\n    if (a !== b) return a   // HT and TH are equally likely\n  }\n}',
      },
      {
        t: 'p',
        text: 'John von Neumann published this in 1951, in a paper about generating random digits on early computers. The same debiasing idea, in fancier dress, still runs inside hardware random number generators today, where raw circuit noise is never perfectly balanced and has to be whitened before anyone is allowed to see it.',
      },
      { t: 'h2', text: 'Your hand is a bent coin too' },
      {
        t: 'p',
        text: 'A real coin flip is not even the 50/50 you think it is. Persi Diaconis and collaborators showed that a caught coin lands on the same face it started on about 51 percent of the time, and a 2023 study of 350,757 human flips confirmed it. The lesson is not to distrust coins. It is that fairness is something you engineer, not something you assume. This site flips its coins in a CSPRNG, where nobody\'s thumb gets a say.',
      },
    ],
  },
  {
    slug: 'blueprint-the-lamp',
    title: 'Blueprint: the lamp',
    deck: 'The working plan for adding a lava lamp to this site\'s entropy supply. Hardware, hashing, serving, and what happens when the lamp goes cold.',
    date: '2026-06-11',
    minutes: 5,
    blocks: [
      {
        t: 'p',
        text: 'This is a design document published as an article, because a randomness site should show its work before the work exists. The goal is a camera pointed at a lava lamp, feeding hashed frames into the draws on this site. Here is the plan as it stands.',
      },
      { t: 'h2', text: 'Stage one, the rig' },
      {
        t: 'p',
        text: 'One lava lamp, one fixed camera, one small computer of the Raspberry Pi class. The lamp runs on a timer because wax needs heat cycles to keep moving. The camera shoots a frame every few seconds at modest resolution. Nothing fancy, and that is deliberate. Sensor noise is part of the entropy, so a cheap noisy sensor is a feature.',
      },
      { t: 'h2', text: 'Stage two, the squeeze' },
      {
        t: 'p',
        text: 'Each frame is a few hundred kilobytes of pixels containing maybe a few thousand bits of genuine unpredictability. The frame gets hashed with SHA-256, and that digest is folded into a running pool along with a timestamp and the previous pool state. The hash acts as the squeeze, condensing a big noisy image into a small dense secret. Frames are never stored and never served. Only digests survive.',
      },
      {
        t: 'code',
        text: 'pool = SHA256(pool || frameDigest || timestamp)\n// the pool never moves backwards and\n// no single frame can steer it alone',
      },
      { t: 'h2', text: 'Stage three, the serving' },
      {
        t: 'p',
        text: 'A tiny endpoint serves pool-derived values, signed and timestamped, never the pool itself. The browser then mixes a fetched lamp value with its own crypto.getRandomValues() output by XOR. The XOR rule means an attacker has to control both sources to control the draw. If the lamp is compromised, you are exactly as safe as you are today.',
      },
      { t: 'h2', text: 'Stage four, the honesty' },
      {
        t: 'p',
        text: 'Hardware fails quietly. A frozen frame, a dead lamp, a stuck camera, all of them produce repeating digests. So the pipeline runs continuous health checks, comparing consecutive digests and tracking statistical bias in the output, and when the lamp goes cold the site falls back to plain CSPRNG draws and says so in the footer. No silent degradation. A randomness source you cannot audit is a rumor.',
      },
      {
        t: 'quote',
        text: 'The lamp will not make the wheel fairer. It will make the fairness more interesting to look at.',
      },
      {
        t: 'p',
        text: 'When it ships, the lamp gets a live page, a health readout, and probably a name. Suggestions are being accepted at the speed of light.',
      },
    ],
  },
]

export function getArticle(slug: string | undefined): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}
