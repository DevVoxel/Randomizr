import { useEffect, useRef, useState } from 'react'
import type { Item } from '../../lib/types'
import { randomFloat, shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const BIN_W = 46 // internal px per bin; the board widens with the list
const MIN_W = 400
const H = 520
const PEG_ROWS = 9
const PEG_R = 4
const BALL_R = 7
const GRAVITY = 0.22
const RESTITUTION = 0.55
const BIN_TOP = H - 64

interface Peg { x: number; y: number }

function buildPegs(width: number): Peg[] {
  const pegs: Peg[] = []
  const rowH = (BIN_TOP - 90) / PEG_ROWS
  const cols = Math.round(width / 44)
  for (let r = 0; r < PEG_ROWS; r++) {
    const y = 90 + r * rowH
    const offset = r % 2 === 0 ? 0 : width / cols / 2
    for (let c = 0; c <= cols; c++) {
      const x = offset + (c * width) / cols
      if (x > 12 && x < width - 12) pegs.push({ x, y })
    }
  }
  return pegs
}

interface Ball { x: number; y: number; vx: number; vy: number; landed: number | null }

export default function Plinko({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // every item gets a bin; the board is fixed for this mount (Randomize remounts on list change)
  const [bins] = useState<Item[]>(() => shuffle(items))
  const W = Math.max(MIN_W, bins.length * BIN_W)
  const [winner, setWinner] = useState<Item | null>(null)
  const aimX = useRef(W / 2)
  const ball = useRef<Ball | null>(null)
  const pegs = useRef<Peg[]>(buildPegs(W))
  const litBin = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const styles = getComputedStyle(canvas)
    const ink = styles.getPropertyValue('--ink').trim() || '#2b2722'
    const paper = styles.getPropertyValue('--paper').trim() || '#f7f5f0'
    let raf = 0

    const step = () => {
      const b = ball.current
      const n = bins.length
      const binW = W / n
      if (b && b.landed === null) {
        b.vy += GRAVITY
        b.x += b.vx
        b.y += b.vy
        // walls
        if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx) * RESTITUTION }
        if (b.x > W - BALL_R) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx) * RESTITUTION }
        // pegs: reflect along the collision normal, plus a nudge of true randomness
        for (const p of pegs.current) {
          const dx = b.x - p.x
          const dy = b.y - p.y
          const dist = Math.hypot(dx, dy)
          const minDist = BALL_R + PEG_R
          if (dist < minDist && dist > 0) {
            const nx = dx / dist
            const ny = dy / dist
            const dot = b.vx * nx + b.vy * ny
            b.vx = (b.vx - 2 * dot * nx) * RESTITUTION + (randomFloat() - 0.5) * 0.9
            b.vy = (b.vy - 2 * dot * ny) * RESTITUTION
            b.x = p.x + nx * minDist
            b.y = p.y + ny * minDist
            // a disc balancing on top of a peg gets kicked off, never parked
            if (Math.abs(b.vx) + Math.abs(b.vy) < 0.9 && ny < -0.5) {
              b.vx += (randomFloat() < 0.5 ? -1 : 1) * (0.9 + randomFloat() * 0.5)
            }
          }
        }
        // bin divider collisions keep the ball inside one slot
        if (b.y > BIN_TOP - BALL_R && n > 0) {
          const slot = Math.max(0, Math.min(n - 1, Math.floor(b.x / binW)))
          const leftWall = slot * binW
          const rightWall = (slot + 1) * binW
          if (b.x - BALL_R < leftWall + 2 && slot > 0) { b.x = leftWall + 2 + BALL_R; b.vx = Math.abs(b.vx) * 0.4 }
          if (b.x + BALL_R > rightWall - 2 && slot < n - 1) { b.x = rightWall - 2 - BALL_R; b.vx = -Math.abs(b.vx) * 0.4 }
          if (b.y > H - BALL_R - 6) {
            b.y = H - BALL_R - 6
            b.landed = slot
            litBin.current = slot
            const item = bins[slot]
            if (item) {
              setWinner(item)
              onResult(item)
            }
          }
        }
      }

      // draw
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = ink
      // aim marker
      if (!b || b.landed !== null) {
        ctx.save()
        ctx.globalAlpha = 0.9
        ctx.beginPath()
        ctx.moveTo(aimX.current - 8, 18)
        ctx.lineTo(aimX.current + 8, 18)
        ctx.lineTo(aimX.current, 32)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      for (const p of pegs.current) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, PEG_R, 0, Math.PI * 2)
        ctx.fill()
      }
      if (n > 0) {
        for (let i = 0; i <= n; i++) {
          ctx.fillRect(i * binW - (i === n ? 2 : 0), BIN_TOP, 2, H - BIN_TOP)
        }
        ctx.fillRect(0, H - 2, W, 2)
        // numbers only fit when bins are wide enough; the legend always has them
        const showNumbers = binW >= 22
        for (let i = 0; i < n; i++) {
          if (litBin.current === i) {
            ctx.fillRect(i * binW + 2, BIN_TOP, binW - 4, H - BIN_TOP)
          }
          if (showNumbers) {
            ctx.font = '600 13px ui-monospace, monospace'
            ctx.textAlign = 'center'
            ctx.fillStyle = litBin.current === i ? paper : ink
            ctx.fillText(String(i + 1), i * binW + binW / 2, BIN_TOP + 24)
            ctx.fillStyle = ink
          }
        }
      }
      if (b) {
        ctx.beginPath()
        ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2)
        ctx.fillStyle = ink
        ctx.fill()
        ctx.strokeStyle = paper
        ctx.lineWidth = 2
        ctx.stroke()
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [onResult, bins, W])

  const toCanvasX = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return ((e.clientX - rect.left) / rect.width) * W
  }

  const aim = (e: React.PointerEvent<HTMLCanvasElement>) => {
    aimX.current = Math.max(BALL_R, Math.min(W - BALL_R, toCanvasX(e)))
  }

  const drop = () => {
    if (ball.current && ball.current.landed === null) return
    setWinner(null)
    litBin.current = null
    ball.current = {
      x: aimX.current,
      y: 40,
      vx: (randomFloat() - 0.5) * 0.6,
      vy: 0,
      landed: null,
    }
  }

  // small boards stretch to the container; big boards keep 1:1 px and pan sideways
  const oversized = W > 640

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-xs text-muted-foreground">
        Aim with your pointer, tap to drop. Every one of your {bins.length} items has a bin.
        {oversized && ' Big list, big board: slide it sideways.'}
      </p>

      <div className="w-full overflow-x-auto flex justify-start sm:justify-center">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerMove={aim}
          onPointerDown={(e) => { aim(e); drop() }}
          className="border-2 border-foreground hard-shadow touch-none cursor-crosshair select-none shrink-0"
          style={oversized ? { width: W } : { width: '100%', maxWidth: '26rem' }}
          aria-label="Plinko board. Tap to drop the disc"
        />
      </div>

      <ol className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs w-full max-w-md max-h-40 overflow-y-auto">
        {bins.map((item, i) => (
          <li
            key={item.id}
            className={`truncate ${winner?.id === item.id ? 'bg-foreground text-background px-1 font-semibold' : 'text-muted-foreground'}`}
          >
            {i + 1}· {item.label}
          </li>
        ))}
      </ol>

      <button onClick={drop} className="btn-ink px-8 py-3 font-semibold text-lg">
        Drop the disc
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
