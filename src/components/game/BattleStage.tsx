import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveBattle } from '../../logic/battleLogic'
import { calculateAccuracy } from '../../logic/accuracyLogic'
import { buildStrokeFeedback } from '../../logic/strokeFeedback'
import { EnemyDisplay } from './EnemyDisplay'
import { CharacterDisplay } from './CharacterDisplay'
import { MessageWindow } from './MessageWindow'
import { useGameStore } from '../../store/gameStore'

export function BattleStage() {
  const {
    currentEntry,
    currentCharIndex,
    battlePhase,
    endingResults,
    battleMessage,
    setBattleFeedback,
    confirmBattle,
  } = useGameStore()

  const char = currentEntry?.word[currentCharIndex] ?? ''
  const accuracy = calculateAccuracy(endingResults)
  const strokeFeedback = buildStrokeFeedback(endingResults)

  useEffect(() => {
    if (battlePhase !== 'battling') return

    const result = resolveBattle(endingResults)
    const timer = setTimeout(() => {
      if (result === 'win') {
        setBattleFeedback('win', `${char}は かちのこった！`)
      } else {
        setBattleFeedback('lose', `まがった「${char}」の かちだ…`)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [battlePhase, char, endingResults, setBattleFeedback])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0a0014',
        padding: '12px',
        gap: '12px',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <AnimatePresence>
          <motion.div
            key={`enemy-${char}`}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <EnemyDisplay />
          </motion.div>
        </AnimatePresence>

        <div style={{ color: '#555', fontSize: '0.8em' }}>VS</div>

        <motion.div
          animate={
            battlePhase === 'battling'
              ? { x: [-4, 4, -4, 0], transition: { duration: 0.4 } }
              : {}
          }
        >
          <CharacterDisplay
            char={char}
            accuracy={accuracy}
            visible={battlePhase === 'battling' || battlePhase === 'won' || battlePhase === 'feedback'}
          />
        </motion.div>
      </div>

      <MessageWindow
        message={battleMessage}
        detail={(battlePhase === 'battling' || battlePhase === 'feedback') ? strokeFeedback ?? undefined : undefined}
      />

      {battlePhase === 'feedback' && (
        <button
          onClick={confirmBattle}
          style={{
            background: 'transparent',
            border: '2px solid var(--color-window-border)',
            color: 'var(--color-text)',
            fontFamily: 'inherit',
            fontSize: '0.9em',
            padding: '8px 16px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          ▼ タップして続ける
        </button>
      )}
    </div>
  )
}
