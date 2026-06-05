# Phase 2 ポリッシュ設計書

日付: 2026-06-05
対象ブランチ: feature/phase2

## 概要

Phase 2 の手動検証後に得られたフィードバックをもとに、マージ前に対応するバグ修正・UX改善・機能追加をまとめた仕様。

---

## スコープ

### 今回対応（本仕様書の対象）

1. HPバー表示バグ修正
2. 敵名の種族ベース命名
3. プレイヤー仮勇者アバター追加
4. HPバー視認性改善
5. GitHub Issue 作成（3件）

### Issue化して後フェーズに回すもの

- 運筆ミスのダメージタイミング統一（即時判定 → 終端判定タイミングに遅延）
- 敵の攻撃アクション演出
- クリーチャーのモンスター感強化

---

## 1. HPバー表示バグ修正

### 問題

`BattleStage.tsx` の先読みロジックが `battlePhase === 'feedback'` 全体に適用されているため、負け判定時でも HP が `-1` 先読みされ、勝っていないのに敵HPが 0 になるケースが発生する。

### 修正方針

```ts
// 現在（バグあり）
const isResolved = battlePhase === 'battling' || battlePhase === 'feedback' || battlePhase === 'won'

// 修正後
const isResolved =
  battlePhase === 'battling' ||
  (battlePhase === 'feedback' && battleResult === 'win') ||
  battlePhase === 'won'
```

`battleResult === 'win'` の場合のみ先読みする。

---

## 2. 敵名の種族ベース命名

### 命名ルール

`selectSpecies()` が返す種族番号（0〜4）に対して接頭語または接尾語を定義し、元単語と組み合わせて敵名を生成する。

| 種族番号 | 種族 | 命名パターン | 例（元単語: かたつむり） |
|----------|------|--------------|--------------------------|
| 0 | Biped | `${word}マン` | かたつむりマン |
| 1 | Slime | `${word}ののろい` | かたつむりののろい |
| 2 | EyeTentacle | `${word}アイ` | かたつむりアイ |
| 3 | Beast | `${word}のけもの` | かたつむりのけもの |
| 4 | Orb | `そらとぶ${word}` | そらとぶかたつむり |

### 実装

- `creatureGenerator.ts` に `generateCreatureName(species: number, word: string): string` 関数を追加
- `generateCreature()` の戻り値 `CreatureSpec` に `name: string` フィールドを追加
- `gameStore.ts` に `creatureName: string | null` を追加（セッション限りのメモリ内状態、localStorage非永続化）
- `GameScreen.tsx` でクリーチャー生成時に `setCreatureName()` を呼び出す
- `BattleStage.tsx` でバー上の敵名表示を `creatureName` から取得するよう変更

### 将来性

クリーチャー生成は決定論的（同じ単語 → 同じ種族 → 同じ名前）なので、将来の図鑑機能では `clearedWords` の単語一覧からオンデマンドに名前・SVGを再生成できる。追加ストレージ不要。

---

## 3. プレイヤー仮勇者アバター

### 概要

バトル画面右側の `CharacterDisplay`（書いている文字）を `HeroDisplay` コンポーネント（固定SVG勇者）に差し替える。文字ごとに自キャラが変化する違和感を解消し、一貫したプレイヤーアイデンティティを確立する。

### コンポーネント仕様

- 新規: `src/components/game/HeroDisplay.tsx`
- シンプルなドット絵風SVG（ドラクエ的人型シルエット）
- サイズ: 120×120px（EnemyDisplayと揃える）
- アニメーション（framer-motion使用）:
  - 勝ち（`battlePhase === 'won'` または `battleResult === 'win'`）: 上に跳ねる
  - 負け（`battleResult === 'lose'`）: 左右に揺れる（ダメージ演出）

### BattleStage の変更

```tsx
// 変更前
<CharacterDisplay char={char} accuracy={accuracy} visible={...} />

// 変更後
<HeroDisplay battlePhase={battlePhase} battleResult={battleResult} />
```

---

## 4. HPバー視認性改善

- HPバーの高さ: 8px → 12px
- 敵名のフォントサイズ: `0.65em` → `0.75em`
- HPバーの境界線を少し明るく（視認性向上）

---

## 5. GitHub Issue 作成

以下の3件を GitHub Issue として記録する。

### Issue 1: 運筆ミスのダメージタイミング統一

**概要**: 現在、運筆ミスは即時でハートが減るが、終端判定と同じタイミングにまとめたい。
**制約**: 運筆ミスはパーセンテージではなく、絶対ミスとしてカウントする。
**対象コンポーネント**: WritingArea, battleLogic, gameStore

### Issue 2: 敵の攻撃アクション演出

**概要**: 終端判定で負けた際に、敵キャラクターが攻撃するアニメーションを追加したい。
**現状**: 負け時はテキストメッセージのみ。
**優先度**: Phase 3以降

### Issue 3: クリーチャーのモンスター感強化

**概要**: 現在のクリーチャーが可愛らしすぎる。もう少し威圧感・モンスター感のある見た目にしたい。
**対象**: `creatureGenerator.ts` の各species描画関数
**優先度**: Phase 3以降
