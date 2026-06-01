import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveBattle } from '../../logic/battleLogic'
import { calculateAccuracy } from '../../logic/accuracyLogic'
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
    setBattleMessage,
    onBattleWin,
    onBattleLose,
  } = useGameStore()

  const char = currentEntry?.word[currentCharIndex] ?? ''
  const accuracy = calculateAccuracy(endingResults)

  useEffect(() => {
    if (battlePhase !== 'battling') return

    const result = resolveBattle(endingResults)
    const timer = setTimeout(() => {
      if (result === 'win') {
        setBattleMessage(`${char}は かちのこった！`)
        setTimeout(onBattleWin, 800)
      } else {
        setBattleMessage(`まがった「${char}」の かちだ…`)
        setTimeout(onBattleLose, 800)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [battlePhase, char, endingResults, onBattleWin, onBattleLose, setBattleMessage])

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
            <EnemyDisplay char={char} corruptionStyle="default" />
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
            visible={battlePhase === 'battling' || battlePhase === 'won'}
          />
        </motion.div>
      </div>

      <MessageWindow message={battleMessage} />
    </div>
  )
}
