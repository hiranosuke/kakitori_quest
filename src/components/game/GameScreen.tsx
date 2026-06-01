import { useCallback } from 'react'
import type { StrokeEndingResult } from '../../types/game'
import { useGameStore } from '../../store/gameStore'
import { BattleStage } from './BattleStage'
import { WritingArea } from './WritingArea'

export function GameScreen() {
  const {
    currentEntry,
    currentCharIndex,
    hearts,
    battlePhase,
    writingAreaPosition,
    onStrokeMistake,
    onCharComplete,
  } = useGameStore()

  const char = currentEntry?.word[currentCharIndex] ?? ''

  const handleComplete = useCallback(
    (results: StrokeEndingResult[]) => {
      onCharComplete(results)
    },
    [onCharComplete],
  )

  const writingPanel = battlePhase === 'writing' && (
    <div
      style={{
        flex: writingAreaPosition === 'bottom' ? 'none' : 1,
        height: writingAreaPosition === 'bottom' ? '45%' : '100%',
      }}
    >
      <WritingArea
        char={char}
        hearts={hearts}
        maxHearts={3}
        onMistake={onStrokeMistake}
        onComplete={handleComplete}
      />
    </div>
  )

  const battlePanel = (
    <div style={{ flex: 1 }}>
      <BattleStage />
    </div>
  )

  if (writingAreaPosition === 'bottom') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {battlePanel}
        {writingPanel}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {writingAreaPosition === 'left' ? (
        <>
          {writingPanel}
          {battlePanel}
        </>
      ) : (
        <>
          {battlePanel}
          {writingPanel}
        </>
      )}
    </div>
  )
}
