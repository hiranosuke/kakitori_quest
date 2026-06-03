import { useCallback, useLayoutEffect, useState } from 'react'
import type { StrokeEndingResult } from '../../types/game'
import { useGameStore } from '../../store/gameStore'
import { getEffectiveLayout } from '../../logic/layoutLogic'
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

  const [isLandscape, setIsLandscape] = useState(
    () => window.innerWidth > window.innerHeight,
  )

  useLayoutEffect(() => {
    const update = () => setIsLandscape(window.innerWidth > window.innerHeight)
    const observer = new ResizeObserver(update)
    observer.observe(document.documentElement)
    return () => observer.disconnect()
  }, [])

  const effectiveLayout = getEffectiveLayout(writingAreaPosition, isLandscape)

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
        flex: effectiveLayout === 'bottom' ? 'none' : 1,
        height: effectiveLayout === 'bottom' ? '45%' : '100%',
        width: effectiveLayout !== 'bottom' ? '40%' : '100%',
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

  if (effectiveLayout === 'bottom') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {battlePanel}
        {writingPanel}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {effectiveLayout === 'left' ? (
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
