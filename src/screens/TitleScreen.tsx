import { DQWindow } from '../components/ui/DQWindow'
import { useGameStore } from '../store/gameStore'

const MENU_BTN_STYLE = {
  display: 'block',
  width: '100%',
  background: 'none',
  border: 'none',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-pixel)',
  fontSize: '1em',
  padding: '8px',
  cursor: 'pointer',
  textAlign: 'left' as const,
}

export function TitleScreen() {
  const goToWorldSelect = useGameStore((s) => s.goToWorldSelect)
  const goToShop        = useGameStore((s) => s.goToShop)
  const goToWardrobe    = useGameStore((s) => s.goToWardrobe)
  const goToSettings    = useGameStore((s) => s.goToSettings)

  const hover = (e: React.MouseEvent<HTMLButtonElement>) =>
    (e.currentTarget.style.color = 'var(--color-accent)')
  const leave = (e: React.MouseEvent<HTMLButtonElement>) =>
    (e.currentTarget.style.color = 'var(--color-text)')

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        background: '#000',
      }}
    >
      <DQWindow style={{ width: '320px', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2em',
            color: 'var(--color-accent)',
            letterSpacing: '4px',
            marginBottom: '8px',
          }}
        >
          かきとり
        </h1>
        <div
          style={{
            fontSize: '1.2em',
            color: 'var(--color-text-dim)',
            marginBottom: '32px',
            letterSpacing: '2px',
          }}
        >
          QUEST
        </div>
        <button style={MENU_BTN_STYLE} onClick={goToWorldSelect} onMouseEnter={hover} onMouseLeave={leave}>
          ▶　あそぶ
        </button>
        <button style={MENU_BTN_STYLE} onClick={goToShop} onMouseEnter={hover} onMouseLeave={leave}>
          　　おみせ
        </button>
        <button style={MENU_BTN_STYLE} onClick={goToWardrobe} onMouseEnter={hover} onMouseLeave={leave}>
          　　そうび
        </button>
        <button style={MENU_BTN_STYLE} onClick={goToSettings} onMouseEnter={hover} onMouseLeave={leave}>
          　　せってい
        </button>
      </DQWindow>
    </div>
  )
}
