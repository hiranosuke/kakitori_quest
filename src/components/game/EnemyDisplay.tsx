import { useGameStore } from '../../store/gameStore'

// creatureSvg は generateCreature() が返す信頼できるSVG文字列なので dangerouslySetInnerHTML は安全
export function EnemyDisplay() {
  const { creatureSvg } = useGameStore()

  return (
    <div
      style={{ display: 'inline-block', lineHeight: 1, width: 120, height: 120 }}
      dangerouslySetInnerHTML={
        creatureSvg
          ? { __html: creatureSvg }
          : { __html: '<svg width="120" height="120" viewBox="0 0 120 120"><text x="60" y="65" text-anchor="middle" fill="#555" font-size="14">...</text></svg>' }
      }
    />
  )
}
