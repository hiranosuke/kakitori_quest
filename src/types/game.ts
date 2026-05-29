// 画面識別子
export type Screen =
  | 'title'
  | 'stageSelect'
  | 'game'
  | 'stageComplete'
  | 'gameOver'

// 書き取りエリアの位置
export type WritingAreaPosition = 'right' | 'left' | 'bottom'

// とめ/はね/はらい の種別
export type EndingType = 'tome' | 'hane' | 'harai'

// 1画ぶんのとめ/はね/はらい結果
export interface StrokeEndingResult {
  strokeIndex: number
  detectedEnding: EndingType
  isCorrect: boolean
}

// 崩れ文字スタイル（将来の拡張用差し込み口）
export type CorruptionStyle = 'default' | 'fire' | 'shadow' | 'shattered'

// 敵エンティティ
export interface Enemy {
  char: string
  corruptionStyle: CorruptionStyle
}

// ステージ1語ぶんの進捗
export interface StageProgress {
  word: string
  currentCharIndex: number
  hearts: number
  endingResults: StrokeEndingResult[]
}

// ストアの永続化対象
export interface SaveData {
  clearedWords: Record<string, number>  // word -> best star count (1-3)
  writingAreaPosition: WritingAreaPosition
}

// バトルフェーズの状態
export type BattlePhase = 'writing' | 'battling' | 'won' | 'lost'
