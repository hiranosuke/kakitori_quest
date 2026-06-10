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

export function isBossCleared(
  clearedWords: Record<string, number>,
  worldId: string,
): boolean {
  return (clearedWords[`boss-${worldId}`] ?? 0) > 0
}

export function isWorldUnlocked(
  clearedWords: Record<string, number>,
  worlds: WorldConfig[],
  idx: number,
): boolean {
  if (idx === 0) return true
  return isBossCleared(clearedWords, worlds[idx - 1].id)
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
    wordIds: ['海', '星', '馬', '春', '電車'],
    bossWord: 'しんりんのとり',
    bossHint: '🐦',
  },
  {
    id: 'grade3',
    name: '3ねんせいワールド',
    wordIds: ['島', '橋', '旅', '薬', '荷物'],
    bossWord: '大海原',
    bossHint: '🌊',
  },
  {
    id: 'grade4',
    name: '4ねんせいワールド',
    wordIds: ['熊', '梅', '松', '巣', '航海'],
    bossWord: '大熊座',
    bossHint: '🐻',
  },
  {
    id: 'grade5',
    name: '5ねんせいワールド',
    wordIds: ['夢', '桜', '演技', '豊', '布団'],
    bossWord: '夢幻の桜',
    bossHint: '🌸',
  },
  {
    id: 'grade6',
    name: '6ねんせいワールド',
    wordIds: ['宇宙', '誕生', '宝', '骨', '幕'],
    bossWord: '宇宙の宝',
    bossHint: '🌌',
  },
]
