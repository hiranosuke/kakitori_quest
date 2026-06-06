import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import type { StrokeEndingResult, KanjiDNA } from '../../types/game'
import { CHAR_SIZE_PX } from '../../types/game'
import { useGameStore } from '../../store/gameStore'
import { getEffectiveLayout } from '../../logic/layoutLogic'
import { fetchWordDNA } from '../../logic/kanjiDna'
import { generateCreature } from '../../logic/creatureGenerator'
import { BattleStage } from './BattleStage'
import { WritingArea } from './WritingArea'

export function GameScreen() {
  const {
    currentEntry,
    currentCharIndex,
    hearts,
    battlePhase,
    writingAreaPosition,
    charSize,
    stageCounter,
    onStrokeMistake,
    onCharComplete,
    setCreatureSvg,
    setCreatureName,
    setBattleMessage,
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

  // ステージが変わるたびにクリーチャーを生成
  useEffect(() => {
    if (!currentEntry) return
    let cancelled = false
    const word = currentEntry.word

    fetchWordDNA(word)
      .then((dna) => {
        if (!cancelled) {
          const creature = generateCreature(dna, word)
          setCreatureSvg(creature.svgString)
          setCreatureName(creature.name)
          setBattleMessage(`${creature.name}があらわれた！`)
        }
      })
      .catch(() => {
        if (!cancelled) {
          const fallback: KanjiDNA = {
            strokeCount: 4, hRatio: 0.5, curvature: 0.3, symmetry: 0.8,
            hue: (word.codePointAt(0) ?? 0) % 360,
          }
          const creature = generateCreature(fallback, word)
          setCreatureSvg(creature.svgString)
          setCreatureName(creature.name)
          setBattleMessage(`${creature.name}があらわれた！`)
        }
      })

    return () => { cancelled = true }
  }, [stageCounter]) // eslint-disable-line react-hooks/exhaustive-deps

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
        maxSize={CHAR_SIZE_PX[charSize]}
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
        {battlePanel}
        {writingPanel}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100dvh' }}>
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
