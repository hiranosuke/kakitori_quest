import type { StrokeEndingResult, EndingType } from '../types/game'

const ENDING_JA: Record<EndingType, string> = {
  tome: 'とめ',
  hane: 'はね',
  harai: 'はらい',
}

export function buildStrokeFeedback(results: StrokeEndingResult[]): string | null {
  const incorrects = results.filter((r) => !r.isCorrect)
  if (incorrects.length === 0) return null

  const messages: string[] = []
  for (const r of incorrects) {
    // detectedEnding が expectedEndings に含まれる場合はスキップ（「Xではなく X」を避ける）
    if (r.detectedEnding !== null && r.expectedEndings.includes(r.detectedEnding)) continue

    if (r.detectedEnding !== null) {
      const detected = ENDING_JA[r.detectedEnding]
      const firstExpected = r.expectedEndings[0]
      if (firstExpected) {
        messages.push(`${r.strokeIndex + 1}かくめ：${detected}ではなく${ENDING_JA[firstExpected]}にしましょう`)
      } else {
        messages.push(`${r.strokeIndex + 1}かくめ：${detected}になっています`)
      }
    } else {
      // velocityProfile が取得できず detectedEnding 不明な場合のフォールバック
      const firstExpected = r.expectedEndings[0]
      if (firstExpected) {
        messages.push(`${r.strokeIndex + 1}かくめ：${ENDING_JA[firstExpected]}を確かめよう`)
      } else {
        messages.push(`${r.strokeIndex + 1}かくめ：かき方を確かめよう`)
      }
    }
  }

  return messages.length > 0 ? messages.join('\n') : null
}
