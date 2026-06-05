import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

// ドット絵風 RPG 勇者 SVG（24×24 グリッド → 120×120px）
const HERO_SVG = `<svg width="120" height="120" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="2" width="8" height="4" fill="#e8a020"/>
  <rect x="7" y="5" width="10" height="8" fill="#f5c99a"/>
  <rect x="9" y="8" width="2" height="2" fill="#3a3a3a"/>
  <rect x="13" y="8" width="2" height="2" fill="#3a3a3a"/>
  <rect x="6" y="13" width="12" height="6" fill="#4169e1"/>
  <rect x="3" y="13" width="3" height="5" fill="#4169e1"/>
  <rect x="18" y="13" width="3" height="5" fill="#4169e1"/>
  <rect x="1" y="14" width="3" height="5" rx="1" fill="#8b6914"/>
  <rect x="2" y="15" width="1" height="3" fill="#d4a017"/>
  <rect x="21" y="4" width="2" height="10" fill="#c0c0c0"/>
  <rect x="19" y="13" width="6" height="2" fill="#8b6914"/>
  <rect x="6" y="19" width="12" height="2" fill="#8b6914"/>
  <rect x="7" y="21" width="4" height="3" fill="#2c52b3"/>
  <rect x="13" y="21" width="4" height="3" fill="#2c52b3"/>
</svg>`

export function HeroDisplay() {
  const { battlePhase, battleResult } = useGameStore()

  const animate =
    battlePhase === 'won' || (battlePhase === 'feedback' && battleResult === 'win')
      ? { y: [0, -12, 0], transition: { duration: 0.4 } }
      : battlePhase === 'feedback' && battleResult === 'lose'
        ? { x: [-6, 6, -6, 6, 0], transition: { duration: 0.4 } }
        : {}

  return (
    <motion.div
      animate={animate}
      style={{ display: 'inline-block', lineHeight: 1, width: 120, height: 120 }}
      dangerouslySetInnerHTML={{ __html: HERO_SVG }}
    />
  )
}
