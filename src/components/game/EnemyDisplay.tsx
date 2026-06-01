import type { CSSProperties } from 'react'
import type { CorruptionStyle } from '../../types/game'

interface EnemyDisplayProps {
  char: string
  corruptionStyle: CorruptionStyle
}

const corruptionStyles: Record<CorruptionStyle, CSSProperties> = {
  default: {
    filter: 'hue-rotate(160deg) brightness(0.8) contrast(1.5)',
    transform: 'scaleX(-1)',
    color: 'var(--color-enemy)',
    textShadow: '2px 2px 0 #000, 0 0 8px #ff0000',
  },
  fire: {
    filter: 'hue-rotate(160deg) brightness(0.8) contrast(1.5)',
    transform: 'scaleX(-1)',
    color: '#ff6600',
    textShadow: '0 0 12px #ff3300',
  },
  shadow: {
    filter: 'brightness(0.3) contrast(2)',
    transform: 'scaleX(-1)',
    color: '#440044',
    textShadow: '0 0 8px #9900ff',
  },
  shattered: {
    filter: 'hue-rotate(160deg) brightness(0.8) contrast(1.5)',
    transform: 'scaleX(-1) rotate(15deg)',
    color: 'var(--color-enemy)',
    opacity: 0.8,
  },
}

export function EnemyDisplay({ char, corruptionStyle }: EnemyDisplayProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: '4em',
          fontFamily: 'serif',
          lineHeight: 1,
          display: 'inline-block',
          ...corruptionStyles[corruptionStyle],
        }}
      >
        {char}
      </div>
      <div style={{ color: 'var(--color-enemy)', fontSize: '0.7em', marginTop: '4px' }}>
        まがった「{char}」
      </div>
    </div>
  )
}
