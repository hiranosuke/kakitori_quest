# UX改善 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** プレイテストフィードバック4点（入力場所不明・ストロークフィードバック不足・ゲームオーバー選択肢不足・余白過多）を修正する

**Architecture:** 新ロジック関数（layoutLogic / strokeFeedback）をTDDで追加し、既存コンポーネントを最小限の変更で修正する。レイアウト自動検出はGameScreen内のResizeObserverで処理する。

**Tech Stack:** React 18, TypeScript, Zustand, Vitest, @testing-library/react, CSS keyframes

**Worktree:** `/Users/hiranyu1/repo/kakitori_quest/.claude/worktrees/feature+phase1/`

すべてのパスはworktreeルートからの相対パス。コマンドはworktreeルートで実行する。

---

## File Map

| ファイル | 変更種別 | 担当 |
|---------|---------|------|
| `src/types/game.ts` | Modify | `WritingAreaPosition` に `'auto'` 追加 |
| `src/store/gameStore.ts` | Modify | デフォルト `'auto'` に変更 |
| `src/logic/layoutLogic.ts` | Create | `getEffectiveLayout` 純粋関数 |
| `src/__tests__/logic/layoutLogic.test.ts` | Create | layoutLogic テスト |
| `src/components/game/GameScreen.tsx` | Modify | ResizeObserver でレイアウト自動検出 |
| `src/screens/SettingsScreen.tsx` | Modify | `'auto'` 選択肢を先頭に追加 |
| `src/styles/global.css` | Modify | `@keyframes pulse-border` 追加 |
| `src/components/game/WritingArea.tsx` | Modify | パルスアニメーション + hasStarted state |
| `src/logic/strokeFeedback.ts` | Create | `buildStrokeFeedback` 純粋関数 |
| `src/__tests__/logic/strokeFeedback.test.ts` | Create | strokeFeedback テスト |
| `src/components/game/BattleStage.tsx` | Modify | 負け時にフィードバック表示 |
| `src/components/game/MessageWindow.tsx` | Modify | `detail?: string` prop 追加 |
| `src/screens/GameOverScreen.tsx` | Modify | 「別の文字をえらぶ」ボタン追加 |

---

## Task 1: WritingAreaPosition 型に 'auto' 追加

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/store/gameStore.ts`

- [ ] **Step 1: `WritingAreaPosition` に `'auto'` を追加する**

`src/types/game.ts` の該当行を以下に変更：

```ts
export type WritingAreaPosition = 'auto' | 'right' | 'left' | 'bottom'
```

`src/store/gameStore.ts` の `partialize` と初期値を以下に変更（2箇所）：

```ts
// 初期値（persist の外）
writingAreaPosition: 'auto' as WritingAreaPosition,
```

`partialize` 内はそのまま（`writingAreaPosition` を永続化している箇所は変更不要）。

- [ ] **Step 2: TypeScript エラーがないか確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし（SettingsScreen と GameScreen は次タスクで対応するため、この時点でエラーが出る場合は一時的に無視して先に進む）

- [ ] **Step 3: コミット**

```bash
git add src/types/game.ts src/store/gameStore.ts
git commit -m "feat: add 'auto' to WritingAreaPosition type and set as default"
```

---

## Task 2: getEffectiveLayout ロジック（TDD）

**Files:**
- Create: `src/logic/layoutLogic.ts`
- Create: `src/__tests__/logic/layoutLogic.test.ts`

- [ ] **Step 1: テストを書く**

`src/__tests__/logic/layoutLogic.test.ts` を作成：

```ts
import { describe, it, expect } from 'vitest'
import { getEffectiveLayout } from '../../logic/layoutLogic'

describe('getEffectiveLayout', () => {
  it("'auto' + 横長 → 'right' を返す", () => {
    expect(getEffectiveLayout('auto', true)).toBe('right')
  })

  it("'auto' + 縦長 → 'bottom' を返す", () => {
    expect(getEffectiveLayout('auto', false)).toBe('bottom')
  })

  it("'left' は isLandscape に関わらず 'left' を返す", () => {
    expect(getEffectiveLayout('left', true)).toBe('left')
    expect(getEffectiveLayout('left', false)).toBe('left')
  })

  it("'right' は isLandscape に関わらず 'right' を返す", () => {
    expect(getEffectiveLayout('right', true)).toBe('right')
    expect(getEffectiveLayout('right', false)).toBe('right')
  })

  it("'bottom' は isLandscape に関わらず 'bottom' を返す", () => {
    expect(getEffectiveLayout('bottom', true)).toBe('bottom')
    expect(getEffectiveLayout('bottom', false)).toBe('bottom')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npx vitest run src/__tests__/logic/layoutLogic.test.ts
```

Expected: FAIL — `Cannot find module '../../logic/layoutLogic'`

- [ ] **Step 3: 実装を書く**

`src/logic/layoutLogic.ts` を作成：

```ts
import type { WritingAreaPosition } from '../types/game'

export function getEffectiveLayout(
  position: WritingAreaPosition,
  isLandscape: boolean,
): 'left' | 'right' | 'bottom' {
  if (position !== 'auto') return position
  return isLandscape ? 'right' : 'bottom'
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npx vitest run src/__tests__/logic/layoutLogic.test.ts
```

Expected: 5 tests passed

- [ ] **Step 5: コミット**

```bash
git add src/logic/layoutLogic.ts src/__tests__/logic/layoutLogic.test.ts
git commit -m "feat: add getEffectiveLayout logic with tests"
```

---

## Task 3: GameScreen レイアウト自動検出

**Files:**
- Modify: `src/components/game/GameScreen.tsx`

- [ ] **Step 1: `GameScreen.tsx` を以下に全面置換する**

```tsx
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
```

- [ ] **Step 2: TypeScript エラーがないか確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/game/GameScreen.tsx
git commit -m "feat: auto-detect landscape/portrait layout in GameScreen"
```

---

## Task 4: SettingsScreen に「じどう」選択肢追加

**Files:**
- Modify: `src/screens/SettingsScreen.tsx`

- [ ] **Step 1: `POSITIONS` 配列に `'auto'` を先頭に追加する**

`SettingsScreen.tsx` の `POSITIONS` 定義を以下に変更：

```ts
const POSITIONS: { value: WritingAreaPosition; label: string }[] = [
  { value: 'auto',   label: 'じどう（おすすめ）' },
  { value: 'right',  label: 'みぎ' },
  { value: 'left',   label: 'ひだり' },
  { value: 'bottom', label: 'した' },
]
```

- [ ] **Step 2: TypeScript エラーがないか確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/screens/SettingsScreen.tsx
git commit -m "feat: add auto layout option to settings screen"
```

---

## Task 5: 入力場所パルスアニメーション

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/game/WritingArea.tsx`

- [ ] **Step 1: global.css に `@keyframes` を追加する**

`src/styles/global.css` の末尾に追加：

```css
@keyframes pulse-border {
  0%   { border-color: var(--color-accent); box-shadow: 0 0 0px var(--color-accent); }
  50%  { border-color: var(--color-accent); box-shadow: 0 0 12px var(--color-accent); }
  100% { border-color: var(--color-accent); box-shadow: 0 0 0px var(--color-accent); }
}

.writing-pulse {
  animation: pulse-border 1.2s ease-in-out infinite;
}
```

- [ ] **Step 2: `WritingArea.tsx` に hasStarted state を追加する**

`WritingArea.tsx` を以下に全面置換：

```tsx
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
```

注意：`position: 'absolute'` の「なぞってかけ！」ラベルが正しく表示されるよう、外側の `div` に `position: 'relative'` を追加すること。外側 div のスタイルに `position: 'relative'` を加える。

- [ ] **Step 3: TypeScript エラーがないか確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add src/styles/global.css src/components/game/WritingArea.tsx
git commit -m "feat: add pulse animation and input hint to WritingArea"
```

---

## Task 6: buildStrokeFeedback ロジック（TDD）

**Files:**
- Create: `src/logic/strokeFeedback.ts`
- Create: `src/__tests__/logic/strokeFeedback.test.ts`

- [ ] **Step 1: テストを書く**

`src/__tests__/logic/strokeFeedback.test.ts` を作成：

```ts
import { describe, it, expect } from 'vitest'
import { buildStrokeFeedback } from '../../logic/strokeFeedback'
import type { StrokeEndingResult } from '../../types/game'

const makeResult = (
  strokeIndex: number,
  isCorrect: boolean,
  detectedEnding: StrokeEndingResult['detectedEnding'] = null,
): StrokeEndingResult => ({ strokeIndex, isCorrect, detectedEnding })

describe('buildStrokeFeedback', () => {
  it('全画正解なら null を返す', () => {
    const results = [makeResult(0, true, 'tome'), makeResult(1, true, 'harai')]
    expect(buildStrokeFeedback(results)).toBeNull()
  })

  it('不正解がなければ null を返す', () => {
    expect(buildStrokeFeedback([])).toBeNull()
  })

  it('1画不正解（tome 検出）のメッセージを返す', () => {
    const results = [makeResult(0, true, 'tome'), makeResult(1, false, 'tome')]
    expect(buildStrokeFeedback(results)).toBe('2かくめ：とめになっています')
  })

  it('harai 検出のメッセージを返す', () => {
    const results = [makeResult(0, false, 'harai')]
    expect(buildStrokeFeedback(results)).toBe('1かくめ：はらいになっています')
  })

  it('hane 検出のメッセージを返す', () => {
    const results = [makeResult(0, false, 'hane')]
    expect(buildStrokeFeedback(results)).toBe('1かくめ：はねになっています')
  })

  it('複数の不正解を改行で結合して返す', () => {
    const results = [
      makeResult(0, false, 'tome'),
      makeResult(1, true, 'harai'),
      makeResult(2, false, 'hane'),
    ]
    expect(buildStrokeFeedback(results)).toBe(
      '1かくめ：とめになっています\n3かくめ：はねになっています',
    )
  })

  it('detectedEnding が null の不正解は無視する', () => {
    const results = [makeResult(0, false, null), makeResult(1, false, 'tome')]
    expect(buildStrokeFeedback(results)).toBe('2かくめ：とめになっています')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npx vitest run src/__tests__/logic/strokeFeedback.test.ts
```

Expected: FAIL — `Cannot find module '../../logic/strokeFeedback'`

- [ ] **Step 3: 実装を書く**

`src/logic/strokeFeedback.ts` を作成：

```ts
import type { StrokeEndingResult, EndingType } from '../types/game'

const ENDING_JA: Record<EndingType, string> = {
  tome: 'とめ',
  hane: 'はね',
  harai: 'はらい',
}

export function buildStrokeFeedback(results: StrokeEndingResult[]): string | null {
  const wrongs = results.filter((r) => !r.isCorrect && r.detectedEnding !== null)
  if (wrongs.length === 0) return null
  return wrongs
    .map((r) => `${r.strokeIndex + 1}かくめ：${ENDING_JA[r.detectedEnding!]}になっています`)
    .join('\n')
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npx vitest run src/__tests__/logic/strokeFeedback.test.ts
```

Expected: 7 tests passed

- [ ] **Step 5: 全テストスイートが通ることを確認**

```bash
npx vitest run
```

Expected: すべて PASS

- [ ] **Step 6: コミット**

```bash
git add src/logic/strokeFeedback.ts src/__tests__/logic/strokeFeedback.test.ts
git commit -m "feat: add buildStrokeFeedback logic with tests"
```

---

## Task 7: BattleStage と MessageWindow にフィードバック表示

**Files:**
- Modify: `src/components/game/MessageWindow.tsx`
- Modify: `src/components/game/BattleStage.tsx`

- [ ] **Step 1: `MessageWindow.tsx` に `detail` prop を追加する**

```tsx
import { DQWindow } from '../ui/DQWindow'

interface MessageWindowProps {
  message: string
  detail?: string
}

export function MessageWindow({ message, detail }: MessageWindowProps) {
  return (
    <DQWindow style={{ minHeight: '60px' }}>
      <p style={{ fontSize: '0.9em', lineHeight: 1.8, color: 'var(--color-text)' }}>
        {message}
      </p>
      {detail && (
        <p
          style={{
            fontSize: '0.75em',
            lineHeight: 1.8,
            color: 'var(--color-text-dim)',
            marginTop: '4px',
            whiteSpace: 'pre-line',
          }}
        >
          {detail}
        </p>
      )}
    </DQWindow>
  )
}
```

- [ ] **Step 2: `BattleStage.tsx` でフィードバックを計算して渡す**

`BattleStage.tsx` の import 行に追加：

```ts
import { buildStrokeFeedback } from '../../logic/strokeFeedback'
```

`BattleStage` 関数本体の `accuracy` の次の行に追加：

```ts
const strokeFeedback = buildStrokeFeedback(endingResults)
```

`useEffect` 内の `setBattleMessage(...)` で負けメッセージを設定している箇所（`else` ブランチ）：

```ts
} else {
  setBattleMessage(`まがった「${char}」の かちだ…`)
  setTimeout(onBattleLose, 800)
}
```

これは変更しない。フィードバックは `MessageWindow` の `detail` prop 経由で表示する。

`BattleStage` の JSX の `<MessageWindow message={battleMessage} />` を以下に変更：

```tsx
<MessageWindow
  message={battleMessage}
  detail={battlePhase === 'lost' || battlePhase === 'battling' ? strokeFeedback ?? undefined : undefined}
/>
```

- [ ] **Step 3: TypeScript エラーがないか確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add src/components/game/MessageWindow.tsx src/components/game/BattleStage.tsx
git commit -m "feat: show stroke ending feedback in battle message"
```

---

## Task 8: GameOverScreen に「別の文字をえらぶ」ボタン追加

**Files:**
- Modify: `src/screens/GameOverScreen.tsx`

- [ ] **Step 1: `GameOverScreen.tsx` に `goToStageSelect` を追加する**

`GameOverScreen.tsx` を以下に全面置換：

```tsx
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
```

- [ ] **Step 2: TypeScript エラーがないか確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 3: 全テストスイートが通ることを確認**

```bash
npx vitest run
```

Expected: すべて PASS

- [ ] **Step 4: コミット**

```bash
git add src/screens/GameOverScreen.tsx
git commit -m "feat: add 'choose another word' option to game over screen"
```

---

## 完了確認

すべてのタスクが完了したら：

```bash
npx vitest run
npx tsc --noEmit
```

両方エラーなし・テスト全パスを確認してから仕上げ。

---

## 将来タスク（この計画の対象外）

- ストローク○/×オーバーレイ：お手本の上に各ストロークの正誤を重ねて表示
- 正解 ending type の vocabulary 紐付け：各文字の画ごとに期待する ending type を定義
