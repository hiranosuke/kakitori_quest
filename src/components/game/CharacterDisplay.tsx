interface CharacterDisplayProps {
  char: string
  accuracy: number
  visible: boolean
}

export function CharacterDisplay({ char, accuracy, visible }: CharacterDisplayProps) {
  const strength = Math.round(accuracy * 100)
  const color =
    accuracy >= 0.9
      ? '#7fff00'
      : accuracy >= 0.6
        ? '#ffd700'
        : '#ff8844'

  return (
    <div style={{ textAlign: 'center', opacity: visible ? 1 : 0.2 }}>
      <div
        style={{
          fontSize: '4em',
          fontFamily: 'serif',
          lineHeight: 1,
          color,
          textShadow: `0 0 12px ${color}`,
        }}
      >
        {char}
      </div>
      {visible && (
        <div style={{ color, fontSize: '0.65em', marginTop: '4px' }}>
          ちから {strength}%
        </div>
      )}
    </div>
  )
}
