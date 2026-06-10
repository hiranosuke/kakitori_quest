# Phase 4 設計書：学年ワールド構造

作成日: 2026-06-09

## 概要

学年別のワールド構造を導入し、「1ねんせいワールドをクリアした」という達成感でモチベーションを高める。
全ステージクリア後にワールドボスが出現し、倒すとワールドクリアとなって次のワールドが解放される。

---

## 1. ワールド構成

| ワールド | 内容 | 単語数 |
|---|---|---|
| 1ねんせいワールド | 全ひらがな46音 ＋ 小1配当漢字（一部）| 約75語 |
| 2ねんせいワールド | 小2配当漢字（160字の一部） | 約10語 |
| 3ねんせいワールド | 小3配当漢字（200字の一部） | 約10語 |
| 4ねんせいワールド | 小4配当漢字（202字の一部） | 約10語 |
| 5ねんせいワールド | 小5配当漢字（193字の一部） | 約10語 |
| 6ねんせいワールド | 小6配当漢字（191字の一部） | 約10語 |

**単語キュレーション方針：**
- [kanjiapi.dev](https://kanjiapi.dev/) の `GET /v1/kanji/grade-{n}` で各学年の配当漢字リストを取得
- その範囲内の漢字のみを使った単語を選定（その学年以下の漢字のみ使用）
- 子どもが親しみやすい具体的な単語を優先

---

## 2. 画面遷移

```
タイトル
  └─ あそぶ
       └─ ワールド選択画面（NEW: WorldSelectScreen）
            ├─ 1ねんせいワールド（最初から解放）
            ├─ 2ねんせいワールド（ロック🔒 → 1年生ワールドクリアで解放）
            ├─ ...
            └─ 6ねんせいワールド（ロック🔒）
                  └─（ワールドを選択）
                        └─ ステージ選択画面（既存、そのワールドの単語のみ表示）
                              ├─（通常ステージ）→ バトル → ステージクリア
                              └─（全ステージクリア後）ボスステージが出現
                                    └─ ボス戦（GameScreen流用、isBossStage=true）
                                          └─ ワールドクリア画面（NEW: WorldClearScreen）
                                                └─ 次のワールドが解放
```

**ロック解除条件：** 前のワールドのボスを倒す（`clearedWorlds` に追加）

---

## 3. 単語リスト

### 3-1. 1ねんせいワールド（既存55語 ＋ 追加語）

**現在の既存語（55語）はそのまま1ねんせいワールドに配置する。**

追加語（カバーしていないひらがなを補う）：

| 追加語 | よみ | ヒント | カバーするひらがな |
|---|---|---|---|
| けむし | けむし | 🐛 | け |
| しか | しか | 🦌 | し |
| すずめ | すずめ | 🐦 | す |
| せみ | せみ | 🦗 | せ |
| ちょうちょ | ちょうちょ | 🦋 | ち |
| つる | つる | 🦢 | つ |
| とり | とり | 🐦 | と |
| なし | なし | 🍐 | な |
| にわとり | にわとり | 🐓 | に |
| ぬいぐるみ | ぬいぐるみ | 🧸 | ぬ |
| のはら | のはら | 🌾 | の |
| ふね | ふね | ⛵ | ふ |
| へび | へび | 🐍 | へ |
| ほたる | ほたる | 🌟 | ほ |
| まめ | まめ | 🫘 | ま |
| もも | もも | 🍑 | も |
| よる | よる | 🌙 | よ |
| れんこん | れんこん | 🪷 | れ・ん |
| ろうそく | ろうそく | 🕯️ | ろ |

※ 「を」「ん」は語頭に立たないため単語での網羅は対象外。

**ボス単語：** `かみなり`（4文字）⚡

### 3-2. 2〜6ねんせいワールド

各ワールド5語で実装済み（kanjiapi.dev の配当漢字リストを参照してキュレーション）。

| ワールド | 単語 | ボス単語 |
|---|---|---|
| 2年生 | 海・星・馬・春・電車 | しんりんのとり 🐦（7文字） |
| 3年生 | 島・橋・旅・薬・荷物 | 大海原 🌊 |
| 4年生 | 熊・梅・松・巣・航海 | 大熊座 🐻 |
| 5年生 | 夢・桜・演技・豊・布団 | 夢幻の桜 🌸 |
| 6年生 | 宇宙・誕生・宝・骨・幕 | 宇宙の宝 🌌 |

---

## 4. データ設計

> **実装注記（2026-06-10）:** 設計時から変更があった点を `[実装]` で注記する。

### 新規ファイル

**`src/config/worlds.ts`**
```ts
export interface WorldConfig {
  id: string           // 'grade1', 'grade2', ...
  name: string         // '1ねんせいワールド'
  wordIds: string[]    // WORD_LIST の id を参照
  bossWord: string     // ボス単語（ひらがな or 漢字）
  bossHint: string     // ボスの絵文字ヒント
}

export const WORLDS: WorldConfig[] = [ ... ]
```

**[実装] `src/store/worldStore.ts` は作成しなかった。**
設計時は独立した worldStore を想定していたが、実装中に React の `useEffect` 依存による競合状態（ボスを倒してもワールド2が解放されないバグ）が判明した。
根本原因は `clearedWorlds` 配列を別ストアで管理することによる更新タイミングのズレであったため、**worldStore を廃止し、状態を gameStore に統合した**。

変更後の設計：
| 項目 | 設計 | 実装 |
|---|---|---|
| ワールドクリア記録 | `worldStore.clearedWorlds: string[]` | `gameStore.clearedWords['boss-{worldId}'] = 1` |
| 現在ワールドID | `worldStore.currentWorldId: string` | `gameStore.currentWorldId: string` |
| ワールド選択操作 | `worldStore.setCurrentWorld()` | `gameStore.setCurrentWorld()` |

`clearedWords` は既存の単語クリア記録（`Record<string, number>`）をそのまま流用。ボス撃破キーを `'boss-grade1'` のように名前空間で区別する。

**`src/config/worlds.ts` に追加されたヘルパー関数：**
```ts
export function isBossCleared(clearedWords: Record<string, number>, worldId: string): boolean
export function isWorldUnlocked(clearedWords: Record<string, number>, worlds: WorldConfig[], idx: number): boolean
```
worldStore 廃止に伴い、解放判定ロジックをデータ層（worlds.ts）に持たせた。

### id の設計方針

`WordEntry.id` と `WorldConfig.wordIds` の id は**単語文字列そのもの**を使う。

| 種別 | id の値 | 例 |
|---|---|---|
| ひらがな語 | ひらがな文字列 | `'あめ'`, `'いぬ'` |
| 漢字1文字 | 漢字文字 | `'海'`, `'山'` |
| 漢字複合語 | 漢字語全体 | `'火山'`, `'天気'` |

読みをベースにすると異なる漢字で同じ読みが衝突する（例：`くも`=「雲」と「蜘蛛」）。文字列そのものを id にすることで一意性が保証される。

### 既存ファイルの変更

| ファイル | 変更内容 |
|---|---|
| `src/data/wordList.ts` | 各 WordEntry に `id: string` フィールドを追加、追加語を追記 |
| `src/types/game.ts` | Screen 型に `'world-select'` と `'world-clear'` を追加 |
| `src/store/gameStore.ts` | `isBossStage: boolean`・`currentWorldId: string`・`startBossStage()`・`goToWorldSelect()`・`goToWorldClear()`・`setCurrentWorld()` を追加（worldStore 統合分含む） |
| `src/screens/TitleScreen.tsx` | 「あそぶ」ボタンの遷移先を `'world-select'` に変更 |
| `src/screens/StageSelectScreen.tsx` | 選択中ワールドの wordIds のみ表示・ボスステージ出現ロジック追加 |
| `src/App.tsx` | `'world-select'` と `'world-clear'` のルート追加 |

### 新規画面

| ファイル | 役割 |
|---|---|
| `src/screens/WorldSelectScreen.tsx` | ワールド一覧（クリア済み★・未解放🔒の表示） |
| `src/screens/WorldClearScreen.tsx` | ワールドクリア演出・次ワールド解放メッセージ |

---

## 5. ボス戦の仕組み

- **トリガー：** そのワールドの全通常ステージをクリアすると、StageSelectScreen にボスステージが出現
- **バトル：** 既存の GameScreen をそのまま使用。`gameStore.isBossStage = true` のとき：
  - 敵の見た目をボス専用SVGに変更（既存 creatureGenerator とは別の固定デザイン）
  - 書く単語は `worlds.ts` の `bossWord`
- **クリア後：** GameScreen の勝利判定から WorldClearScreen へ遷移
- **ワールド完了：** `gameStore.onBattleWin` でボス撃破時に即座に `clearedWords['boss-{worldId}'] = 1` をセット（WorldClearScreen ではなく gameStore 内で完結）

**[実装] ボス専用SVGは未実装。** 設計では「敵の見た目をボス専用SVGに変更」としていたが、Phase 4 スコープでは見送り。ボス戦は通常の creatureGenerator が生成した敵SVGをそのまま使用する。専用演出は Phase 5 以降のスコープ（Issue #15）。

---

## 6. スコープ外（Phase 5 以降）

- ワールドごとのBGM・背景演出
- ボスの攻撃アニメーション
- ワールドクリアタイム計測・ランキング
- 部分クリア（星の数での進捗表示）
- AES-GCM チート対策
