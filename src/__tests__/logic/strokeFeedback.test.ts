import { describe, it, expect } from 'vitest'
import { buildStrokeFeedback } from '../../logic/strokeFeedback'
import type { StrokeEndingResult, EndingType } from '../../types/game'

const makeResult = (
  strokeIndex: number,
  isCorrect: boolean,
  detectedEnding: StrokeEndingResult['detectedEnding'] = null,
  expectedEndings: EndingType[] = [],
): StrokeEndingResult => ({ strokeIndex, isCorrect, detectedEnding, expectedEndings })

describe('buildStrokeFeedback', () => {
  it('全画正解なら null を返す', () => {
    const results = [makeResult(0, true, 'tome'), makeResult(1, true, 'harai')]
    expect(buildStrokeFeedback(results)).toBeNull()
  })

  it('不正解がなければ null を返す', () => {
    expect(buildStrokeFeedback([])).toBeNull()
  })

  it('1画不正解（tome 検出）のメッセージを返す', () => {
    const results = [makeResult(0, true, 'tome'), makeResult(1, false, 'tome')]
    expect(buildStrokeFeedback(results)).toBe('2かくめ：とめになっています')
  })

  it('harai 検出のメッセージを返す', () => {
    const results = [makeResult(0, false, 'harai')]
    expect(buildStrokeFeedback(results)).toBe('1かくめ：はらいになっています')
  })

  it('hane 検出のメッセージを返す', () => {
    const results = [makeResult(0, false, 'hane')]
    expect(buildStrokeFeedback(results)).toBe('1かくめ：はねになっています')
  })

  it('複数の不正解を改行で結合して返す', () => {
    const results = [
      makeResult(0, false, 'tome'),
      makeResult(1, true, 'harai'),
      makeResult(2, false, 'hane'),
    ]
    expect(buildStrokeFeedback(results)).toBe(
      '1かくめ：とめになっています\n3かくめ：はねになっています',
    )
  })

  it('detectedEnding が null の不正解はフォールバックメッセージを返す', () => {
    const results = [makeResult(0, false, null), makeResult(1, false, 'tome')]
    expect(buildStrokeFeedback(results)).toBe(
      '1かくめ：かき方を確かめよう\n2かくめ：とめになっています',
    )
  })

  it('全画 detectedEnding が null の場合もフォールバックメッセージを返す', () => {
    const results = [makeResult(0, false, null), makeResult(1, false, null)]
    expect(buildStrokeFeedback(results)).toBe(
      '1かくめ：かき方を確かめよう\n2かくめ：かき方を確かめよう',
    )
  })

  it('detectedEnding が null かつ expectedEndings あればそれを使ったフォールバックを返す', () => {
    const results = [makeResult(0, false, null, ['tome'])]
    expect(buildStrokeFeedback(results)).toBe('1かくめ：とめを確かめよう')
  })

  it('expectedEndings がある場合は「ではなく〇〇にしましょう」形式を返す', () => {
    const results = [makeResult(0, false, 'harai', ['tome'])]
    expect(buildStrokeFeedback(results)).toBe('1かくめ：はらいではなくとめにしましょう')
  })

  it('expectedEndings が複数ある場合は最初の1つを使う', () => {
    const results = [makeResult(0, false, 'hane', ['tome', 'harai'])]
    expect(buildStrokeFeedback(results)).toBe('1かくめ：はねではなくとめにしましょう')
  })

  it('expectedEndings が空の場合は「になっています」フォールバックを返す', () => {
    const results = [makeResult(0, false, 'tome', [])]
    expect(buildStrokeFeedback(results)).toBe('1かくめ：とめになっています')
  })

  it('複数不正解で expectedEndings あり・なし混在を処理する', () => {
    const results = [
      makeResult(0, false, 'harai', ['tome']),
      makeResult(1, true, 'tome'),
      makeResult(2, false, 'hane', []),
    ]
    expect(buildStrokeFeedback(results)).toBe(
      '1かくめ：はらいではなくとめにしましょう\n3かくめ：はねになっています',
    )
  })

  it('detectedEnding が expectedEndings に含まれる場合はスキップする（X ではなく X は表示しない）', () => {
    const results = [makeResult(0, false, 'hane', ['hane'])]
    expect(buildStrokeFeedback(results)).toBeNull()
  })

  it('detectedEnding が expectedEndings の一部に含まれる場合のみスキップする', () => {
    const results = [
      makeResult(0, false, 'hane', ['hane', 'tome']),
      makeResult(1, false, 'harai', ['hane', 'tome']),
    ]
    expect(buildStrokeFeedback(results)).toBe('2かくめ：はらいではなくはねにしましょう')
  })
})
