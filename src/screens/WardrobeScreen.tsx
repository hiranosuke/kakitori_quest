import { DQWindow } from '../components/ui/DQWindow'
import { HeroDisplay } from '../components/game/HeroDisplay'
import { useGameStore } from '../store/gameStore'
import { useWardrobeStore } from '../store/wardrobeStore'
import { ITEMS } from '../config/items'
import { DECORATION_SLOTS } from '../config/decorationSlots'
import { MSG } from '../config/messages'
import type { DecorationItem } from '../config/items'
import type { DecorationSlotId } from '../config/decorationSlots'

export function WardrobeScreen() {
  const goToTitle = useGameStore((s) => s.goToTitle)
  const { purchasedDecorations, equippedItems, equipDecoration, unequipSlot } = useWardrobeStore()

  const decorationItems = ITEMS.filter((i): i is DecorationItem => i.type === 'decoration')

  function handleEquip(item: DecorationItem) {
    const currentlyEquipped = equippedItems[item.slot]
    if (currentlyEquipped === item.id) {
      unequipSlot(item.slot)
    } else {
      equipDecoration(item.id, item.slot)
    }
  }

  const BTN_STYLE = (isEquipped: boolean) => ({
    background: isEquipped ? '#333' : 'none',
    border: `1px solid ${isEquipped ? 'var(--color-accent)' : '#555'}`,
    color: isEquipped ? 'var(--color-accent)' : 'var(--color-text)',
    fontFamily: 'var(--font-pixel)',
    fontSize: '0.8em',
    padding: '4px 10px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  })

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        background: '#000',
        padding: '16px',
      }}
    >
      <DQWindow style={{ width: '380px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* ヘッダー */}
        <div style={{ color: 'var(--color-accent)', fontSize: '0.9em' }}>{MSG.wardrobe.title}</div>

        {/* 勇者プレビュー */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <HeroDisplay size={96} />
        </div>

        {/* 所持アイテムリスト */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {purchasedDecorations.length === 0 ? (
            <div style={{ color: 'var(--color-text-dim)', fontSize: '0.8em', textAlign: 'center', padding: '16px 0' }}>
              {MSG.wardrobe.noItems}
            </div>
          ) : (
            (Object.keys(DECORATION_SLOTS) as DecorationSlotId[]).map((slot) => {
              const ownedInSlot = decorationItems.filter(
                (i) => i.slot === slot && purchasedDecorations.includes(i.id)
              )
              if (ownedInSlot.length === 0) return null
              return (
                <div key={slot} style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      color: 'var(--color-text-dim)',
                      fontSize: '0.75em',
                      borderBottom: '1px solid #333',
                      paddingBottom: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    {DECORATION_SLOTS[slot].label}
                  </div>
                  {ownedInSlot.map((item) => {
                    const isEquipped = equippedItems[slot] === item.id
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 4px',
                          borderBottom: '1px solid #111',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9em' }}>{item.name}</div>
                        </div>
                        <button
                          style={BTN_STYLE(isEquipped)}
                          onClick={() => handleEquip(item)}
                        >
                          {isEquipped ? MSG.wardrobe.unequip : MSG.wardrobe.equip}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* もどる */}
        <button
          onClick={goToTitle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-dim)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.8em',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          ◀　もどる
        </button>
      </DQWindow>
    </div>
  )
}
