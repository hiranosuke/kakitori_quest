import { useState, useEffect } from 'react'
import { DQWindow } from '../components/ui/DQWindow'
import { useGameStore } from '../store/gameStore'
import { useGoldStore } from '../store/goldStore'
import { useWardrobeStore } from '../store/wardrobeStore'
import { ITEMS } from '../config/items'
import { MSG } from '../config/messages'
import { play } from '../lib/soundManager'
import type { Item } from '../config/items'

type ShopTab = 'consumable' | 'decoration'

export function ShopScreen() {
  const goToTitle = useGameStore((s) => s.goToTitle)
  const gold = useGoldStore((s) => s.gold)
  const { buyItem, purchasedDecorations, potionCount } = useWardrobeStore()
  const [tab, setTab] = useState<ShopTab>('consumable')
  const [message, setMessage] = useState('')
  const [errorPopup, setErrorPopup] = useState('')

  const filteredItems = ITEMS.filter((i) => i.type === tab)

  useEffect(() => {
    if (!errorPopup) return
    const t = setTimeout(() => setErrorPopup(''), 2500)
    return () => clearTimeout(t)
  }, [errorPopup])

  function handleBuy(item: Item) {
    if (gold < item.price) {
      setErrorPopup(MSG.shop.insufficientGold)
      return
    }
    const alreadyOwned =
      item.type === 'decoration' && purchasedDecorations.includes(item.id)
    if (alreadyOwned) {
      setErrorPopup(MSG.shop.alreadyOwned)
      return
    }
    buyItem(item.id)
    play('shop_buy')
    setMessage(MSG.shop.purchased(item.name))
  }

  function isOwned(item: Item): boolean {
    if (item.type === 'consumable') return false
    return purchasedDecorations.includes(item.id)
  }

  const TAB_STYLE = (active: boolean) => ({
    flex: 1,
    background: active ? '#222' : 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
    color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
    fontFamily: 'var(--font-pixel)',
    fontSize: '0.85em',
    padding: '8px',
    cursor: 'pointer',
  })

  const BTN_STYLE = {
    background: 'none',
    border: '1px solid #555',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-pixel)',
    fontSize: '0.8em',
    padding: '4px 10px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        background: '#000',
        padding: '16px',
        position: 'relative',
      }}
    >
      {/* エラーポップアップ */}
      {errorPopup && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          onClick={() => setErrorPopup('')}
        >
          <DQWindow style={{ padding: '20px 32px', textAlign: 'center' as const }}>
            <div style={{ color: 'var(--color-accent)', fontSize: '0.9em' }}>{errorPopup}</div>
            <div style={{ color: 'var(--color-text-dim)', fontSize: '0.7em', marginTop: '8px' }}>
              タップでとじる
            </div>
          </DQWindow>
        </div>
      )}
      <DQWindow style={{ width: '360px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: 'var(--color-accent)', fontSize: '0.9em' }}>{MSG.shop.title}</span>
          <span style={{ color: 'var(--color-accent)', fontSize: '0.9em' }}>{MSG.goldBalance(gold)}</span>
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', marginBottom: '8px' }}>
          <button style={TAB_STYLE(tab === 'consumable')} onClick={() => setTab('consumable')}>
            {MSG.shop.tabConsumable}
          </button>
          <button style={TAB_STYLE(tab === 'decoration')} onClick={() => setTab('decoration')}>
            {MSG.shop.tabDecoration}
          </button>
        </div>

        {/* アイテムリスト */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredItems.map((item) => {
            const owned = isOwned(item)
            const isPotion = item.id === 'potion'
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 4px',
                  borderBottom: '1px solid #1a1a1a',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95em' }}>
                    {item.name}
                    {isPotion && potionCount > 0 && (
                      <span style={{ color: 'var(--color-text-dim)', fontSize: '0.8em' }}> ×{potionCount}</span>
                    )}
                  </div>
                  <div style={{ color: 'var(--color-text-dim)', fontSize: '0.75em' }}>{item.description}</div>
                </div>
                <span style={{ color: 'var(--color-accent)', fontSize: '0.85em', whiteSpace: 'nowrap' }}>
                  {item.price}G
                </span>
                <button
                  style={{
                    ...BTN_STYLE,
                    opacity: owned ? 0.4 : 1,
                    cursor: owned ? 'default' : 'pointer',
                  }}
                  onClick={() => !owned && handleBuy(item)}
                  disabled={owned}
                >
                  {owned ? MSG.shop.alreadyOwned : MSG.shop.buy}
                </button>
              </div>
            )
          })}
        </div>

        {/* 購入メッセージ */}
        {message && (
          <div style={{ color: 'var(--color-accent)', fontSize: '0.85em', padding: '8px 0', minHeight: '24px' }}>
            {message}
          </div>
        )}

        {/* もどる */}
        <button
          onClick={goToTitle}
          style={{
            marginTop: '8px',
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
