import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useWardrobeStore } from '../../store/wardrobeStore'
import { ITEMS } from '../../config/items'
import type { DecorationItem } from '../../config/items'

// 勇者ベース SVG（64×64 座標系）
const HERO_BASE = `
  <rect x="21" y="5"  width="21" height="11" fill="#e8a020"/>
  <rect x="19" y="13" width="27" height="21" fill="#f5c99a"/>
  <rect x="24" y="21" width="5"  height="5"  fill="#3a3a3a"/>
  <rect x="35" y="21" width="5"  height="5"  fill="#3a3a3a"/>
  <rect x="16" y="35" width="32" height="16" fill="#4169e1"/>
  <rect x="8"  y="35" width="8"  height="13" fill="#4169e1"/>
  <rect x="48" y="35" width="8"  height="13" fill="#4169e1"/>
  <rect x="3"  y="37" width="8"  height="13" rx="2" fill="#8b6914"/>
  <rect x="5"  y="40" width="3"  height="8"  fill="#d4a017"/>
  <rect x="56" y="11" width="5"  height="27" fill="#c0c0c0"/>
  <rect x="51" y="35" width="16" height="5"  fill="#8b6914"/>
  <rect x="16" y="51" width="32" height="5"  fill="#8b6914"/>
  <rect x="19" y="56" width="11" height="8"  fill="#2c52b3"/>
  <rect x="35" y="56" width="11" height="8"  fill="#2c52b3"/>
`

function buildHeroSvg(size: number, hatLayer: string, armorLayer: string): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    ${HERO_BASE}
    ${armorLayer}
    ${hatLayer}
  </svg>`
}

export function HeroDisplay({ size = 80 }: { size?: number }) {
  const { battlePhase, battleResult } = useGameStore()
  const equippedItems = useWardrobeStore((s) => s.equippedItems)

  const getLayer = (slot: 'hat' | 'armor'): string => {
    const id = equippedItems[slot]
    if (!id) return ''
    const item = ITEMS.find((i) => i.id === id)
    if (!item || item.type !== 'decoration') return ''
    return (item as DecorationItem).svgLayer
  }

  const svgString = buildHeroSvg(size, getLayer('hat'), getLayer('armor'))

  const animate =
    battlePhase === 'won' || (battlePhase === 'feedback' && battleResult === 'win')
      ? { y: [0, -12, 0], transition: { duration: 0.4 } }
      : battlePhase === 'feedback' && battleResult === 'lose'
        ? { x: [-6, 6, -6, 6, 0], transition: { duration: 0.4 } }
        : {}

  return (
    <motion.div
      animate={animate}
      style={{ display: 'inline-block', lineHeight: 1, width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  )
}
