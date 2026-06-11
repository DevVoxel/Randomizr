import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { pick } from '../../lib/random'

const ANSWERS = [
  'It is certain', 'It is decidedly so', 'Without a doubt', 'Yes — definitely',
  'You may rely on it', 'As I see it, yes', 'Most likely', 'Outlook good',
  'Yes', 'Signs point to yes',
  'Reply hazy, try again', 'Ask again later', 'Better not tell you now',
  'Cannot predict now', 'Concentrate and ask again',
  "Don't count on it", 'My reply is no', 'My sources say no',
  'Outlook not so good', 'Very doubtful',
]

const SHAKE_MS = 1100

export default function EightBall({ onResult }: { onResult: (label: string) => void }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [shaking, setShaking] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  const shake = () => {
    if (shaking) return
    window.clearTimeout(timerRef.current)
    setAnswer(null)
    setShaking(true)
    const a = pick(ANSWERS)
    timerRef.current = window.setTimeout(() => {
      setShaking(false)
      setAnswer(a)
      const q = question.trim()
      onResult(q ? `${q} — ${a}` : a)
    }, SHAKE_MS)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && shake()}
        placeholder="Ask a yes/no question (optional)"
        className="num-input text-sm text-center"
      />

      <motion.button
        onClick={shake}
        aria-label="Shake the 8-ball"
        animate={shaking ? { x: [0, -14, 12, -10, 8, -5, 0], rotate: [0, -6, 5, -4, 3, 0] } : { x: 0, rotate: 0 }}
        transition={{ duration: 0.55, repeat: shaking ? 1 : 0 }}
        className="relative size-52 sm:size-60 rounded-full bg-foreground grid place-items-center cursor-pointer"
      >
        {/* the window */}
        <div className="size-24 rounded-full bg-background border-4 border-foreground grid place-items-center p-2 text-center overflow-hidden">
          {answer ? (
            <motion.span
              key={answer}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[11px] font-semibold leading-tight"
            >
              {answer}
            </motion.span>
          ) : (
            <span className="font-brand text-5xl pt-1">{shaking ? '?' : '8'}</span>
          )}
        </div>
      </motion.button>

      <p className="text-xs text-muted-foreground">
        {answer ? 'The sphere has spoken. Shake to appeal.' : 'Tap the ball to shake it.'}
      </p>
    </div>
  )
}
