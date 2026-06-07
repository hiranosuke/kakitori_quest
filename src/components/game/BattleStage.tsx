import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveBattle } from '../../logic/battleLogic'
import { buildStrokeFeedback } from '../../logic/strokeFeedback'
import { EnemyDisplay } from './EnemyDisplay'
import { HeroDisplay } from './HeroDisplay'
import { MessageWindow } from './MessageWindow'
import { useGameStore } from '../../store/gameStore'
import { MSG } from '../../config/messages'

export function BattleStage() {
  const {
    currentEntry,
    currentCharIndex,
    hearts,
    battlePhase,
    battleResult,
    endingResults,
    battleMessage,
    creatureName,
    setBattleFeedback,
    confirmBattle,
  } = useGameStore()

  const char = currentEntry?.word[currentCharIndex] ?? ''
  const word = currentEntry?.word ?? ''
  const strokeFeedback = buildStrokeFeedback(endingResults)

  // 敵HP: feedback/won フェーズ中は「この文字クリア後」の値を先取りして表示
  const isResolved =
    (battlePhase === 'feedback' && battleResult === 'win') ||
    battlePhase === 'won'
  const effectiveCleared = isResolved ? currentCharIndex + 1 : currentCharIndex
  const enemyHpRatio = word.length === 0 ? 1 : Math.max(0, (word.length - effectiveCleared) / word.length)

  useEffect(() => {
    if (battlePhase !== 'battling') return

    const result = resolveBattle(endingResults)
    const timer = setTimeout(() => {
      if (result === 'win') {
        setBattleFeedback('win', MSG.attackSuccess(hearts))
      } else {
        setBattleFeedback('lose', MSG.attackFail(char))
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
      {/* 敵HPバー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--color-enemy)', fontSize: '0.75em', whiteSpace: 'nowrap' }}>
          {creatureName ?? word}
        </span>
        <div
          style={{
            flex: 1,
            height: '12px',
            background: '#2a0000',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid #770000',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(enemyHpRatio * 100).toFixed(1)}%`,
              background: enemyHpRatio > 0.5 ? '#cc2200' : enemyHpRatio > 0.25 ? '#ff6600' : '#ffcc00',
              borderRadius: '4px',
              transition: 'width 0.6s ease-out, background 0.6s',
            }}
          />
        </div>
      </div>

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
            key="enemy-creature"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <EnemyDisplay />
          </motion.div>
        </AnimatePresence>

        <div style={{ color: '#555', fontSize: '0.8em' }}>VS</div>

        <HeroDisplay />
      </div>

      <MessageWindow
        message={battleMessage}
        detail={
          battlePhase === 'battling' || battlePhase === 'feedback'
            ? strokeFeedback ?? undefined
            : undefined
        }
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
