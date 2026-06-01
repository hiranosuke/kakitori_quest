import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { DQWindow } from '../components/ui/DQWindow'
import { StarRating } from '../components/ui/StarRating'
import { useGameStore } from '../store/gameStore'
import { calculateStars } from '../logic/starLogic'

export function StageCompleteScreen() {
  const { currentEntry, endingResults, clearedWords, goToStageSelect } = useGameStore()
  const stars = calculateStars(endingResults)
  const word = currentEntry?.word ?? ''

  useEffect(() => {
    const prev = clearedWords[word] ?? 0
    if (stars > prev) {
      useGameStore.setState((s) => ({
        clearedWords: { ...s.clearedWords, [word]: stars },
      }))
    }
  }, [word, stars, clearedWords])

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
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <DQWindow style={{ width: '300px', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-accent)', fontSize: '1.4em', marginBottom: '16px' }}>
            クリア！
          </div>
          <div style={{ fontSize: '2em', marginBottom: '8px' }}>
            {word}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <StarRating stars={stars} />
          </div>
          <button
            onClick={goToStageSelect}
            style={{
              display: 'block',
              width: '100%',
              background: 'none',
              border: 'none',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '1em',
              padding: '8px',
              cursor: 'pointer',
            }}
          >
            ▶　もどる
          </button>
        </DQWindow>
      </motion.div>
    </div>
  )
}
