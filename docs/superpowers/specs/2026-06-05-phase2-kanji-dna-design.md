# Phase 2: 漢字DNA クリーチャー生成 — 設計ドキュメント

## 概要

漢字のストロークデータから「DNA変数」を抽出し、5種族のSVGクリーチャーを手続き型生成する。同じ単語からは常に同じクリーチャーが生成される。熟語ステージでは全文字のDNAを合成して1体の敵を生成し、文字をクリアするごとに敵のHPが減っていく。

バリアントシステムは Phase 3 以降に持ち越す。

---

## ゲームフローの変化

### 現行（Phase 1）
- 1文字 = 1バトル、文字ごとに別の敵（kakitori レンダリング＋CSS歪み）
- ステージ = 複数バトルの連続

### Phase 2 以降
```
ステージ開始
  → 単語内の全文字のDNAを取得・合成
  → 1体のクリーチャーSVGを生成
  → バトル画面に敵HPバー付きで表示（HP = 100%）

1文字クリア
  → 敵HP が 1/総文字数 ぶん減少（アニメーション）
  → プレイヤーのミスは従来通りハート消費

全文字クリア
  → 敵HP = 0 → ステージクリア
```

---

## DNA抽出（`src/logic/kanjiDna.ts`）

### データソース

hanzi-writer-data の JSON を CDN から取得：
```
https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/{char}.json
```

取得済みデータ（kakitori 書き取りエリアとは独立してフェッチ）。

### 抽出する変数

| 変数 | 型 | 計算方法 |
|---|---|---|
| `strokeCount` | `number` | `strokes.length` |
| `hRatio` | `number` 0〜1 | `medians` から各画の主方向を判定（`|dx| > |dy|` の画の割合） |
| `curvature` | `number` 0〜1 | 各 median の始点〜終点の直線からの平均逸脱量を正規化 |
| `symmetry` | `number` 0〜1 | 全 median 座標の X 軸対称度（1 = 完全対称） |
| `hue` | `number` 0〜359 | `charCode % 360` |

```typescript
export interface KanjiDNA {
  strokeCount: number
  hRatio: number
  curvature: number
  symmetry: number
  hue: number
}
```

### 複数文字の合成

熟語ステージでは各文字のDNAを以下のルールで1つに合成する：

| 変数 | 集約方法 | 意図 |
|---|---|---|
| `strokeCount` | 合計 | 複雑な熟語ほど大型・強力なクリーチャーになる |
| `hRatio` | 平均 | 全文字の体型傾向を反映 |
| `curvature` | 最大値 | 最もトゲのある文字の特性が支配的になる |
| `symmetry` | 最小値 | 非対称な文字が1つでも混じると敵も非対称になる |
| `hue` | 先頭文字の `charCode % 360` | 代表色は先頭文字で固定 |

---

## 種族システム（`src/logic/creatureGenerator.ts`）

### 種族決定

```typescript
const wordHash = word.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
const species = (dna.strokeCount + Math.round(dna.hRatio * 10) + wordHash) % 5
```

DNAだけでなく単語のcharCodeハッシュを加えることで、構造的に類似した漢字・熟語の組み合わせ（例：「三」と「一二」はどちらも横画3本でDNAがほぼ同じ）でも別種族に振り分けられる。同じ単語からは常に同じ種族が生成される一貫性は保たれる。

### 5種族の定義

各種族は同じDNA変数（strokeCount / hRatio / curvature / symmetry / hue）を受け取るが、体の構造・要素の使い方が完全に異なる。

| 種族 | 名称 | 体の構造 | DNA変数の使い方 |
|---|---|---|---|
| 0 | 二足歩行 | 頭・胴・腕・脚 | 画数→腕の対数(1〜3)、横率→胴の縦横比、曲率→腕の曲がり、対称度→ツノ/尻尾 |
| 1 | スライム | 不定形ボディ＋ドロップ | 画数→ドロップ数、曲率→輪郭の凹凸、横率→横への広がり |
| 2 | 触手眼 | 中央の大きな眼＋放射触手 | 画数→触手本数、曲率→触手のうねり、対称度→眼の大きさ |
| 3 | 四足獣 | 横向き獣型 | 画数→脚の本数(4 or 6)、対称度→尻尾の長さ、曲率→背骨の反り |
| 4 | 浮遊体 | 球体＋羽根＋下触手 | 画数→下触手本数、横率→羽根の幅、曲率→羽根の反り |

### 色の決定

全種族共通：`hsl(hue, 72%, 52%)` をベースに明暗2色を派生させてグラデーションや輪郭に使用。アクセントカラーは `(hue + 180) % 360`（補色）。

### 出力型

```typescript
export interface CreatureSpec {
  species: number
  dna: KanjiDNA
  svgString: string  // 120×120 の SVG 文字列
}
```

生成はピュアな関数（副作用なし）。同じ `KanjiDNA` を渡せば常に同じ `svgString` が返る。

---

## 敵HPバー

### 計算

```typescript
// currentCharIndex: 現在書いている文字のインデックス（0始まり）
// word.length: 単語の文字数
const enemyHpRatio = (word.length - currentCharIndex) / word.length
```

| タイミング | HP表示 |
|---|---|
| ステージ開始 | 100% |
| 山田の「山」クリア後 | 50% |
| 山田の「田」クリア後 | 0%（ステージクリア） |

1文字クリア時にアニメーションで減少。既存の `currentCharIndex`（`StageProgress` に存在）をそのまま利用する。

---

## ファイル変更一覧

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `src/logic/kanjiDna.ts` | 新規 | DNA抽出・複数文字合成 |
| `src/logic/creatureGenerator.ts` | 新規 | 5種族SVG生成 |
| `src/types/game.ts` | 変更 | `KanjiDNA`・`CreatureSpec` 型追加 |
| `src/components/game/EnemyDisplay.tsx` | 変更 | kakitori.render() をSVGクリーチャー表示に差し替え |
| `src/components/game/BattleStage.tsx` | 変更 | 敵HPバー追加 |
| `src/components/game/GameScreen.tsx` | 変更 | ステージ開始時にクリーチャーを事前生成・保持 |

---

## 対象外（Phase 3 以降）

- バリアント（色違い強化版）
- 敵の攻撃アニメーション
- ステージクリア時の演出強化
- 部首データを使った種族拡張
- クリーチャー出現演出（「魔法で漢字が魔物に変えられた」テイストのトランスフォームアニメーション）
