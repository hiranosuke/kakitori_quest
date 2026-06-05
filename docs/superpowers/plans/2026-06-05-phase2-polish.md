# Phase 2 ポリッシュ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phase 2 手動検証フィードバックに基づき、HPバー表示バグ修正・種族ベース敵命名・プレイヤー勇者アバター追加・HP視認性改善を行い、feature/phase2 を main にマージする。

**Architecture:** `creatureGenerator.ts` に命名関数を追加して `CreatureSpec` に `name` フィールドを持たせ、store 経由で `BattleStage` に渡す。`CharacterDisplay` を新規 `HeroDisplay`（固定SVG勇者）に差し替え。HPバーの先読みロジックを `battleResult === 'win'` 限定に修正。

**Tech Stack:** TypeScript, React 19, Zustand 5, Vitest, framer-motion, SVG

**作業ディレクトリ:** `.worktrees/feature-phase2/`（すべてのパスはこのディレクトリ起点）

---

### Task 1: generateCreatureName 追加 + CreatureSpec 型更新

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/logic/creatureGenerator.ts`
- Modify: `src/__tests__/logic/creatureGenerator.test.ts`

- [ ] **Step 1: テストを書く**

`src/__tests__/logic/creatureGenerator.test.ts` の末尾に追加：

```typescript
import { generateCreature, generateCreatureName, selectSpecies } from '../../logic/creatureGenerator'
```

（既存の import 行 `import { generateCreature, selectSpecies }` を上記に置き換える）

ファイル末尾に追加：

```typescript
describe('generateCreatureName', () => {
  it('種族0(Biped)は「XXマン」を返す', () => {
    expect(generateCreatureName(0, 'ゆ')).toBe('ゆマン')
  })
  it('種族1(Slime)は「XXののろい」を返す', () => {
    expect(generateCreatureName(1, 'ゆ')).toBe('ゆののろい')
  })
  it('種族2(EyeTentacle)は「XXアイ」を返す', () => {
    expect(generateCreatureName(2, 'ゆ')).toBe('ゆアイ')
  })
  it('種族3(Beast)は「XXのけもの」を返す', () => {
    expect(generateCreatureName(3, 'ゆ')).toBe('ゆのけもの')
  })
  it('種族4(Orb)は「そらとぶXX」を返す', () => {
    expect(generateCreatureName(4, 'ゆ')).toBe('そらとぶゆ')
  })
  it('generateCreature の戻り値に name フィールドが含まれる', () => {
    const spec = generateCreature(base, 'ゆ')
    expect(typeof spec.name).toBe('string')
    expect(spec.name.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- --reporter=verbose 2>&1 | grep -A3 "generateCreatureName"
```

期待: `generateCreatureName is not a function` などのエラー

- [ ] **Step 3: `CreatureSpec` 型に `name` フィールドを追加**

`src/types/game.ts` の `CreatureSpec` インターフェースを更新：

```typescript
// クリーチャー生成結果
export interface CreatureSpec {
  species: number       // 種族 0〜4
  dna: KanjiDNA
  svgString: string     // 120×120 の SVG 文字列
  name: string          // 種族+元単語から生成した敵名
}
```

- [ ] **Step 4: `generateCreatureName` と更新した `generateCreature` を実装**

`src/logic/creatureGenerator.ts` の末尾（`selectSpecies` の後）に追加・変更：

```typescript
const SPECIES_NAME_FN: ((word: string) => string)[] = [
  (word) => `${word}マン`,
  (word) => `${word}ののろい`,
  (word) => `${word}アイ`,
  (word) => `${word}のけもの`,
  (word) => `そらとぶ${word}`,
]

export function generateCreatureName(species: number, word: string): string {
  return SPECIES_NAME_FN[species](word)
}

export function generateCreature(dna: KanjiDNA, word: string): CreatureSpec {
  const species = selectSpecies(dna, word)
  const svgString = GENERATORS[species](dna)
  const name = generateCreatureName(species, word)
  return { species, dna, svgString, name }
}
```

（既存の `generateCreature` 関数を上記で置き換える）

- [ ] **Step 5: テストが通ることを確認**

```bash
npm test -- --reporter=verbose 2>&1 | grep -E "PASS|FAIL|generateCreatureName"
```

期待: 全テスト PASS

- [ ] **Step 6: コミット**

```bash
git add src/types/game.ts src/logic/creatureGenerator.ts src/__tests__/logic/creatureGenerator.test.ts
git commit -m "feat: add generateCreatureName with species-based naming"
```

---

### Task 2: store に creatureName を追加

**Files:**
- Modify: `src/store/gameStore.ts`

- [ ] **Step 1: `GameStore` インターフェースに `creatureName` を追加**

`src/store/gameStore.ts` の `GameStore` インターフェース内、`creatureSvg: string | null` の下に追加：

```typescript
  creatureName: string | null

  // アクション: クリーチャー
  setCreatureSvg: (svg: string) => void
  setCreatureName: (name: string) => void
```

（既存の `setCreatureSvg` 宣言行は残し、その下に `setCreatureName` を追加する）

- [ ] **Step 2: 初期値と実装を追加**

`create<GameStore>()` 内の `stageCounter: 0, creatureSvg: null,` の行を：

```typescript
      stageCounter: 0,
      creatureSvg: null,
      creatureName: null,
```

に変更。

`setCreatureSvg: (svg) => set({ creatureSvg: svg }),` の下に追加：

```typescript
      setCreatureName: (name) => set({ creatureName: name }),
```

また `startStage` アクション内の `creatureSvg: null,` の下に追加：

```typescript
          creatureName: null,
```

- [ ] **Step 3: ビルドエラーがないことを確認**

```bash
npx tsc --noEmit 2>&1 | head -20
```

期待: 出力なし（エラーなし）

- [ ] **Step 4: コミット**

```bash
git add src/store/gameStore.ts
git commit -m "feat: add creatureName to game store"
```

---

### Task 3: GameScreen でクリーチャー名を生成・保存

**Files:**
- Modify: `src/components/game/GameScreen.tsx`

- [ ] **Step 1: `setCreatureName` をストアから取得**

`GameScreen.tsx` の `useGameStore()` 分割代入に `setCreatureName` を追加：

```typescript
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
  } = useGameStore()
```

- [ ] **Step 2: `useEffect` 内でクリーチャー名もセット**

既存の `useEffect` を以下で置き換える：

```typescript
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
        }
      })

    return () => { cancelled = true }
  }, [stageCounter]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 3: ビルドエラーがないことを確認**

```bash
npx tsc --noEmit 2>&1 | head -20
```

期待: 出力なし

- [ ] **Step 4: コミット**

```bash
git add src/components/game/GameScreen.tsx
git commit -m "feat: set creature name in GameScreen on stage start"
```

---

### Task 4: BattleStage — HPバグ修正 + 敵名更新

**Files:**
- Modify: `src/components/game/BattleStage.tsx`

- [ ] **Step 1: `battleResult` と `creatureName` をストアから取得**

`BattleStage.tsx` の `useGameStore()` 分割代入を更新：

```typescript
  const {
    currentEntry,
    currentCharIndex,
    battlePhase,
    battleResult,
    endingResults,
    battleMessage,
    creatureName,
    setBattleFeedback,
    confirmBattle,
  } = useGameStore()
```

- [ ] **Step 2: HP先読みロジックを修正**

```typescript
  // 変更前
  const isResolved = battlePhase === 'battling' || battlePhase === 'feedback' || battlePhase === 'won'

  // 変更後（battleResult === 'win' の時のみ先読みする）
  const isResolved =
    battlePhase === 'battling' ||
    (battlePhase === 'feedback' && battleResult === 'win') ||
    battlePhase === 'won'
```

- [ ] **Step 3: HPバーヘッダーの敵名を `creatureName` に変更、バー高さを改善**

HPバーの `<div>` ブロック（`display: 'flex', alignItems: 'center'` の部分）を置き換える：

```tsx
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
```

- [ ] **Step 4: ビルドエラーがないことを確認**

```bash
npx tsc --noEmit 2>&1 | head -20
```

期待: 出力なし

- [ ] **Step 5: テストが通ることを確認**

```bash
npm test 2>&1 | tail -5
```

期待: `X passed` のみ（failed なし）

- [ ] **Step 6: コミット**

```bash
git add src/components/game/BattleStage.tsx
git commit -m "fix: correct HP lookahead to win-only, update enemy name display"
```

---

### Task 5: HeroDisplay コンポーネント作成

**Files:**
- Create: `src/components/game/HeroDisplay.tsx`

- [ ] **Step 1: `HeroDisplay.tsx` を作成する**

`src/components/game/HeroDisplay.tsx` を新規作成：

```tsx
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

// ドット絵風 RPG 勇者 SVG（24×24 グリッド → 120×120px）
const HERO_SVG = `<svg width="120" height="120" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="2" width="8" height="4" fill="#e8a020"/>
  <rect x="7" y="5" width="10" height="8" fill="#f5c99a"/>
  <rect x="9" y="8" width="2" height="2" fill="#3a3a3a"/>
  <rect x="13" y="8" width="2" height="2" fill="#3a3a3a"/>
  <rect x="6" y="13" width="12" height="6" fill="#4169e1"/>
  <rect x="3" y="13" width="3" height="5" fill="#4169e1"/>
  <rect x="18" y="13" width="3" height="5" fill="#4169e1"/>
  <rect x="1" y="14" width="3" height="5" rx="1" fill="#8b6914"/>
  <rect x="2" y="15" width="1" height="3" fill="#d4a017"/>
  <rect x="21" y="4" width="2" height="10" fill="#c0c0c0"/>
  <rect x="19" y="13" width="6" height="2" fill="#8b6914"/>
  <rect x="6" y="19" width="12" height="2" fill="#8b6914"/>
  <rect x="7" y="21" width="4" height="3" fill="#2c52b3"/>
  <rect x="13" y="21" width="4" height="3" fill="#2c52b3"/>
</svg>`

export function HeroDisplay() {
  const { battlePhase, battleResult } = useGameStore()

  const animate =
    battlePhase === 'won' || (battlePhase === 'feedback' && battleResult === 'win')
      ? { y: [0, -12, 0], transition: { duration: 0.4 } }
      : battlePhase === 'feedback' && battleResult === 'lose'
        ? { x: [-6, 6, -6, 6, 0], transition: { duration: 0.4 } }
        : {}

  return (
    <motion.div
      animate={animate}
      style={{ display: 'inline-block', lineHeight: 1, width: 120, height: 120 }}
      dangerouslySetInnerHTML={{ __html: HERO_SVG }}
    />
  )
}
```

- [ ] **Step 2: ビルドエラーがないことを確認**

```bash
npx tsc --noEmit 2>&1 | head -20
```

期待: 出力なし

- [ ] **Step 3: コミット**

```bash
git add src/components/game/HeroDisplay.tsx
git commit -m "feat: add HeroDisplay placeholder avatar for player character"
```

---

### Task 6: BattleStage で CharacterDisplay を HeroDisplay に差し替え

**Files:**
- Modify: `src/components/game/BattleStage.tsx`

- [ ] **Step 1: import を更新する**

`BattleStage.tsx` の import 部分で `CharacterDisplay` を `HeroDisplay` に変更し、`calculateAccuracy` のみ削除する（`buildStrokeFeedback` は MessageWindow の detail prop で引き続き使うため残す）：

```typescript
// 変更前
import { calculateAccuracy } from '../../logic/accuracyLogic'
import { buildStrokeFeedback } from '../../logic/strokeFeedback'
import { CharacterDisplay } from './CharacterDisplay'

// 変更後（calculateAccuracy と CharacterDisplay の import を削除し HeroDisplay を追加）
import { buildStrokeFeedback } from '../../logic/strokeFeedback'
import { HeroDisplay } from './HeroDisplay'
```

- [ ] **Step 2: `accuracy` 変数のみ削除する**

`BattleStage` 関数内の以下の1行を削除（`strokeFeedback` は残す）：

```typescript
// 削除する
const accuracy = calculateAccuracy(endingResults)
```

- [ ] **Step 3: JSX 内の `CharacterDisplay` を `HeroDisplay` に差し替える**

```tsx
        {/* 変更前 */}
        <motion.div
          animate={
            battlePhase === 'battling'
              ? { x: [-4, 4, -4, 0], transition: { duration: 0.4 } }
              : {}
          }
        >
          <CharacterDisplay
            char={char}
            accuracy={accuracy}
            visible={battlePhase === 'battling' || battlePhase === 'won' || battlePhase === 'feedback'}
          />
        </motion.div>
```

```tsx
        {/* 変更後 */}
        <HeroDisplay />
```

- [ ] **Step 4: `MessageWindow` の `detail` prop はそのまま残す**

`strokeFeedback` はまだ有効なのでそのまま：

```tsx
      <MessageWindow
        message={battleMessage}
        detail={
          battlePhase === 'battling' || battlePhase === 'feedback'
            ? strokeFeedback ?? undefined
            : undefined
        }
      />
```

- [ ] **Step 5: ビルドエラーがないことを確認**

```bash
npx tsc --noEmit 2>&1 | head -20
```

期待: 出力なし

- [ ] **Step 6: 全テストが通ることを確認**

```bash
npm test 2>&1 | tail -5
```

期待: 全テスト PASS（failed なし）

- [ ] **Step 7: ビルドが通ることを確認**

```bash
npm run build 2>&1 | tail -10
```

期待: `built in XXXms` のみ（エラーなし）

- [ ] **Step 8: コミット**

```bash
git add src/components/game/BattleStage.tsx
git commit -m "feat: replace CharacterDisplay with HeroDisplay in BattleStage"
```

---

### Task 7: GitHub Issue 作成

**Files:** なし（GitHub操作のみ）

- [ ] **Step 1: 運筆ミスのダメージタイミング Issue**

```bash
gh issue create \
  --title "運筆ミスのダメージタイミングを終端判定に統一する" \
  --body "## 概要
現在、運筆ミスが発生すると即時でハートが減る。
終端判定（文字完了時）と同じタイミングにまとめることでフィードバックを整理したい。

## 要件
- 運筆ミスはパーセンテージではなく、絶対ミスとしてカウントする
- ダメージは文字完了（終端判定）のタイミングで適用する
- 改修対象: WritingArea, battleLogic, gameStore

## 背景
Phase 2 手動検証フィードバックより。
改修が独立しているため Phase 3 以降で対応。"
```

- [ ] **Step 2: 敵の攻撃アクション Issue**

```bash
gh issue create \
  --title "終端判定で負けた際に敵の攻撃アニメーションを追加する" \
  --body "## 概要
バトルで負けた時（終端判定ミス）、現在はメッセージテキストのみで表現されている。
敵キャラクターが攻撃するアニメーションを追加してフィードバックを強化したい。

## 要件
- 敵（EnemyDisplay）が勇者（HeroDisplay）に向かって動くアニメーション
- 勇者がダメージを受けるリアクション（フラッシュ等）
- 改修対象: BattleStage, EnemyDisplay, HeroDisplay

## 背景
Phase 2 手動検証フィードバックより。Phase 3 以降で対応。"
```

- [ ] **Step 3: クリーチャーのモンスター感強化 Issue**

```bash
gh issue create \
  --title "クリーチャーのビジュアルをよりモンスターらしくする" \
  --body "## 概要
現在の手続き型SVGクリーチャーが全体的に可愛らしすぎる。
子供向けゲームとして適度な迫力・モンスター感を追加したい。

## 要件
- 各種族（Biped, Slime, EyeTentacle, Beast, Orb）のSVG描画を改善
- ゲームの対象年齢（小学生）に合った威圧感
- 改修対象: src/logic/creatureGenerator.ts の各 generate* 関数

## 背景
Phase 2 手動検証フィードバックより。Phase 3 以降でデザイン検討。"
```

---

### Task 8: 動作確認とmainへのマージ

**Files:** なし（git操作のみ）

- [ ] **Step 1: 全テスト・ビルドの最終確認**

```bash
npm test 2>&1 | tail -5 && npm run build 2>&1 | tail -5
```

期待: 全テスト PASS かつビルド成功

- [ ] **Step 2: dev サーバーで手動確認**

```bash
npm run dev
```

ブラウザで確認する項目：
- ステージ選択→バトル開始時に種族名が表示される（例: 「かたつむりのけもの」）
- 左側にSVGクリーチャー、右側に勇者アバターが表示される
- バトルで勝った時：勇者が跳ねる、HPバーが減る
- バトルで負けた時：勇者が揺れる、HPバーが変化しない
- 全文字クリア時：HPバーが0になる（負け判定時には0にならない）
- 確認後 Ctrl+C でサーバー停止

- [ ] **Step 3: main ブランチにマージ**

（`.worktrees/feature-phase2/` ではなく、メインリポジトリで実行）

```bash
cd /Users/hiranyu1/repo/kakitori_quest
git merge --no-ff feature/phase2 -m "feat: Phase 2 — kanji DNA creature generation with polish

- Procedural 5-species SVG creature generation from kanji stroke DNA
- Species-based enemy naming (マン/ののろい/アイ/のけもの/そらとぶ)
- Hero avatar replacing character display in battle screen
- HP bar with lookahead fix (win-only) and improved visibility
- Enemy HP bar with color-coded progress indicator"
```

- [ ] **Step 4: worktree とブランチを削除**

```bash
git worktree remove .worktrees/feature-phase2
git branch -d feature/phase2
```

- [ ] **Step 5: マージ後のビルド確認**

```bash
npm run build 2>&1 | tail -5
```

期待: ビルド成功
