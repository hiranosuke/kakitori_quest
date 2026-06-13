# Phase 5-B 音声フィードバック Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web Audio API で合成した効果音（SE）を10種のゲームイベントに追加する。

**Architecture:** 音のパラメーター（周波数・長さ・波形・音量）はすべて `src/config/sounds.ts` に宣言的に定義する。`src/lib/soundManager.ts` がそれを Web Audio API で再生するエンジン（シングルトン）。各イベント発火元（主に `gameStore`、一部コンポーネント）が `play(id)` を呼ぶ。

**Tech Stack:** TypeScript, Web Audio API（OscillatorNode / GainNode）, Vitest + jsdom（AudioContext はモック）

---

## 設計仕様との差分（重要）

承認済み仕様 `docs/superpowers/specs/2026-06-13-phase5b-audio-design.md` のコールサイト表は `BattleStage.tsx` 中心だったが、実コードでは:

- ストローク正解/ミスのコールバックは `WritingArea.tsx` にある
- バトルのフェーズ遷移（勝敗・ステージクリア・ボスクリア）はすべて `gameStore.ts` のアクション内にある

そのため、コールサイトを実コードに合わせて**ストア中心**にマッピングし直す。これにより呼び出しが1箇所に集約され、テストも容易になる。さらに `battle_start`/`boss_start` の「合成音はノイズ/トレモロ」という仕様のヒントは、合成エンジンをオシレーターのみに保つため**低音オシレーターによる近似**に簡略化する（子供が区別できる識別性が目的で、波形の厳密さは要件ではない）。

### 確定コールサイト

| SoundId | 場所 | トリガー |
|---|---|---|
| `correct_stroke` | `src/components/game/WritingArea.tsx`（内部 kakitori `onCorrectStroke` cb） | 画の正解ごと |
| `mistake` | `src/store/gameStore.ts` `onStrokeMistake` | 画のミスごと |
| `battle_start` | `src/store/gameStore.ts` `startStage` | 通常ステージ開始 |
| `boss_start` | `src/store/gameStore.ts` `startBossStage` | ボスステージ開始 |
| `char_complete` | `src/store/gameStore.ts` `onBattleWin`（非最終文字の勝利分岐） | 1文字クリア（続く文字あり） |
| `stage_clear` | `src/store/gameStore.ts` `onBattleWin`（通常・最終文字分岐） | 通常ステージ完全クリア |
| `boss_clear` | `src/store/gameStore.ts` `onBattleWin`（ボス分岐） | ボス撃破 |
| `battle_lose` | `src/store/gameStore.ts` `onBattleLose` | バトル敗北（ハート残あり/ゲームオーバー両方） |
| `item_use` | `src/store/gameStore.ts` `healHeart`（成功時） | かいふくやく使用成功 |
| `shop_buy` | `src/screens/ShopScreen.tsx` `handleBuy`（購入成功時） | 購入成功 |

---

## File Structure

- **Create** `src/config/sounds.ts` — `SoundId` 型、`Note` 型、`SOUND_SPECS` 定義、エンジン定数（`ATTACK_SEC`）。数値はすべてここ。
- **Create** `src/lib/soundManager.ts` — `play(id)` / `setMuted(bool)` を export する合成エンジン。
- **Create** `src/__tests__/config/sounds.test.ts` — 全 SoundId が非空 spec を持つことを検証。
- **Create** `src/__tests__/lib/soundManager.test.ts` — AudioContext をモックし、遅延初期化・ミュート・全 id スモークを検証。
- **Create** `src/__tests__/store/gameStoreSound.test.ts` — `soundManager` をモックし、各ストアアクションが正しい id を鳴らすか検証。
- **Modify** `src/store/gameStore.ts` — 8 箇所に `play()` を追加。
- **Modify** `src/components/game/WritingArea.tsx` — `correct_stroke` を追加。
- **Modify** `src/screens/ShopScreen.tsx` — `shop_buy` を追加。

---

## Task 1: 音定義 config

**Files:**
- Create: `src/config/sounds.ts`
- Test: `src/__tests__/config/sounds.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/config/sounds.test.ts
import { describe, it, expect } from 'vitest'
import { SOUND_SPECS, SOUND_IDS } from '../../config/sounds'

describe('SOUND_SPECS', () => {
  it('10種すべての SoundId に非空の spec が定義されている', () => {
    expect(SOUND_IDS).toHaveLength(10)
    for (const id of SOUND_IDS) {
      const spec = SOUND_SPECS[id]
      expect(spec, `spec for ${id}`).toBeDefined()
      expect(spec.length, `notes for ${id}`).toBeGreaterThan(0)
    }
  })

  it('各 Note は正の周波数・長さと有効な波形を持つ', () => {
    const valid = ['sine', 'square', 'sawtooth', 'triangle']
    for (const id of SOUND_IDS) {
      for (const note of SOUND_SPECS[id]) {
        expect(note.freq).toBeGreaterThan(0)
        expect(note.duration).toBeGreaterThan(0)
        expect(note.start).toBeGreaterThanOrEqual(0)
        expect(valid).toContain(note.type)
      }
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/config/sounds.test.ts`
Expected: FAIL — `Cannot find module '../../config/sounds'`

- [ ] **Step 3: Write the config**

```ts
// src/config/sounds.ts

// とめ/はね/はらい のような派手な合成音ではなく、子供が識別しやすい
// シンプルなトーン列で各イベントを表現する。数値はすべてこのファイルに集約。

export type SoundId =
  | 'correct_stroke'
  | 'mistake'
  | 'char_complete'
  | 'battle_lose'
  | 'stage_clear'
  | 'item_use'
  | 'shop_buy'
  | 'battle_start'
  | 'boss_start'
  | 'boss_clear'

export const SOUND_IDS: SoundId[] = [
  'correct_stroke',
  'mistake',
  'char_complete',
  'battle_lose',
  'stage_clear',
  'item_use',
  'shop_buy',
  'battle_start',
  'boss_start',
  'boss_clear',
]

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle'

// 1音ぶんの定義。freqEnd 指定時は freq→freqEnd へ線形に周波数を変化させる。
// start は play() からのオフセット秒。複数 Note を同じ start にすると和音になる。
export interface Note {
  type: Waveform
  freq: number
  freqEnd?: number
  start: number
  duration: number
  gain: number
}

// ゲイン包絡のアタック時間（秒）
export const ATTACK_SEC = 0.01

export const SOUND_SPECS: Record<SoundId, Note[]> = {
  // 画の正解: 短い上昇トーン（ピッ）
  correct_stroke: [
    { type: 'sine', freq: 440, freqEnd: 660, start: 0, duration: 0.12, gain: 0.3 },
  ],
  // 画のミス: 低い下降トーン（ブッ）
  mistake: [
    { type: 'sawtooth', freq: 220, freqEnd: 110, start: 0, duration: 0.18, gain: 0.25 },
  ],
  // 1文字完成: 明るい和音（C5+E5+G5）
  char_complete: [
    { type: 'sine', freq: 523.25, start: 0, duration: 0.35, gain: 0.25 },
    { type: 'sine', freq: 659.25, start: 0, duration: 0.35, gain: 0.25 },
    { type: 'sine', freq: 783.99, start: 0, duration: 0.35, gain: 0.25 },
  ],
  // バトル負け: 重い下降音
  battle_lose: [
    { type: 'triangle', freq: 180, freqEnd: 80, start: 0, duration: 0.4, gain: 0.3 },
  ],
  // ステージクリア: 上昇メロディ C5→E5→G5→C6
  stage_clear: [
    { type: 'sine', freq: 523.25, start: 0, duration: 0.18, gain: 0.3 },
    { type: 'sine', freq: 659.25, start: 0.18, duration: 0.18, gain: 0.3 },
    { type: 'sine', freq: 783.99, start: 0.36, duration: 0.18, gain: 0.3 },
    { type: 'sine', freq: 1046.5, start: 0.54, duration: 0.3, gain: 0.3 },
  ],
  // アイテム使用: キラキラ上昇
  item_use: [
    { type: 'sine', freq: 1318.5, start: 0, duration: 0.08, gain: 0.2 },
    { type: 'sine', freq: 1567.98, start: 0.08, duration: 0.08, gain: 0.2 },
    { type: 'sine', freq: 2093, start: 0.16, duration: 0.12, gain: 0.2 },
  ],
  // ショップ購入: コイン音 B5→E6
  shop_buy: [
    { type: 'sine', freq: 987.77, start: 0, duration: 0.07, gain: 0.25 },
    { type: 'sine', freq: 1318.5, start: 0.07, duration: 0.13, gain: 0.25 },
  ],
  // 通常バトル開始: 短い低音の踏み込み
  battle_start: [
    { type: 'square', freq: 150, start: 0, duration: 0.1, gain: 0.25 },
    { type: 'square', freq: 300, start: 0.1, duration: 0.12, gain: 0.2 },
  ],
  // ボス戦開始: 不穏な低音2連（ノイズ/トレモロの近似）
  boss_start: [
    { type: 'sawtooth', freq: 110, freqEnd: 90, start: 0, duration: 0.3, gain: 0.3 },
    { type: 'sawtooth', freq: 110, freqEnd: 90, start: 0.32, duration: 0.3, gain: 0.3 },
  ],
  // ボス撃破: 勝利ファンファーレ C5→E5→G5→C6→E6
  boss_clear: [
    { type: 'sine', freq: 523.25, start: 0, duration: 0.16, gain: 0.3 },
    { type: 'sine', freq: 659.25, start: 0.16, duration: 0.16, gain: 0.3 },
    { type: 'sine', freq: 783.99, start: 0.32, duration: 0.16, gain: 0.3 },
    { type: 'sine', freq: 1046.5, start: 0.48, duration: 0.16, gain: 0.3 },
    { type: 'sine', freq: 1318.5, start: 0.64, duration: 0.4, gain: 0.3 },
  ],
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/config/sounds.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/config/sounds.ts src/__tests__/config/sounds.test.ts
git commit -m "feat: add sound spec config for Phase 5-B audio"
```

---

## Task 2: soundManager エンジン

**Files:**
- Create: `src/lib/soundManager.ts`
- Test: `src/__tests__/lib/soundManager.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/lib/soundManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SOUND_IDS } from '../../config/sounds'

// --- AudioContext モック ---
function makeParam() {
  return {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
}
function makeOscillator() {
  return {
    type: 'sine',
    frequency: makeParam(),
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }
}
function makeGain() {
  return { gain: makeParam(), connect: vi.fn() }
}

let ctorCount = 0
let lastCtx: any
function installAudioMock() {
  ctorCount = 0
  class FakeAudioContext {
    currentTime = 0
    state = 'running'
    destination = {}
    resume = vi.fn()
    createOscillator = vi.fn(() => makeOscillator())
    createGain = vi.fn(() => makeGain())
    constructor() {
      ctorCount++
      lastCtx = this
    }
  }
  ;(globalThis as any).AudioContext = FakeAudioContext
  ;(globalThis as any).webkitAudioContext = FakeAudioContext
}

async function freshManager() {
  vi.resetModules()
  installAudioMock()
  return await import('../../lib/soundManager')
}

describe('soundManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AudioContext を遅延生成し、複数回 play しても1つだけ使い回す', async () => {
    const sm = await freshManager()
    expect(ctorCount).toBe(0) // import だけでは生成しない
    sm.play('correct_stroke')
    sm.play('mistake')
    expect(ctorCount).toBe(1)
  })

  it('ミュート中は音を生成しない', async () => {
    const sm = await freshManager()
    sm.setMuted(true)
    sm.play('correct_stroke')
    expect(ctorCount).toBe(0)
    expect(lastCtx).toBeUndefined()
  })

  it('setMuted(false) で再び鳴る', async () => {
    const sm = await freshManager()
    sm.setMuted(true)
    sm.play('correct_stroke')
    sm.setMuted(false)
    sm.play('correct_stroke')
    expect(lastCtx.createOscillator).toHaveBeenCalled()
  })

  it('全 SoundId が例外なく再生でき、spec の音数ぶん oscillator を生成する', async () => {
    const sm = await freshManager()
    for (const id of SOUND_IDS) {
      expect(() => sm.play(id)).not.toThrow()
    }
    // 少なくとも SoundId 数ぶんは生成されている
    expect(lastCtx.createOscillator.mock.calls.length).toBeGreaterThanOrEqual(SOUND_IDS.length)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/lib/soundManager.test.ts`
Expected: FAIL — `Cannot find module '../../lib/soundManager'`

- [ ] **Step 3: Write the engine**

```ts
// src/lib/soundManager.ts
import { SOUND_SPECS, ATTACK_SEC, type SoundId } from '../config/sounds'

let ctx: AudioContext | null = null
let muted = false

const SILENT = 0.0001

function getCtx(): AudioContext | null {
  if (ctx) return ctx
  const Ctor =
    (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  return ctx
}

export function setMuted(value: boolean): void {
  muted = value
}

export function play(id: SoundId): void {
  if (muted) return
  const audio = getCtx()
  if (!audio) return
  if (audio.state === 'suspended') audio.resume?.()

  const now = audio.currentTime
  for (const note of SOUND_SPECS[id]) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    const t0 = now + note.start
    const t1 = t0 + note.duration

    osc.type = note.type
    osc.frequency.setValueAtTime(note.freq, t0)
    if (note.freqEnd !== undefined) {
      osc.frequency.linearRampToValueAtTime(note.freqEnd, t1)
    }

    // クリック音を避けるための簡易ADエンベロープ
    gain.gain.setValueAtTime(SILENT, t0)
    gain.gain.exponentialRampToValueAtTime(note.gain, t0 + ATTACK_SEC)
    gain.gain.exponentialRampToValueAtTime(SILENT, t1)

    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start(t0)
    osc.stop(t1)
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/lib/soundManager.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/soundManager.ts src/__tests__/lib/soundManager.test.ts
git commit -m "feat: add soundManager Web Audio engine for Phase 5-B"
```

---

## Task 3: gameStore に効果音を配線（8イベント）

**Files:**
- Modify: `src/store/gameStore.ts`
- Test: `src/__tests__/store/gameStoreSound.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/store/gameStoreSound.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../lib/soundManager', () => ({
  play: vi.fn(),
  setMuted: vi.fn(),
}))

import { play } from '../../lib/soundManager'
import { useGameStore } from '../../store/gameStore'
import { WORLDS } from '../../config/worlds'

const playMock = vi.mocked(play)

function resetStore() {
  useGameStore.setState({
    screen: 'title',
    currentWorldId: 'grade1',
    currentEntry: null,
    currentCharIndex: 0,
    hearts: 3,
    endingResults: [],
    battlePhase: 'writing',
    battleMessage: '',
    battleResult: null,
    isBossStage: false,
  })
}

describe('gameStore 効果音', () => {
  beforeEach(() => {
    playMock.mockClear()
    resetStore()
  })

  it('startStage で battle_start が鳴る', () => {
    useGameStore.getState().startStage({ id: 'w', word: 'やま', reading: 'やま', hint: '⛰' })
    expect(playMock).toHaveBeenCalledWith('battle_start')
  })

  it('startBossStage で boss_start が鳴る', () => {
    const boss = WORLDS.find((w) => w.bossWord)!
    useGameStore.getState().startBossStage(boss.id)
    expect(playMock).toHaveBeenCalledWith('boss_start')
  })

  it('onStrokeMistake で mistake が鳴る', () => {
    useGameStore.setState({ hearts: 3 })
    useGameStore.getState().onStrokeMistake()
    expect(playMock).toHaveBeenCalledWith('mistake')
  })

  it('onBattleLose で battle_lose が鳴る', () => {
    useGameStore.setState({ hearts: 3, currentEntry: { id: 'w', word: 'やま', reading: 'やま', hint: '⛰' } })
    useGameStore.getState().onBattleLose()
    expect(playMock).toHaveBeenCalledWith('battle_lose')
  })

  it('非最終文字の勝利で char_complete が鳴る', () => {
    useGameStore.setState({
      currentEntry: { id: 'w', word: 'やま', reading: 'やま', hint: '⛰' },
      currentCharIndex: 0,
      isBossStage: false,
    })
    useGameStore.getState().onBattleWin()
    expect(playMock).toHaveBeenCalledWith('char_complete')
  })

  it('通常ステージ最終文字の勝利で stage_clear が鳴る', () => {
    useGameStore.setState({
      currentEntry: { id: 'w', word: 'や', reading: 'や', hint: '⛰' },
      currentCharIndex: 0,
      endingResults: [],
      isBossStage: false,
    })
    useGameStore.getState().onBattleWin()
    expect(playMock).toHaveBeenCalledWith('stage_clear')
  })

  it('ボス最終文字の勝利で boss_clear が鳴る', () => {
    useGameStore.setState({
      currentEntry: { id: 'b', word: 'り', reading: 'り', hint: '⚡' },
      currentCharIndex: 0,
      isBossStage: true,
      currentWorldId: 'grade1',
    })
    useGameStore.getState().onBattleWin()
    expect(playMock).toHaveBeenCalledWith('boss_clear')
  })

  it('healHeart 成功時に item_use が鳴る', () => {
    // ポーション1個・ハート減少状態を用意
    const { useWardrobeStore } = require('../../store/wardrobeStore')
    useWardrobeStore.setState({ potionCount: 1 })
    useGameStore.setState({ hearts: 1 })
    useGameStore.getState().healHeart()
    expect(playMock).toHaveBeenCalledWith('item_use')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/store/gameStoreSound.test.ts`
Expected: FAIL — アサーション失敗（`play` がまだ呼ばれていない）

- [ ] **Step 3: Add the import to gameStore**

At top of `src/store/gameStore.ts`, after the `WORLDS` import (line 17), add:

```ts
import { play } from '../lib/soundManager'
```

- [ ] **Step 4: Add play() calls in gameStore actions**

In `startStage`, change the action body to play first. Replace:

```ts
      startStage: (entry) =>
        set((state) => ({
```

with:

```ts
      startStage: (entry) => {
        play('battle_start')
        set((state) => ({
```

and close the function — replace the existing closing of startStage:

```ts
          creatureSvg: null,
          creatureName: null,
        })),
```

with:

```ts
          creatureSvg: null,
          creatureName: null,
        }))
      },
```

In `startBossStage`, after the `if (!world || !world.bossWord) return` guard, add `play('boss_start')`:

```ts
      startBossStage: (worldId) => {
        const world = WORLDS.find((w) => w.id === worldId)
        if (!world || !world.bossWord) return
        play('boss_start')
        set((state) => ({
```

In `onStrokeMistake`, play at the top:

```ts
      onStrokeMistake: () => {
        play('mistake')
        const hearts = get().hearts - 1
```

In `onBattleWin`, add the three branch sounds. Replace:

```ts
        if (nextIndex >= currentEntry.word.length) {
          if (isBossStage) {
            const worldId = get().currentWorldId
            set((s) => ({
              screen: 'world-clear',
              battlePhase: 'won',
              clearedWords: { ...s.clearedWords, [`boss-${worldId}`]: 1 },
            }))
          } else {
```

with:

```ts
        if (nextIndex >= currentEntry.word.length) {
          if (isBossStage) {
            play('boss_clear')
            const worldId = get().currentWorldId
            set((s) => ({
              screen: 'world-clear',
              battlePhase: 'won',
              clearedWords: { ...s.clearedWords, [`boss-${worldId}`]: 1 },
            }))
          } else {
            play('stage_clear')
```

Then in the `else` (more chars remain) branch, replace:

```ts
        } else {
          set({
            currentCharIndex: nextIndex,
            battlePhase: 'writing',
            battleMessage: MSG.nextChar(get().creatureName ?? currentEntry.word),
          })
        }
```

with:

```ts
        } else {
          play('char_complete')
          set({
            currentCharIndex: nextIndex,
            battlePhase: 'writing',
            battleMessage: MSG.nextChar(get().creatureName ?? currentEntry.word),
          })
        }
```

In `onBattleLose`, play at the top:

```ts
      onBattleLose: () => {
        play('battle_lose')
        const hearts = get().hearts - 1
```

In `healHeart`, play only after both guards pass (i.e. potion was actually consumed). Replace:

```ts
      healHeart: () => {
        const { hearts } = get()
        if (hearts >= MAX_HEARTS) return
        if (!useWardrobeStore.getState().usePotion()) return
        set((s) => ({
```

with:

```ts
      healHeart: () => {
        const { hearts } = get()
        if (hearts >= MAX_HEARTS) return
        if (!useWardrobeStore.getState().usePotion()) return
        play('item_use')
        set((s) => ({
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/__tests__/store/gameStoreSound.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 6: Commit**

```bash
git add src/store/gameStore.ts src/__tests__/store/gameStoreSound.test.ts
git commit -m "feat: wire game event sound effects into gameStore"
```

---

## Task 4: WritingArea に correct_stroke を配線

**Files:**
- Modify: `src/components/game/WritingArea.tsx`

ストロークの正解は kakitori の `onCorrectStroke` コールバック（`WritingArea.tsx` 内、約L94）でのみ観測できる。専用テストは追加せず（既存コンポーネントテスト方針を維持）、型チェックとビルドで検証する。

- [ ] **Step 1: Add the import**

At the top of `src/components/game/WritingArea.tsx`, with the other imports, add:

```ts
import { play } from '../../lib/soundManager'
```

- [ ] **Step 2: Play in the onCorrectStroke callback**

Locate the kakitori `onCorrectStroke: (data: any) => {` callback (around L94). Add `play('correct_stroke')` as the first line of that callback body:

```ts
        onCorrectStroke: (data: any) => {
          play('correct_stroke')
```

(Keep all existing lines in the callback unchanged after this.)

- [ ] **Step 3: Verify typecheck/build passes**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/game/WritingArea.tsx
git commit -m "feat: play correct_stroke sound on each correct stroke"
```

---

## Task 5: ShopScreen に shop_buy を配線

**Files:**
- Modify: `src/screens/ShopScreen.tsx`

- [ ] **Step 1: Add the import**

At the top of `src/screens/ShopScreen.tsx`, with the other imports, add:

```ts
import { play } from '../lib/soundManager'
```

- [ ] **Step 2: Play on successful purchase**

In `handleBuy`, after `buyItem(item.id)` and before/after `setMessage(...)`, add `play('shop_buy')`. Replace:

```ts
    buyItem(item.id)
    setMessage(MSG.shop.purchased(item.name))
```

with:

```ts
    buyItem(item.id)
    play('shop_buy')
    setMessage(MSG.shop.purchased(item.name))
```

- [ ] **Step 3: Verify typecheck/build passes**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/screens/ShopScreen.tsx
git commit -m "feat: play shop_buy sound on successful purchase"
```

---

## Task 6: 最終検証とドキュメント更新

**Files:**
- Modify: `docs/kanji-quest-design.md`（フェーズ表の Phase 5 状態更新）

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — 既存テスト全件 + 新規（sounds 2 / soundManager 4 / gameStoreSound 8）

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: ビルド成功（型エラー・バンドルエラーなし）

- [ ] **Step 3: Manual smoke test (dev server)**

Run: `npm run dev`
ブラウザで以下を確認:
- ステージ開始で `battle_start`、ボス開始で `boss_start`
- 正しい画で `correct_stroke`、間違いで `mistake`
- 文字クリアで `char_complete`、ステージ/ボスクリアで `stage_clear`/`boss_clear`
- 負けで `battle_lose`、かいふくやくで `item_use`、購入で `shop_buy`

（音はブラウザのユーザー操作後に有効。最初のタップ以降に鳴ることを確認。）

- [ ] **Step 4: Update the design doc phase table**

In `docs/kanji-quest-design.md`, the Phase 5 row currently reads `設計中`. Split/annotate to reflect 5-B audio completion. Replace the Phase 5 row:

```
| Phase 5 | PWA化（ホーム画面追加・オフライン対応）・音声フィードバック（効果音） | 設計中 |
```

with:

```
| Phase 5-A | PWA化（ホーム画面追加・オフライン対応） | **完了** |
| Phase 5-B | 音声フィードバック（効果音10種・Web Audio合成） | **完了** |
```

- [ ] **Step 5: Commit**

```bash
git add docs/kanji-quest-design.md
git commit -m "docs: mark Phase 5-B audio feedback as complete"
```

---

## Self-Review

- **Spec coverage:** 10種すべての SoundId（仕様の表）→ Task 1 の `SOUND_SPECS` + Task 3/4/5 のコールサイトで網羅。ミュート対応口 → soundManager `setMuted`（Task 2）。BGM・音量UI・音声ファイル → 対象外（仕様通り実装せず）。
- **Placeholder scan:** なし（全ステップに具体コード/コマンド）。
- **Type consistency:** `SoundId` は config で定義し全所で import。`play(id: SoundId)` / `setMuted(boolean)` のシグネチャは Task 2 の実装・全コールサイト・テストで一致。`Note` のフィールド（type/freq/freqEnd/start/duration/gain）は config 定義・エンジン消費・テスト検証で一致。
