import { useEffect, useRef, useCallback, useState } from 'react'
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
  const [hasStarted, setHasStarted] = useState(false)

  const handleComplete = useCallback(() => {
    onComplete(strokeResultsRef.current)
  }, [onComplete])

  useEffect(() => {
    if (!hostRef.current) return

    strokeResultsRef.current = []
    strokeIndexRef.current = 0
    setHasStarted(false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let charInstance: any = null

    const init = async () => {
      const { char: kakitoriChar } = await import('@k1low/kakitori')

      charInstance = kakitoriChar.create(char)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      charInstance.mount(hostRef.current!, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onCorrectStroke: (data: any) => {
          setHasStarted(true)
          const result: StrokeEndingResult = {
            strokeIndex: strokeIndexRef.current++,
            detectedEnding: inferEndingType(data?.strokeEnding?.velocityProfile),
            isCorrect: data?.strokeEnding?.correct ?? true,
            expectedEndings: ((data?.strokeEnding?.expected ?? []) as string[])
              .filter((e): e is 'tome' | 'hane' | 'harai' =>
                e === 'tome' || e === 'hane' || e === 'harai',
              ),
          }
          strokeResultsRef.current.push(result)
        },
        onMistake: () => {
          setHasStarted(true)
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
        position: 'relative',
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
        className={hasStarted ? undefined : 'writing-pulse'}
        style={{
          flex: 1,
          position: 'relative',
          border: '2px solid transparent',
          transition: 'border-color 0.3s',
        }}
      />
      {!hasStarted && (
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'var(--color-accent)',
            fontSize: '0.75em',
            pointerEvents: 'none',
            opacity: 0.8,
          }}
        >
          ✏ なぞってかけ！
        </div>
      )}
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
