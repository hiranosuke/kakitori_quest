# Phase 5-B 音声フィードバック 設計仕様

## 概要

Web Audio API を用いてゲーム内効果音（SE）を実装する。音声ファイルは使用せず、すべてコードで合成する。BGMは対象外。

---

## アーキテクチャ

### soundManager モジュール

**ファイル:** `src/lib/soundManager.ts`

シングルトンモジュール。最初の `play()` 呼び出し時に `AudioContext` を遅延初期化する（ブラウザのオートプレイポリシー対応）。

公開 API:

```ts
type SoundId =
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

function play(id: SoundId): void
function setMuted(muted: boolean): void
```

- `play()` はミュート中は即 return する
- 各音は独立した一時的な `OscillatorNode` / `GainNode` を生成して鳴らし、再生後に自動破棄する
- AudioContext は 1 インスタンスのみ使い回す

---

## 音の設計（10種）

| SoundId | 場面 | 音のイメージ | 実装方針 |
|---|---|---|---|
| `correct_stroke` | 画の正解 | 短い上昇トーン（ピッ） | sine 波、440→660Hz、0.1s |
| `mistake` | 画のミス | 低い下降トーン（ブッ） | sawtooth 波、220→110Hz、0.15s |
| `char_complete` | 1文字完成 | 明るい和音（ジャン） | sine 波 3音同時、0.4s |
| `battle_lose` | バトル負け・HP消費 | 重い失敗音 | triangle 波、180→80Hz、0.4s |
| `stage_clear` | ステージクリア | 上昇メロディ | sine 波 4音順次、計0.8s |
| `item_use` | アイテム使用 | キラキラ音 | sine 波 高音連打、0.3s |
| `shop_buy` | ショップ購入 | コイン音 | sine 波 2音、800→1200Hz、0.2s |
| `battle_start` | 通常バトル開始 | 短いドラム | noise burst + gain envelope、0.2s |
| `boss_start` | ボス戦開始 | 重い警告音 | sawtooth 低音 + tremolo、0.6s |
| `boss_clear` | ボス戦クリア | 勝利ファンファーレ | sine 波 5音上昇、計1.2s |

---

## 呼び出し箇所

| ファイル | SoundId | タイミング |
|---|---|---|
| `src/components/game/BattleStage.tsx` | `battle_start` | バトル開始時（phase が writing に入った直後） |
| `src/components/game/BattleStage.tsx` | `boss_start` | ボス戦バトル開始時 |
| `src/components/game/BattleStage.tsx` | `correct_stroke` | kakitori の onCorrectStroke コールバック |
| `src/components/game/BattleStage.tsx` | `mistake` | kakitori の onMistake コールバック |
| `src/components/game/BattleStage.tsx` | `char_complete` | バトル勝利確定時（phase: battling → won） |
| `src/components/game/BattleStage.tsx` | `battle_lose` | バトル敗北確定時（phase: battling → lost） |
| `src/components/game/BattleStage.tsx` | `boss_clear` | ボス戦勝利確定時 |
| `src/screens/GameScreen.tsx` | `stage_clear` | ステージクリア画面表示時 |
| `src/screens/ShopScreen.tsx` | `shop_buy` | 購入成功時 |
| `src/store/gameStore.ts` または呼び出し元 | `item_use` | かいふくやく使用時 |

---

## ボス判定

既存コードで現在のワールドがボスかどうかを判定する仕組みを確認し、`isBossWord` フラグを BattleStage に渡す（または store から参照する）。`boss_start` / `boss_clear` はこのフラグで通常音と切り替える。

---

## ミュート

- `soundManager.setMuted(true/false)` を公開
- 初期値は unmuted
- 将来の設定画面から呼び出せる口として用意するが、今フェーズでは UI 実装は行わない

---

## テスト方針

- `soundManager` 単体は Web Audio API をモックして、`play()` が正しい SoundId で呼ばれるかを確認
- コンポーネントテストは既存のものを維持し、音声呼び出しのアサーションは追加しない（過剰テスト防止）

---

## 対象外

- BGM
- 音量調整 UI（ミュートのみ将来対応口を用意）
- 音声ファイル（mp3/ogg）の使用
