# Phase 4 ワールド構造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 学年別ワールド選択・ボス戦・ワールドクリア解放の一連のゲームフローを実装する

**Architecture:** 新規 `worlds.ts`（ワールド定義＋ロジック）と `worldStore.ts`（Zustand永続化）を追加し、既存の `gameStore`・`StageSelectScreen`・`App.tsx` を最小限の修正で拡張する。ボス戦は既存の GameScreen をそのまま流用し `isBossStage` フラグで分岐する。ワールドクリアは新規 `WorldClearScreen` で世話をし、`worldStore.setClearedWorld()` を呼んで次ワールドを解放する。

**Tech Stack:** React 18, TypeScript, Zustand (persist), Vite, Vitest

---

## File Structure

**新規作成:**
- `src/config/worlds.ts` — `WorldConfig` 型・`WORLDS` 配列・`isWorldComplete()` ヘルパー
- `src/store/worldStore.ts` — Zustand persist: `clearedWorlds: string[]`, `currentWorldId: string`
- `src/screens/WorldSelectScreen.tsx` — ワールド選択UI（クリア済み★・未解放🔒）
- `src/screens/WorldClearScreen.tsx` — ワールドクリア演出・次ワールド解放
- `src/__tests__/logic/worldLogic.test.ts` — `isWorldComplete` の単体テスト

**既存ファイルの修正:**
- `src/data/wordList.ts` — `WordEntry` に `id: string` フィールド追加、全エントリに id 付与、19語追加
- `src/types/game.ts` — `Screen` 型に `'world-select'` と `'world-clear'` を追加
- `src/config/messages.ts` — ワールド関連メッセージ追加
- `src/store/gameStore.ts` — `isBossStage: boolean`・`startBossStage()`・`goToWorldSelect()`・`goToWorldClear()` 追加、`onBattleWin` のボス分岐追加
- `src/screens/TitleScreen.tsx` — 「あそぶ」ボタンの遷移先を `'world-select'` に変更
- `src/screens/StageSelectScreen.tsx` — 選択中ワールドの単語のみ表示・ボスステージ出現ロジック
- `src/App.tsx` — `'world-select'` と `'world-clear'` のルート追加

---

## Task 1: WordEntry に id フィールドを追加し wordList.ts を更新

**Files:**
- Modify: `src/data/wordList.ts`

- [ ] **Step 1: 型とファイルの現状確認**

  ```bash
  grep -n "WordEntry" src/data/wordList.ts | head -10
  ```

  Expected: `export interface WordEntry {` が1行目付近に見える

- [ ] **Step 2: wordList.ts を以下の完全な内容で書き換える**

  `src/data/wordList.ts` を以下に置き換える：

  ```ts
  export interface WordEntry {
    id: string      // 単語文字列そのもの（ひらがな or 漢字）
    word: string    // 書き取り対象の単語
    reading: string // 読み（漢字のとき word と異なる）
    hint: string    // 画面表示用の絵文字ヒント
  }

  export const WORD_LIST: WordEntry[] = [
    // 1文字
    { id: 'え', word: 'え', reading: 'え', hint: '🖼️' },
    { id: 'か', word: 'か', reading: 'か', hint: '🦟' },
    { id: 'き', word: 'き', reading: 'き', hint: '🌳' },
    { id: 'こ', word: 'こ', reading: 'こ', hint: '🧒' },
    { id: 'て', word: 'て', reading: 'て', hint: '🖐️' },
    { id: 'ひ', word: 'ひ', reading: 'ひ', hint: '🔥' },
    { id: 'め', word: 'め', reading: 'め', hint: '👁️' },
    { id: 'や', word: 'や', reading: 'や', hint: '🏹' },
    { id: 'ゆ', word: 'ゆ', reading: 'ゆ', hint: '♨️' },
    { id: 'わ', word: 'わ', reading: 'わ', hint: '⭕' },
    // 2文字
    { id: 'あめ', word: 'あめ', reading: 'あめ', hint: '🌧️' },
    { id: 'いぬ', word: 'いぬ', reading: 'いぬ', hint: '🐕' },
    { id: 'うし', word: 'うし', reading: 'うし', hint: '🐄' },
    { id: 'えび', word: 'えび', reading: 'えび', hint: '🦐' },
    { id: 'かに', word: 'かに', reading: 'かに', hint: '🦀' },
    { id: 'くも', word: 'くも', reading: 'くも', hint: '☁️' },
    { id: 'さる', word: 'さる', reading: 'さる', hint: '🐒' },
    { id: 'たこ', word: 'たこ', reading: 'たこ', hint: '🐙' },
    { id: 'ねこ', word: 'ねこ', reading: 'ねこ', hint: '🐈' },
    { id: 'はな', word: 'はな', reading: 'はな', hint: '🌸' },
    // 3文字
    { id: 'いちご', word: 'いちご', reading: 'いちご', hint: '🍓' },
    { id: 'うさぎ', word: 'うさぎ', reading: 'うさぎ', hint: '🐰' },
    { id: 'きつね', word: 'きつね', reading: 'きつね', hint: '🦊' },
    { id: 'さくら', word: 'さくら', reading: 'さくら', hint: '🌸' },
    { id: 'りんご', word: 'りんご', reading: 'りんご', hint: '🍎' },
    // 4文字
    { id: 'あおぞら', word: 'あおぞら', reading: 'あおぞら', hint: '🌤️' },
    { id: 'ひまわり', word: 'ひまわり', reading: 'ひまわり', hint: '🌻' },
    { id: 'むらさき', word: 'むらさき', reading: 'むらさき', hint: '💜' },
    // 5文字
    { id: 'かたつむり', word: 'かたつむり', reading: 'かたつむり', hint: '🐌' },
    // 漢字1文字（小学1年生）
    { id: '山', word: '山', reading: 'やま', hint: '⛰️' },
    { id: '川', word: '川', reading: 'かわ', hint: '🏞️' },
    { id: '木', word: '木', reading: 'き', hint: '🌲' },
    { id: '火', word: '火', reading: 'ひ', hint: '🔥' },
    { id: '水', word: '水', reading: 'みず', hint: '💧' },
    { id: '日', word: '日', reading: 'ひ', hint: '☀️' },
    { id: '月', word: '月', reading: 'つき', hint: '🌙' },
    { id: '目', word: '目', reading: 'め', hint: '👁️' },
    { id: '耳', word: '耳', reading: 'みみ', hint: '👂' },
    { id: '口', word: '口', reading: 'くち', hint: '👄' },
    { id: '手', word: '手', reading: 'て', hint: '🖐️' },
    { id: '花', word: '花', reading: 'はな', hint: '🌸' },
    { id: '虫', word: '虫', reading: 'むし', hint: '🐛' },
    { id: '雨', word: '雨', reading: 'あめ', hint: '🌧️' },
    { id: '石', word: '石', reading: 'いし', hint: '🪨' },
    { id: '草', word: '草', reading: 'くさ', hint: '🌿' },
    { id: '竹', word: '竹', reading: 'たけ', hint: '🎋' },
    { id: '森', word: '森', reading: 'もり', hint: '🌳' },
    { id: '空', word: '空', reading: 'そら', hint: '🌤️' },
    { id: '犬', word: '犬', reading: 'いぬ', hint: '🐕' },
    // 漢字2文字（小学1年生）
    { id: '火山', word: '火山', reading: 'かざん', hint: '🌋' },
    { id: '大木', word: '大木', reading: 'たいぼく', hint: '🌳' },
    { id: '天気', word: '天気', reading: 'てんき', hint: '⛅' },
    { id: '草木', word: '草木', reading: 'くさき', hint: '🌿' },
    { id: '大空', word: '大空', reading: 'おおぞら', hint: '🌌' },
    // 1ねんせいワールド追加語（カバー漢字: け・し・す・せ・ち・つ・と・な・に・ぬ・の・ふ・へ・ほ・ま・も・よ・れ・ん・ろ）
    { id: 'けむし', word: 'けむし', reading: 'けむし', hint: '🐛' },
    { id: 'しか', word: 'しか', reading: 'しか', hint: '🦌' },
    { id: 'すずめ', word: 'すずめ', reading: 'すずめ', hint: '🐦' },
    { id: 'せみ', word: 'せみ', reading: 'せみ', hint: '🦗' },
    { id: 'ちょうちょ', word: 'ちょうちょ', reading: 'ちょうちょ', hint: '🦋' },
    { id: 'つる', word: 'つる', reading: 'つる', hint: '🦢' },
    { id: 'とり', word: 'とり', reading: 'とり', hint: '🐦' },
    { id: 'なし', word: 'なし', reading: 'なし', hint: '🍐' },
    { id: 'にわとり', word: 'にわとり', reading: 'にわとり', hint: '🐓' },
    { id: 'ぬいぐるみ', word: 'ぬいぐるみ', reading: 'ぬいぐるみ', hint: '🧸' },
    { id: 'のはら', word: 'のはら', reading: 'のはら', hint: '🌾' },
    { id: 'ふね', word: 'ふね', reading: 'ふね', hint: '⛵' },
    { id: 'へび', word: 'へび', reading: 'へび', hint: '🐍' },
    { id: 'ほたる', word: 'ほたる', reading: 'ほたる', hint: '🌟' },
    { id: 'まめ', word: 'まめ', reading: 'まめ', hint: '🫘' },
    { id: 'もも', word: 'もも', reading: 'もも', hint: '🍑' },
    { id: 'よる', word: 'よる', reading: 'よる', hint: '🌙' },
    { id: 'れんこん', word: 'れんこん', reading: 'れんこん', hint: '🪷' },
    { id: 'ろうそく', word: 'ろうそく', reading: 'ろうそく', hint: '🕯️' },
  ]
  ```

- [ ] **Step 3: TypeScript エラーがないことを確認**

  ```bash
  npx tsc --noEmit
  ```

  Expected: エラーなし（`WordEntry` を使っている他ファイルは `id` フィールドを参照していないので影響なし）

- [ ] **Step 4: Commit**

  ```bash
  git add src/data/wordList.ts
  git commit -m "feat: add id field to WordEntry and extend word list with 19 new entries"
  ```

---

## Task 2: worlds.ts を作成し isWorldComplete をテスト駆動で実装

**Files:**
- Create: `src/config/worlds.ts`
- Create: `src/__tests__/logic/worldLogic.test.ts`

- [ ] **Step 1: テストファイルを作成**

  `src/__tests__/logic/worldLogic.test.ts`:

  ```ts
  import { describe, it, expect } from 'vitest'
  import { isWorldComplete } from '../../config/worlds'

  describe('isWorldComplete', () => {
    it('全単語がクリア済みのとき true を返す', () => {
      const clearedWords = { 'あめ': 2, 'いぬ': 1, 'うし': 3 }
      const wordIds = ['あめ', 'いぬ', 'うし']
      expect(isWorldComplete(clearedWords, wordIds)).toBe(true)
    })

    it('未クリアの単語があるとき false を返す', () => {
      const clearedWords = { 'あめ': 2, 'いぬ': 0 }
      const wordIds = ['あめ', 'いぬ', 'うし']
      expect(isWorldComplete(clearedWords, wordIds)).toBe(false)
    })

    it('clearedWords に存在しない単語は未クリアとみなす', () => {
      const clearedWords = { 'あめ': 1 }
      const wordIds = ['あめ', 'いぬ']
      expect(isWorldComplete(clearedWords, wordIds)).toBe(false)
    })

    it('星が 0 の単語は未クリアとみなす', () => {
      const clearedWords = { 'あめ': 0, 'いぬ': 1 }
      const wordIds = ['あめ', 'いぬ']
      expect(isWorldComplete(clearedWords, wordIds)).toBe(false)
    })

    it('wordIds が空のとき true を返す（ボスのみワールド想定）', () => {
      expect(isWorldComplete({}, [])).toBe(true)
    })
  })
  ```

- [ ] **Step 2: テストが失敗することを確認**

  ```bash
  npx vitest run src/__tests__/logic/worldLogic.test.ts
  ```

  Expected: FAIL（`worlds.ts` が存在しないため `Cannot find module`）

- [ ] **Step 3: worlds.ts を作成**

  `src/config/worlds.ts`:

  ```ts
  export interface WorldConfig {
    id: string          // 'grade1', 'grade2', ...
    name: string        // '1ねんせいワールド'
    wordIds: string[]   // WORD_LIST の id を参照
    bossWord: string    // ボス単語（ひらがな or 漢字）
    bossHint: string    // ボスの絵文字ヒント
  }

  export function isWorldComplete(
    clearedWords: Record<string, number>,
    wordIds: string[],
  ): boolean {
    return wordIds.every((id) => (clearedWords[id] ?? 0) > 0)
  }

  export const WORLDS: WorldConfig[] = [
    {
      id: 'grade1',
      name: '1ねんせいワールド',
      wordIds: [
        // 1文字ひらがな
        'え', 'か', 'き', 'こ', 'て', 'ひ', 'め', 'や', 'ゆ', 'わ',
        // 2文字ひらがな
        'あめ', 'いぬ', 'うし', 'えび', 'かに', 'くも', 'さる', 'たこ', 'ねこ', 'はな',
        // 3文字ひらがな
        'いちご', 'うさぎ', 'きつね', 'さくら', 'りんご',
        // 4文字ひらがな
        'あおぞら', 'ひまわり', 'むらさき',
        // 5文字ひらがな
        'かたつむり',
        // 漢字1文字（小1）
        '山', '川', '木', '火', '水', '日', '月', '目', '耳', '口', '手',
        '花', '虫', '雨', '石', '草', '竹', '森', '空', '犬',
        // 漢字2文字（小1）
        '火山', '大木', '天気', '草木', '大空',
        // 追加語（カバー用）
        'けむし', 'しか', 'すずめ', 'せみ', 'ちょうちょ', 'つる', 'とり',
        'なし', 'にわとり', 'ぬいぐるみ', 'のはら', 'ふね', 'へび', 'ほたる',
        'まめ', 'もも', 'よる', 'れんこん', 'ろうそく',
      ],
      bossWord: 'かみなり',
      bossHint: '⚡',
    },
    {
      id: 'grade2',
      name: '2ねんせいワールド',
      wordIds: [],
      bossWord: 'しんりんのとり',
      bossHint: '🐦',
    },
    {
      id: 'grade3',
      name: '3ねんせいワールド',
      wordIds: [],
      bossWord: '',
      bossHint: '👾',
    },
    {
      id: 'grade4',
      name: '4ねんせいワールド',
      wordIds: [],
      bossWord: '',
      bossHint: '👾',
    },
    {
      id: 'grade5',
      name: '5ねんせいワールド',
      wordIds: [],
      bossWord: '',
      bossHint: '👾',
    },
    {
      id: 'grade6',
      name: '6ねんせいワールド',
      wordIds: [],
      bossWord: '',
      bossHint: '👾',
    },
  ]
  ```

- [ ] **Step 4: テストが通ることを確認**

  ```bash
  npx vitest run src/__tests__/logic/worldLogic.test.ts
  ```

  Expected: 5 tests PASS

- [ ] **Step 5: 全テストが壊れていないことを確認**

  ```bash
  npx vitest run
  ```

  Expected: 全テスト PASS

- [ ] **Step 6: Commit**

  ```bash
  git add src/config/worlds.ts src/__tests__/logic/worldLogic.test.ts
  git commit -m "feat: add worlds config and isWorldComplete logic with tests"
  ```

---

## Task 3: worldStore.ts を作成

**Files:**
- Create: `src/store/worldStore.ts`

- [ ] **Step 1: worldStore.ts を作成**

  `src/store/worldStore.ts`:

  ```ts
  import { create } from 'zustand'
  import { persist } from 'zustand/middleware'

  interface WorldState {
    clearedWorlds: string[]
    currentWorldId: string
    setClearedWorld: (id: string) => void
    setCurrentWorld: (id: string) => void
  }

  export const useWorldStore = create<WorldState>()(
    persist(
      (set, get) => ({
        clearedWorlds: [],
        currentWorldId: 'grade1',

        setClearedWorld: (id) => {
          if (get().clearedWorlds.includes(id)) return
          set((s) => ({ clearedWorlds: [...s.clearedWorlds, id] }))
        },

        setCurrentWorld: (id) => set({ currentWorldId: id }),
      }),
      { name: 'kakitori-quest-worlds-v1' },
    ),
  )
  ```

- [ ] **Step 2: TypeScript エラーなし確認**

  ```bash
  npx tsc --noEmit
  ```

  Expected: エラーなし

- [ ] **Step 3: Commit**

  ```bash
  git add src/store/worldStore.ts
  git commit -m "feat: add worldStore with persisted clearedWorlds and currentWorldId"
  ```

---

## Task 4: Screen 型の拡張と messages.ts の更新

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/config/messages.ts`

- [ ] **Step 1: game.ts の Screen 型に新画面を追加**

  `src/types/game.ts` の `Screen` 型を以下に変更：

  ```ts
  export type Screen =
    | 'title'
    | 'world-select'
    | 'stageSelect'
    | 'game'
    | 'stageComplete'
    | 'gameOver'
    | 'settings'
    | 'shop'
    | 'wardrobe'
    | 'world-clear'
  ```

- [ ] **Step 2: messages.ts にワールド関連メッセージを追加**

  `src/config/messages.ts` の `MSG` オブジェクトに以下を追加（`potion` ブロックの後）：

  ```ts
    world: {
      locked: '🔒',
      cleared: '★',
      bossStage: 'ボスせん！',
      bossLabel: (hint: string) => `${hint} ボス`,
      clearTitle: 'ワールドクリア！',
      nextUnlocked: (name: string) => `${name}が かいほうされた！`,
      lastWorld: 'すべてのワールドをクリア！',
      backToWorlds: 'ワールドせんたく',
    },
  ```

- [ ] **Step 3: TypeScript エラーなし確認**

  ```bash
  npx tsc --noEmit
  ```

  Expected: エラーなし（`default` ケースを持つ switch 文が `world-select` / `world-clear` に対応していないという警告が出るかもしれないが、App.tsx を Task 9 で修正する）

- [ ] **Step 4: Commit**

  ```bash
  git add src/types/game.ts src/config/messages.ts
  git commit -m "feat: add world-select and world-clear screens to Screen type; add world messages"
  ```

---

## Task 5: gameStore.ts にボスステージ対応を追加

**Files:**
- Modify: `src/store/gameStore.ts`

ボス戦の流れ：
1. `startBossStage(worldId)` がボス用の WordEntry を組み立てて `startStage` と同じ初期化をする
2. `isBossStage: true` をセット
3. `onBattleWin` で全文字クリア時、`isBossStage` なら `'world-clear'` へ、通常なら `'stageComplete'` へ

- [ ] **Step 1: gameStore.ts のインターフェースに追加**

  `GameStore` インターフェースに以下を追記（`lastStageGold: number` の後）：

  ```ts
  isBossStage: boolean
  ```

  アクションに追記（`startStage: (entry: WordEntry) => void` の後）：

  ```ts
  startBossStage: (worldId: string) => void
  goToWorldSelect: () => void
  goToWorldClear: () => void
  ```

- [ ] **Step 2: 初期値に追加**

  `set` の初期値ブロックで `lastStageGold: 0` の後に追加：

  ```ts
  isBossStage: false,
  ```

- [ ] **Step 3: goToWorldSelect と goToWorldClear アクションを追加**

  `goToWardrobe: () => set({ screen: 'wardrobe' }),` の後に追加：

  ```ts
  goToWorldSelect: () => set({ screen: 'world-select' }),

  goToWorldClear: () => set({ screen: 'world-clear' }),
  ```

- [ ] **Step 4: startBossStage アクションを追加**

  `startStage` の実装の後に追加。`WORLDS` を import して bossWord / bossHint を取得する：

  まず import 文の先頭部分に追加：

  ```ts
  import { WORLDS } from '../config/worlds'
  ```

  次に `startStage` アクションの後に追加：

  ```ts
  startBossStage: (worldId) => {
    const world = WORLDS.find((w) => w.id === worldId)
    if (!world || !world.bossWord) return
    set((state) => ({
      screen: 'game',
      currentEntry: {
        id: `boss-${worldId}`,
        word: world.bossWord,
        reading: world.bossWord,
        hint: world.bossHint,
      },
      isBossStage: true,
      currentCharIndex: 0,
      hearts: MAX_HEARTS,
      endingResults: [],
      battlePhase: 'writing',
      battleMessage: MSG.loading,
      stageCounter: state.stageCounter + 1,
      creatureSvg: null,
      creatureName: null,
    }))
  },
  ```

- [ ] **Step 5: onBattleWin のボス分岐を追加**

  `onBattleWin` の「全文字クリア → ゴールド計算してステージクリア」ブロックを以下に変更：

  ```ts
  onBattleWin: () => {
    const { currentEntry, currentCharIndex, isBossStage } = get()
    if (!currentEntry) return
    const nextIndex = currentCharIndex + 1

    if (nextIndex >= currentEntry.word.length) {
      if (isBossStage) {
        set({ screen: 'world-clear', battlePhase: 'won' })
      } else {
        const stars = calculateStars(get().endingResults)
        const goldEarned = calcStageGold({
          species: 0,
          strokeCount: 0,
          wordLength: currentEntry.word.length,
          bestStarRating: stars,
          playCount: 1,
        })
        useGoldStore.getState().addGold(goldEarned)
        set({ screen: 'stageComplete', battlePhase: 'won', lastStageGold: goldEarned })
      }
    } else {
      set({
        currentCharIndex: nextIndex,
        battlePhase: 'writing',
        battleMessage: MSG.nextChar(get().creatureName ?? currentEntry.word),
      })
    }
  },
  ```

- [ ] **Step 6: startStage に isBossStage: false リセットを追加**

  `startStage` アクションの `set` 内に追加：

  ```ts
  startStage: (entry) =>
    set((state) => ({
      screen: 'game',
      currentEntry: entry,
      isBossStage: false,
      currentCharIndex: 0,
      hearts: MAX_HEARTS,
      endingResults: [],
      battlePhase: 'writing',
      battleMessage: MSG.loading,
      stageCounter: state.stageCounter + 1,
      creatureSvg: null,
      creatureName: null,
    })),
  ```

- [ ] **Step 7: TypeScript エラーなし確認**

  ```bash
  npx tsc --noEmit
  ```

  Expected: エラーなし

- [ ] **Step 8: 全テスト確認**

  ```bash
  npx vitest run
  ```

  Expected: 全テスト PASS

- [ ] **Step 9: Commit**

  ```bash
  git add src/store/gameStore.ts
  git commit -m "feat: add isBossStage, startBossStage, goToWorldSelect/Clear to gameStore"
  ```

---

## Task 6: WorldSelectScreen.tsx を作成

**Files:**
- Create: `src/screens/WorldSelectScreen.tsx`

ロジック：
- `WORLDS` をループして各ワールドのボタンを表示
- `clearedWorlds.includes(world.id)` なら ★クリア済み
- `idx === 0 || clearedWorlds.includes(WORLDS[idx-1].id)` なら解放済み → クリック可能
- それ以外は 🔒 ロック

- [ ] **Step 1: WorldSelectScreen.tsx を作成**

  `src/screens/WorldSelectScreen.tsx`:

  ```tsx
  import { DQWindow } from '../components/ui/DQWindow'
  import { useGameStore } from '../store/gameStore'
  import { useWorldStore } from '../store/worldStore'
  import { WORLDS } from '../config/worlds'
  import { MSG } from '../config/messages'

  export function WorldSelectScreen() {
    const { goToTitle, startBossStage } = useGameStore()
    const { clearedWorlds, currentWorldId, setCurrentWorld } = useWorldStore()
    const goToStageSelect = useGameStore((s) => s.goToStageSelect)

    function handleSelectWorld(worldId: string) {
      setCurrentWorld(worldId)
      goToStageSelect()
    }

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          background: '#000',
          padding: '16px',
        }}
      >
        <DQWindow style={{ width: '360px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: 'var(--color-accent)',
              fontSize: '0.9em',
              marginBottom: '12px',
              borderBottom: '1px solid #333',
              paddingBottom: '8px',
            }}
          >
            ワールドをえらぼう
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {WORLDS.map((world, idx) => {
              const isCleared = clearedWorlds.includes(world.id)
              const isUnlocked = idx === 0 || clearedWorlds.includes(WORLDS[idx - 1].id)

              return (
                <button
                  key={world.id}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && handleSelectWorld(world.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #1a1a1a',
                    color: isUnlocked ? 'var(--color-text)' : '#444',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '1em',
                    padding: '12px 8px',
                    cursor: isUnlocked ? 'pointer' : 'default',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (isUnlocked) e.currentTarget.style.background = '#111'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none'
                  }}
                >
                  <span style={{ flex: 1 }}>{world.name}</span>
                  <span style={{ color: 'var(--color-accent)', fontSize: '0.9em' }}>
                    {isCleared ? MSG.world.cleared : isUnlocked ? '' : MSG.world.locked}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            onClick={goToTitle}
            style={{
              marginTop: '12px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-dim)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.8em',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ◀　もどる
          </button>
        </DQWindow>
      </div>
    )
  }
  ```

- [ ] **Step 2: TypeScript エラーなし確認**

  ```bash
  npx tsc --noEmit
  ```

  Expected: エラーなし（App.tsx でまだ import していないが型エラーにはならない）

- [ ] **Step 3: Commit**

  ```bash
  git add src/screens/WorldSelectScreen.tsx
  git commit -m "feat: add WorldSelectScreen with lock/unlock world display"
  ```

---

## Task 7: StageSelectScreen.tsx をワールド対応に更新

**Files:**
- Modify: `src/screens/StageSelectScreen.tsx`

変更点：
- `WORD_LIST` 全件ではなく、選択中ワールドの `wordIds` に絞って表示
- 全通常ステージクリア済み かつ そのワールド未クリアなら、ボスステージボタンを表示

- [ ] **Step 1: StageSelectScreen.tsx を以下に書き換える**

  `src/screens/StageSelectScreen.tsx`:

  ```tsx
  import { DQWindow } from '../components/ui/DQWindow'
  import { useGameStore } from '../store/gameStore'
  import { useWorldStore } from '../store/worldStore'
  import { useGoldStore } from '../store/goldStore'
  import { WORD_LIST } from '../data/wordList'
  import { WORLDS, isWorldComplete } from '../config/worlds'
  import { MSG } from '../config/messages'

  export function StageSelectScreen() {
    const { startStage, startBossStage, clearedWords, goToWorldSelect } = useGameStore()
    const { currentWorldId, clearedWorlds } = useWorldStore()
    const gold = useGoldStore((s) => s.gold)

    const world = WORLDS.find((w) => w.id === currentWorldId)
    const worldWords = world
      ? WORD_LIST.filter((e) => world.wordIds.includes(e.id))
      : []

    const allNormalCleared = world ? isWorldComplete(clearedWords, world.wordIds) : false
    const worldAlreadyCleared = clearedWorlds.includes(currentWorldId)
    const showBossStage = allNormalCleared && !worldAlreadyCleared && world?.bossWord

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          background: '#000',
          padding: '16px',
        }}
      >
        <DQWindow style={{ width: '360px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'var(--color-accent)',
              fontSize: '0.9em',
              marginBottom: '12px',
              borderBottom: '1px solid #333',
              paddingBottom: '8px',
            }}
          >
            <span>{world?.name ?? 'ことばをえらぼう'}</span>
            <span>{MSG.goldBalance(gold)}</span>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {worldWords.map((entry) => {
              const bestStar = clearedWords[entry.id] ?? 0
              return (
                <button
                  key={entry.id}
                  onClick={() => startStage(entry)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #1a1a1a',
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '1em',
                    padding: '10px 8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#111')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ fontSize: '1.4em' }}>{entry.hint}</span>
                  <span style={{ flex: 1 }}>{entry.word}</span>
                  <span style={{ color: 'var(--color-accent)', fontSize: '0.8em' }}>
                    {bestStar > 0 ? '★'.repeat(bestStar) + '☆'.repeat(3 - bestStar) : '　　　'}
                  </span>
                </button>
              )
            })}

            {showBossStage && world && (
              <button
                onClick={() => startBossStage(world.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  background: 'none',
                  border: '1px solid var(--color-accent)',
                  borderRadius: '4px',
                  color: 'var(--color-accent)',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '1em',
                  padding: '10px 8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '8px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#111')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <span style={{ fontSize: '1.4em' }}>{world.bossHint}</span>
                <span style={{ flex: 1 }}>{MSG.world.bossLabel(world.bossHint)}</span>
                <span style={{ fontSize: '0.8em' }}>{MSG.world.bossStage}</span>
              </button>
            )}
          </div>

          <button
            onClick={goToWorldSelect}
            style={{
              marginTop: '12px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-dim)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.8em',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ◀　もどる
          </button>
        </DQWindow>
      </div>
    )
  }
  ```

- [ ] **Step 2: StageCompleteScreen の「もどる」がステージ選択に戻ることを確認**

  `src/screens/StageCompleteScreen.tsx` を確認。`goToStageSelect` を呼んでいる箇所はそのままでよい（ワールド内のステージに戻る）。変更不要。

- [ ] **Step 3: TypeScript エラーなし確認**

  ```bash
  npx tsc --noEmit
  ```

  Expected: エラーなし

- [ ] **Step 4: 全テスト確認**

  ```bash
  npx vitest run
  ```

  Expected: 全テスト PASS

- [ ] **Step 5: Commit**

  ```bash
  git add src/screens/StageSelectScreen.tsx
  git commit -m "feat: filter StageSelectScreen by world wordIds and show boss stage when all cleared"
  ```

---

## Task 8: WorldClearScreen.tsx を作成

**Files:**
- Create: `src/screens/WorldClearScreen.tsx`

ロジック：
- マウント時に `worldStore.setClearedWorld(currentWorldId)` を呼んで次ワールドを解放
- 次ワールドが存在すれば解放メッセージ、なければ全クリアメッセージ

- [ ] **Step 1: WorldClearScreen.tsx を作成**

  `src/screens/WorldClearScreen.tsx`:

  ```tsx
  import { useEffect } from 'react'
  import { motion } from 'framer-motion'
  import { DQWindow } from '../components/ui/DQWindow'
  import { useGameStore } from '../store/gameStore'
  import { useWorldStore } from '../store/worldStore'
  import { WORLDS } from '../config/worlds'
  import { MSG } from '../config/messages'

  export function WorldClearScreen() {
    const { goToWorldSelect } = useGameStore()
    const { currentWorldId, setClearedWorld } = useWorldStore()

    const currentIdx = WORLDS.findIndex((w) => w.id === currentWorldId)
    const currentWorld = WORLDS[currentIdx]
    const nextWorld = WORLDS[currentIdx + 1] ?? null

    useEffect(() => {
      setClearedWorld(currentWorldId)
    }, [currentWorldId, setClearedWorld])

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          background: '#000',
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <DQWindow style={{ width: '320px', textAlign: 'center' }}>
            <div
              style={{
                color: 'var(--color-accent)',
                fontSize: '1.4em',
                marginBottom: '16px',
              }}
            >
              {MSG.world.clearTitle}
            </div>

            <div style={{ fontSize: '2.5em', marginBottom: '8px' }}>
              {currentWorld?.bossHint ?? '⭐'}
            </div>

            <div
              style={{
                fontSize: '1em',
                marginBottom: '24px',
                color: 'var(--color-text-dim)',
              }}
            >
              {nextWorld
                ? MSG.world.nextUnlocked(nextWorld.name)
                : MSG.world.lastWorld}
            </div>

            <button
              onClick={goToWorldSelect}
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
              ▶　{MSG.world.backToWorlds}
            </button>
          </DQWindow>
        </motion.div>
      </div>
    )
  }
  ```

- [ ] **Step 2: TypeScript エラーなし確認**

  ```bash
  npx tsc --noEmit
  ```

  Expected: エラーなし

- [ ] **Step 3: Commit**

  ```bash
  git add src/screens/WorldClearScreen.tsx
  git commit -m "feat: add WorldClearScreen with world unlock and next world reveal"
  ```

---

## Task 9: TitleScreen と App.tsx の配線

**Files:**
- Modify: `src/screens/TitleScreen.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: TitleScreen.tsx の「あそぶ」ボタンを `goToWorldSelect` に変更**

  `src/screens/TitleScreen.tsx` の変更点：

  `goToStageSelect` の import を `goToWorldSelect` に変更：

  ```tsx
  import { DQWindow } from '../components/ui/DQWindow'
  import { useGameStore } from '../store/gameStore'

  const MENU_BTN_STYLE = {
    display: 'block',
    width: '100%',
    background: 'none',
    border: 'none',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-pixel)',
    fontSize: '1em',
    padding: '8px',
    cursor: 'pointer',
    textAlign: 'left' as const,
  }

  export function TitleScreen() {
    const goToWorldSelect = useGameStore((s) => s.goToWorldSelect)
    const goToShop        = useGameStore((s) => s.goToShop)
    const goToWardrobe    = useGameStore((s) => s.goToWardrobe)
    const goToSettings    = useGameStore((s) => s.goToSettings)

    const hover = (e: React.MouseEvent<HTMLButtonElement>) =>
      (e.currentTarget.style.color = 'var(--color-accent)')
    const leave = (e: React.MouseEvent<HTMLButtonElement>) =>
      (e.currentTarget.style.color = 'var(--color-text)')

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          background: '#000',
        }}
      >
        <DQWindow style={{ width: '320px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '2em',
              color: 'var(--color-accent)',
              letterSpacing: '4px',
              marginBottom: '8px',
            }}
          >
            かきとり
          </h1>
          <div
            style={{
              fontSize: '1.2em',
              color: 'var(--color-text-dim)',
              marginBottom: '32px',
              letterSpacing: '2px',
            }}
          >
            QUEST
          </div>
          <button style={MENU_BTN_STYLE} onClick={goToWorldSelect} onMouseEnter={hover} onMouseLeave={leave}>
            ▶　あそぶ
          </button>
          <button style={MENU_BTN_STYLE} onClick={goToShop} onMouseEnter={hover} onMouseLeave={leave}>
            　　おみせ
          </button>
          <button style={MENU_BTN_STYLE} onClick={goToWardrobe} onMouseEnter={hover} onMouseLeave={leave}>
            　　そうび
          </button>
          <button style={MENU_BTN_STYLE} onClick={goToSettings} onMouseEnter={hover} onMouseLeave={leave}>
            　　せってい
          </button>
        </DQWindow>
      </div>
    )
  }
  ```

- [ ] **Step 2: App.tsx に新画面のルートを追加**

  `src/App.tsx`:

  ```tsx
  import { useGameStore } from './store/gameStore'
  import { TitleScreen } from './screens/TitleScreen'
  import { WorldSelectScreen } from './screens/WorldSelectScreen'
  import { StageSelectScreen } from './screens/StageSelectScreen'
  import { GameScreen } from './components/game/GameScreen'
  import { StageCompleteScreen } from './screens/StageCompleteScreen'
  import { GameOverScreen } from './screens/GameOverScreen'
  import { SettingsScreen } from './screens/SettingsScreen'
  import { ShopScreen } from './screens/ShopScreen'
  import { WardrobeScreen } from './screens/WardrobeScreen'
  import { WorldClearScreen } from './screens/WorldClearScreen'

  export default function App() {
    const screen = useGameStore((s) => s.screen)

    switch (screen) {
      case 'title':         return <TitleScreen />
      case 'world-select':  return <WorldSelectScreen />
      case 'stageSelect':   return <StageSelectScreen />
      case 'game':          return <GameScreen />
      case 'stageComplete': return <StageCompleteScreen />
      case 'gameOver':      return <GameOverScreen />
      case 'settings':      return <SettingsScreen />
      case 'shop':          return <ShopScreen />
      case 'wardrobe':      return <WardrobeScreen />
      case 'world-clear':   return <WorldClearScreen />
      default:              return <TitleScreen />
    }
  }
  ```

- [ ] **Step 3: TypeScript エラーなし確認**

  ```bash
  npx tsc --noEmit
  ```

  Expected: エラーなし

- [ ] **Step 4: 全テスト確認**

  ```bash
  npx vitest run
  ```

  Expected: 全テスト PASS

- [ ] **Step 5: ビルド確認**

  ```bash
  npm run build
  ```

  Expected: ビルド成功（dist/ に出力）

- [ ] **Step 6: Commit**

  ```bash
  git add src/screens/TitleScreen.tsx src/App.tsx
  git commit -m "feat: wire up world-select and world-clear routes; update TitleScreen play button"
  ```

---

## Self-Review

### Spec Coverage チェック

| 仕様要件 | 対応タスク |
|---|---|
| ワールド選択画面（WorldSelectScreen） | Task 6 |
| ロック🔒 / クリア済み★ 表示 | Task 6 |
| StageSelectScreen のワールドフィルタ | Task 7 |
| ボスステージ出現（全通常ステージクリア後） | Task 7 |
| ボス戦（GameScreen 流用、isBossStage=true） | Task 5 |
| ワールドクリア画面（WorldClearScreen） | Task 8 |
| 次ワールド解放（setClearedWorld） | Task 8 |
| WorldConfig / WORLDS データ | Task 2 |
| worldStore（clearedWorlds, currentWorldId） | Task 3 |
| WordEntry.id フィールド追加 | Task 1 |
| 1年生ワールド 19語追加 | Task 1 |
| ボス単語: かみなり ⚡ | Task 2 |
| 「あそぶ」→ world-select 遷移 | Task 9 |
| Screen 型拡張 | Task 4 |

スコープ外（Phase 5）：BGM、ボスアニメ、タイム計測、星数進捗、AES-GCM チート対策 → 対応なし（正しい）

### Placeholder チェック

- TBD / TODO なし ✓
- 全タスクに実際のコードブロックあり ✓
- "similar to Task N" なし ✓

### 型一貫性チェック

- `WordEntry.id: string` → Task 1 で定義、Task 7 で `entry.id` を参照 ✓
- `WorldConfig.wordIds: string[]` → Task 2 で定義、Task 7 で `world.wordIds` を参照 ✓
- `isWorldComplete(clearedWords, wordIds)` → Task 2 で定義、Task 7 で import ✓
- `startBossStage(worldId: string)` → Task 5 で定義、Task 7 で呼び出し ✓
- `goToWorldSelect()` → Task 5 で定義、Task 6・7・8 で呼び出し ✓
- `useWorldStore.currentWorldId` → Task 3 で定義、Task 7・8 で参照 ✓
- `Screen: 'world-select' | 'world-clear'` → Task 4 で定義、Task 5・9 で使用 ✓
