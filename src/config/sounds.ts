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
  | 'game_over'

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
  'game_over',
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
  // ゲームオーバー: 優しめの下降アルペジオ G4→E4→C4（子供向けに角の立たない triangle）
  game_over: [
    { type: 'triangle', freq: 392, start: 0, duration: 0.25, gain: 0.3 },
    { type: 'triangle', freq: 329.63, start: 0.25, duration: 0.25, gain: 0.3 },
    { type: 'triangle', freq: 261.63, start: 0.5, duration: 0.5, gain: 0.3 },
  ],
}
