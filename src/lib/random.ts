/** Cryptographically-seeded random helpers. All list ops are uniform. */

export function randomInt(min: number, max: number): number {
  const lo = Math.ceil(Math.min(min, max))
  const hi = Math.floor(Math.max(min, max))
  const range = hi - lo + 1
  // rejection sampling over crypto values avoids modulo bias
  const maxUint = 0xffffffff
  const limit = maxUint - (maxUint % range)
  const buf = new Uint32Array(1)
  let v: number
  do {
    crypto.getRandomValues(buf)
    v = buf[0]
  } while (v >= limit)
  return lo + (v % range)
}

export function randomFloat(): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] / 0x100000000
}

export function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

export function pickIndex(length: number): number {
  return randomInt(0, length - 1)
}

/** Fisher-Yates, returns new array */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Shuffles then deals round-robin into n groups, sizes differing by at most 1. */
export function splitTeams<T>(arr: readonly T[], n: number): T[][] {
  const teams: T[][] = Array.from({ length: Math.max(1, n) }, () => [])
  shuffle(arr).forEach((item, i) => teams[i % teams.length].push(item))
  return teams
}

/** n unique numbers in [min, max]; falls back to allowing fewer if range too small */
export function sampleRange(min: number, max: number, n: number, unique: boolean): number[] {
  if (!unique) return Array.from({ length: n }, () => randomInt(min, max))
  const size = Math.abs(max - min) + 1
  const count = Math.min(n, size)
  if (size <= 10_000) {
    const all = Array.from({ length: size }, (_, i) => Math.min(min, max) + i)
    return shuffle(all).slice(0, count)
  }
  const seen = new Set<number>()
  while (seen.size < count) seen.add(randomInt(min, max))
  return [...seen]
}
