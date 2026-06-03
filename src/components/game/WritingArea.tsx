import { useEffect, useRef, useCallback } from 'react'
import type { StrokeEndingResult, EndingType } from '../../types/game'
import { HeartDisplay } from '../ui/HeartDisplay'

interface WritingAreaProps {
  char: string
  hearts: number
  maxHearts: number
  onMistake: () => void
  onComplete: (results: StrokeEndingResult[]) => void
}

function inferEndingType(velocityProfile?: string): EndingType | null {
  if (velocityProfile === 'decelerating') return 'tome'
  if (velocityProfile === 'accelerating') return 'harai'
  if (velocityProfile === 'constant') return 'hane'
  return null
}

export function WritingArea({
  char,
  hearts,
  maxHearts,
  onMistake,
  onComplete,
}: WritingAreaProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const strokeResultsRef = useRef<StrokeEndingResult[]>([])
  const strokeIndexRef = useRef(0)

  const handleComplete = useCallback(() => {
    onComplete(strokeResultsRef.current)
  }, [onComplete])

  useEffect(() => {
    if (!hostRef.current) return

    strokeResultsRef.current = []
    strokeIndexRef.current = 0

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let charInstance: any = null

    const init = async () => {
      const { char: kakitoriChar } = await import('@k1low/kakitori')

      charInstance = kakitoriChar.create(char)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      charInstance.mount(hostRef.current!, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onCorrectStroke: (data: any) => {
          const result: StrokeEndingResult = {
            strokeIndex: strokeIndexRef.current++,
            detectedEnding: inferEndingType(data?.strokeEnding?.velocityProfile),
            isCorrect: data?.strokeEnding?.correct ?? true,
          }
          strokeResultsRef.current.push(result)
        },
        onMistake: () => {
          onMistake()
        },
        onComplete: () => {
          handleComplete()
        },
      })
      charInstance.start()
    }

    init()

    return () => {
      charInstance?.unmount?.()
    }
  }, [char, onMistake, handleComplete])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '3px solid var(--color-window-border)',
        background: '#000',
      }}
    >
      <div
        style={{
          padding: '4px 8px',
          borderBottom: '2px solid var(--color-window-border)',
          color: 'var(--color-accent)',
          fontSize: '0.8em',
        }}
      >
        「{char}」をかけ！
      </div>
      <div
        ref={hostRef}
        style={{ flex: 1, position: 'relative' }}
      />
      <div
        style={{
          padding: '6px 8px',
          borderTop: '2px solid var(--color-window-border)',
        }}
      >
        <HeartDisplay current={hearts} max={maxHearts} />
      </div>
    </div>
  )
}
