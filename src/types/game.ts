// 画面識別子
export type Screen =
  | 'title'
  | 'stageSelect'
  | 'game'
  | 'stageComplete'
  | 'gameOver'
  | 'settings'

// 書き取りエリアの位置
export type WritingAreaPosition = 'auto' | 'right' | 'left' | 'bottom'

// とめ/はね/はらい の種別
export type EndingType = 'tome' | 'hane' | 'harai'

// 1画ぶんのとめ/はね/はらい結果
//
// kakitori API (@k1low/kakitori) の CharStrokeData.strokeEnding の実態:
//   - correct: boolean        → 検出タイプが expected list に含まれるか
//   - expected: StrokeEndingType[] | undefined → 設定された期待タイプ
//   - confidence: number      → 確信度 [0, 1]
//   - velocityProfile: "decelerating" | "constant" | "accelerating"
//   - actualEndDirection: [number, number] | null
//
// ※ 「検出されたタイプ」を直接返すフィールドは存在しない。
//   velocityProfile で tome(decelerating) / harai(accelerating) を推定可能。
//   isCorrect は kakitori の correct: boolean をそのまま使う。
//   mistake カウントは onMistake コールバックの mistakesOnStroke / totalMistakes を参照する。
export interface StrokeEndingResult {
  strokeIndex: number
  // kakitori は検出タイプを直接公開しないため velocityProfile から推定
  // "decelerating" → tome, "accelerating" → harai, "constant" → hane (近似)
  detectedEnding: EndingType | null
  // kakitori StrokeEndingResult.correct: boolean をそのまま格納
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
