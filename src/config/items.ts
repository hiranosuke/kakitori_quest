import type { DecorationSlotId } from './decorationSlots'

export interface ConsumableItem {
  type: 'consumable'
  id: string
  name: string
  description: string
  price: number
  effect: 'healHeart'
  effectValue: number
}

export interface DecorationItem {
  type: 'decoration'
  id: string
  name: string
  description: string
  price: number
  slot: DecorationSlotId
  svgLayer: string  // 64×64 座標系の SVG フラグメント（<svg>タグなし）
}

export type Item = ConsumableItem | DecorationItem

export const ITEMS: Item[] = [
  // ── 消耗品 ──────────────────────────────────────────────────────
  {
    type: 'consumable',
    id: 'potion',
    name: 'かいふくやく',
    description: 'ハートが 1 かいふくする',
    price: 30,
    effect: 'healHeart',
    effectValue: 1,
  },

  // ── 帽子 ────────────────────────────────────────────────────────
  {
    type: 'decoration',
    id: 'helmet',
    name: 'ぼうし',
    description: 'てつのかぶと',
    price: 150,
    slot: 'hat',
    svgLayer: `
      <rect x="18" y="2" width="28" height="16" fill="#888" rx="2"/>
      <rect x="15" y="14" width="34" height="5" fill="#666"/>
      <rect x="22" y="5" width="20" height="6" fill="#9CA3AF"/>
    `,
  },
  {
    type: 'decoration',
    id: 'wizard-hat',
    name: 'まほうぼうし',
    description: 'まほうつかいのぼうし',
    price: 200,
    slot: 'hat',
    svgLayer: `
      <rect x="21" y="5" width="21" height="11" fill="#7C3AED"/>
      <polygon points="32,0 14,20 50,20" fill="#7C3AED"/>
      <rect x="12" y="13" width="40" height="8" fill="#5B21B6"/>
      <circle cx="32" cy="8" r="3" fill="#FCD34D"/>
    `,
  },
  {
    type: 'decoration',
    id: 'crown',
    name: 'おうかん',
    description: 'おうさまのかんむり。こうきゅうひん',
    price: 500,
    slot: 'hat',
    svgLayer: `
      <rect x="19" y="10" width="26" height="7" fill="#EAB308"/>
      <rect x="19" y="5"  width="5"  height="8" fill="#EAB308"/>
      <rect x="30" y="3"  width="4"  height="10" fill="#EAB308"/>
      <rect x="40" y="5"  width="5"  height="8" fill="#EAB308"/>
      <rect x="21" y="7"  width="2"  height="2" fill="#DC2626"/>
      <rect x="31" y="5"  width="2"  height="2" fill="#DC2626"/>
      <rect x="41" y="7"  width="2"  height="2" fill="#DC2626"/>
    `,
  },

  // ── よろい ──────────────────────────────────────────────────────
  {
    type: 'decoration',
    id: 'leather-armor',
    name: 'かわのよろい',
    description: 'かわでできたかるいよろい',
    price: 120,
    slot: 'armor',
    svgLayer: `
      <rect x="16" y="35" width="32" height="16" fill="#92400E"/>
      <rect x="24" y="35" width="16" height="3"  fill="#A16207"/>
      <rect x="30" y="35" width="4"  height="16" fill="#78350F"/>
    `,
  },
  {
    type: 'decoration',
    id: 'iron-armor',
    name: 'てつのよろい',
    description: 'てつでできたかたいよろい',
    price: 300,
    slot: 'armor',
    svgLayer: `
      <rect x="16" y="35" width="32" height="16" fill="#6B7280"/>
      <rect x="20" y="35" width="24" height="4"  fill="#9CA3AF"/>
      <rect x="16" y="43" width="32" height="4"  fill="#4B5563"/>
      <rect x="28" y="35" width="8"  height="16" fill="#9CA3AF"/>
    `,
  },
  {
    type: 'decoration',
    id: 'robe',
    name: 'ローブ',
    description: 'まほうつかいのローブ',
    price: 350,
    slot: 'armor',
    svgLayer: `
      <rect x="16" y="35" width="32" height="29" fill="#7C3AED"/>
      <rect x="28" y="35" width="8"  height="29" fill="#6D28D9"/>
      <rect x="16" y="35" width="6"  height="29" fill="#6D28D9"/>
      <rect x="42" y="35" width="6"  height="29" fill="#6D28D9"/>
    `,
  },
]
