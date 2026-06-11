/**
 * Sorting algorithms instrumented to emit a snapshot after every visible
 * mutation. Frame counts are the real operation counts, so races are honest.
 */

export type Frames = number[][]

function bubble(start: number[]): Frames {
  const a = [...start]
  const frames: Frames = []
  for (let i = a.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        frames.push([...a])
      }
    }
  }
  return frames
}

function cocktail(start: number[]): Frames {
  const a = [...start]
  const frames: Frames = []
  let lo = 0
  let hi = a.length - 1
  while (lo < hi) {
    for (let j = lo; j < hi; j++) {
      if (a[j] > a[j + 1]) { ;[a[j], a[j + 1]] = [a[j + 1], a[j]]; frames.push([...a]) }
    }
    hi--
    for (let j = hi; j > lo; j--) {
      if (a[j - 1] > a[j]) { ;[a[j - 1], a[j]] = [a[j], a[j - 1]]; frames.push([...a]) }
    }
    lo++
  }
  return frames
}

function insertion(start: number[]): Frames {
  const a = [...start]
  const frames: Frames = []
  for (let i = 1; i < a.length; i++) {
    const v = a[i]
    let j = i - 1
    while (j >= 0 && a[j] > v) {
      a[j + 1] = a[j]
      frames.push([...a])
      j--
    }
    a[j + 1] = v
    frames.push([...a])
  }
  return frames
}

function selection(start: number[]): Frames {
  const a = [...start]
  const frames: Frames = []
  for (let i = 0; i < a.length - 1; i++) {
    let min = i
    for (let j = i + 1; j < a.length; j++) if (a[j] < a[min]) min = j
    if (min !== i) {
      ;[a[i], a[min]] = [a[min], a[i]]
      frames.push([...a])
    }
  }
  return frames
}

function shell(start: number[]): Frames {
  const a = [...start]
  const frames: Frames = []
  for (let gap = Math.floor(a.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < a.length; i++) {
      const v = a[i]
      let j = i
      while (j >= gap && a[j - gap] > v) {
        a[j] = a[j - gap]
        frames.push([...a])
        j -= gap
      }
      a[j] = v
      frames.push([...a])
    }
  }
  return frames
}

function quick(start: number[]): Frames {
  const a = [...start]
  const frames: Frames = []
  const part = (lo: number, hi: number) => {
    const pivot = a[hi]
    let i = lo - 1
    for (let j = lo; j < hi; j++) {
      if (a[j] < pivot) {
        i++
        if (i !== j) { ;[a[i], a[j]] = [a[j], a[i]]; frames.push([...a]) }
      }
    }
    if (i + 1 !== hi) { ;[a[i + 1], a[hi]] = [a[hi], a[i + 1]]; frames.push([...a]) }
    return i + 1
  }
  const go = (lo: number, hi: number) => {
    if (lo >= hi) return
    const p = part(lo, hi)
    go(lo, p - 1)
    go(p + 1, hi)
  }
  go(0, a.length - 1)
  return frames
}

function merge(start: number[]): Frames {
  const a = [...start]
  const frames: Frames = []
  const go = (lo: number, hi: number) => {
    if (hi - lo < 1) return
    const mid = (lo + hi) >> 1
    go(lo, mid)
    go(mid + 1, hi)
    const buf = a.slice(lo, hi + 1)
    let i = 0
    let j = mid - lo + 1
    for (let k = lo; k <= hi; k++) {
      const take =
        i > mid - lo ? buf[j++]
        : j > hi - lo ? buf[i++]
        : buf[i] <= buf[j] ? buf[i++]
        : buf[j++]
      if (a[k] !== take) {
        a[k] = take
        frames.push([...a])
      }
    }
  }
  go(0, a.length - 1)
  return frames
}

function heap(start: number[]): Frames {
  const a = [...start]
  const frames: Frames = []
  const swap = (i: number, j: number) => { ;[a[i], a[j]] = [a[j], a[i]]; frames.push([...a]) }
  const sift = (i: number, n: number) => {
    for (;;) {
      const l = 2 * i + 1
      const r = l + 1
      let big = i
      if (l < n && a[l] > a[big]) big = l
      if (r < n && a[r] > a[big]) big = r
      if (big === i) return
      swap(i, big)
      i = big
    }
  }
  for (let i = (a.length >> 1) - 1; i >= 0; i--) sift(i, a.length)
  for (let end = a.length - 1; end > 0; end--) {
    swap(0, end)
    sift(0, end)
  }
  return frames
}

export const SORT_ALGOS = [
  { id: 'bubble', name: 'bubble', build: bubble },
  { id: 'cocktail', name: 'cocktail', build: cocktail },
  { id: 'insertion', name: 'insertion', build: insertion },
  { id: 'selection', name: 'selection', build: selection },
  { id: 'shell', name: 'shell', build: shell },
  { id: 'quick', name: 'quick', build: quick },
  { id: 'merge', name: 'merge', build: merge },
  { id: 'heap', name: 'heap', build: heap },
] as const

export type SortAlgoId = (typeof SORT_ALGOS)[number]['id']
