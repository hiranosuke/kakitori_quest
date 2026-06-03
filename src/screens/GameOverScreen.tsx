import { DQWindow } from '../components/ui/DQWindow'
import { useGameStore } from '../store/gameStore'

export function GameOverScreen() {
  const { currentEntry, startStage, goToStageSelect } = useGameStore()

  const handleRetry = () => {
    if (currentEntry) startStage(currentEntry)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#000',
      }}
    >
      <DQWindow style={{ width: '300px', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-hp)', fontSize: '1.4em', marginBottom: '16px' }}>
          ゲームオーバー
        </div>
        <div style={{ color: 'var(--color-text-dim)', fontSize: '0.8em', marginBottom: '24px' }}>
          {currentEntry?.word ?? ''} をもういちどためそう
        </div>
        <button
          onClick={handleRetry}
          style={{
            display: 'block',
            width: '100%',
            background: 'none',
            border: 'none',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '1em',
            padding: '8px',
            cursor: 'pointer',
          }}
        >
          ▶　やりなおす
        </button>
        <button
          onClick={goToStageSelect}
          style={{
            display: 'block',
            width: '100%',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-dim)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '1em',
            padding: '8px',
            cursor: 'pointer',
          }}
        >
          ▶　べつの文字をえらぶ
        </button>
      </DQWindow>
    </div>
  )
}
