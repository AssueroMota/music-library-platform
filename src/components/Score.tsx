import { useId } from 'react'

export function Score({
  title = 'Primeira luz',
  notes = [0, 2, 4, 7, 5, 4, 2, 0, 2, 4, 5, 9, 7, 5, 4, 0],
  bpm = 80,
  keyLabel = 'Dó maior',
}: {
  title?: string
  notes?: number[]
  bpm?: number
  keyLabel?: string
}) {
  const id = useId()
  // Diatonic staff positions for an original C-major melody. The SVG is an
  // illustrative study; a production PDF renderer is intentionally out of scope.
  const positions: Record<number, number> = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6, 12: 7 }
  return (
    <div className="score-sheet">
      <span className="score-kicker">MUSIC LIBRARY · ESTUDO ORIGINAL</span>
      <h4>{title}</h4>
      <div className="score-subtitle">
        Melodia em {keyLabel} <span>♩ = {bpm}</span>
      </div>
      <svg viewBox="0 0 540 230" role="img" aria-labelledby={id}>
        <title id={id}>
          Partitura ilustrativa de {title}, estudo original em {keyLabel}, duas pautas em clave de
          Sol.
        </title>
        {[0, 1].map((row) => (
          <g key={row}>
            {[0, 1, 2, 3, 4].map((line) => (
              <line
                key={line}
                x1="18"
                x2="522"
                y1={55 + row * 110 + line * 8}
                y2={55 + row * 110 + line * 8}
                stroke="#6f716e"
                strokeWidth="0.75"
              />
            ))}
            <text x="22" y={91 + row * 110} fontSize="48" fontFamily="Georgia, serif">
              𝄞
            </text>
            <text x="67" y={72 + row * 110} fontSize="15" fontFamily="Georgia">
              4
            </text>
            <text x="67" y={86 + row * 110} fontSize="15" fontFamily="Georgia">
              4
            </text>
            {[0, 1, 2].map((bar) => (
              <line
                key={bar}
                x1={88 + bar * 217}
                x2={88 + bar * 217}
                y1={55 + row * 110}
                y2={87 + row * 110}
                stroke="#6f716e"
                strokeWidth="0.8"
              />
            ))}
            {notes.slice(row * 8, row * 8 + 8).map((note, i) => {
              const x = 111 + i * 53
              const y = 95 + row * 110 - (positions[note] ?? 0) * 4
              return (
                <g key={i}>
                  <ellipse
                    cx={x}
                    cy={y}
                    rx="5.5"
                    ry="3.8"
                    fill="#222e35"
                    transform={`rotate(-20 ${x} ${y})`}
                  />
                  <line
                    x1={x + 5}
                    y1={y}
                    x2={x + 5}
                    y2={y - 28}
                    stroke="#222e35"
                    strokeWidth="1.3"
                  />
                  {note === 0 && <line x1={x - 9} x2={x + 9} y1={y} y2={y} stroke="#222e35" />}
                </g>
              )
            })}
            <text x="102" y={39 + row * 110} fontSize="12" fill="#637064" fontFamily="sans-serif">
              {keyLabel === 'Lá menor' ? (row ? 'Em' : 'Am') : row ? 'F' : 'C'}
            </text>
            <text x="320" y={39 + row * 110} fontSize="12" fill="#637064" fontFamily="sans-serif">
              {keyLabel === 'Lá menor' ? (row ? 'Am' : 'Dm') : row ? 'G' : 'Am'}
            </text>
          </g>
        ))}
      </svg>
      <p className="score-footnote">Prévia ilustrativa · não substitui a partitura final</p>
    </div>
  )
}
