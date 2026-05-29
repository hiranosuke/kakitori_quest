export interface WordEntry {
  word: string     // ひらがな
  reading: string  // 同じ（将来漢字が入るときに分離）
  hint: string     // 画面表示用の意味ヒント（例: "🐕"）
}

export const WORD_LIST: WordEntry[] = [
  // 2文字
  { word: 'いぬ', reading: 'いぬ', hint: '🐕' },
  { word: 'ねこ', reading: 'ねこ', hint: '🐈' },
  { word: 'うみ', reading: 'うみ', hint: '🌊' },
  { word: 'やま', reading: 'やま', hint: '⛰️' },
  { word: 'かわ', reading: 'かわ', hint: '🏞️' },
  { word: 'はな', reading: 'はな', hint: '🌸' },
  { word: 'そら', reading: 'そら', hint: '🌤️' },
  { word: 'ほし', reading: 'ほし', hint: '⭐' },
  { word: 'つき', reading: 'つき', hint: '🌙' },
  { word: 'かぜ', reading: 'かぜ', hint: '💨' },
  { word: 'あめ', reading: 'あめ', hint: '🌧️' },
  { word: 'ゆき', reading: 'ゆき', hint: '❄️' },
  { word: 'ひ',   reading: 'ひ',   hint: '🔥' },
  { word: 'みず', reading: 'みず', hint: '💧' },
  { word: 'きの', reading: 'きの', hint: '🌳' },
  { word: 'とり', reading: 'とり', hint: '🐦' },
  { word: 'さな', reading: 'さな', hint: '🐟' },
  { word: 'むし', reading: 'むし', hint: '🐛' },
  // 3文字
  { word: 'さくら', reading: 'さくら', hint: '🌸🌸' },
  { word: 'かめ',   reading: 'かめ',   hint: '🐢' },
  { word: 'うさぎ', reading: 'うさぎ', hint: '🐰' },
  { word: 'くも',   reading: 'くも',   hint: '☁️' },
  { word: 'たいよ', reading: 'たいよ', hint: '☀️' },
  { word: 'なみ',   reading: 'なみ',   hint: '🌊🌊' },
  { word: 'もり',   reading: 'もり',   hint: '🌲🌲' },
  { word: 'いけ',   reading: 'いけ',   hint: '🪷' },
  { word: 'いわ',   reading: 'いわ',   hint: '🪨' },
  { word: 'しろ',   reading: 'しろ',   hint: '🏰' },
  { word: 'はし',   reading: 'はし',   hint: '🌉' },
  { word: 'みち',   reading: 'みち',   hint: '🛤️' },
  // 4文字
  { word: 'たいよう', reading: 'たいよう', hint: '☀️☀️' },
  { word: 'むらさき', reading: 'むらさき', hint: '💜' },
  { word: 'あおぞら', reading: 'あおぞら', hint: '🔵🌤️' },
  { word: 'こうのり', reading: 'こうのり', hint: '🦢' },
]
