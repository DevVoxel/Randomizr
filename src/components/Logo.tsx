/** The dotted "R" mark from the 2010 original, rebuilt as an inline SVG. */
const GRID = ['11110', '10001', '10001', '11110', '10100', '10010', '10001']

export function DotR({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 62 86" className={className} aria-hidden>
      {GRID.flatMap((row, r) =>
        [...row].map((on, c) =>
          on === '1' ? (
            <circle key={`${r}-${c}`} cx={7 + c * 12} cy={7 + r * 12} r="5" fill="currentColor" />
          ) : null,
        ),
      )}
    </svg>
  )
}
