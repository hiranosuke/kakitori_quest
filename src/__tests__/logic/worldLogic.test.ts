import { describe, it, expect } from 'vitest'
import { isWorldComplete, isBossCleared, isWorldUnlocked, WORLDS } from '../../config/worlds'

describe('isWorldComplete', () => {
  it('全単語がクリア済みのとき true を返す', () => {
    const clearedWords = { 'あめ': 2, 'いぬ': 1, 'うし': 3 }
    const wordIds = ['あめ', 'いぬ', 'うし']
    expect(isWorldComplete(clearedWords, wordIds)).toBe(true)
  })

  it('未クリアの単語があるとき false を返す', () => {
    const clearedWords = { 'あめ': 2, 'いぬ': 0 }
    const wordIds = ['あめ', 'いぬ', 'うし']
    expect(isWorldComplete(clearedWords, wordIds)).toBe(false)
  })

  it('clearedWords に存在しない単語は未クリアとみなす', () => {
    const clearedWords = { 'あめ': 1 }
    const wordIds = ['あめ', 'いぬ']
    expect(isWorldComplete(clearedWords, wordIds)).toBe(false)
  })

  it('星が 0 の単語は未クリアとみなす', () => {
    const clearedWords = { 'あめ': 0, 'いぬ': 1 }
    const wordIds = ['あめ', 'いぬ']
    expect(isWorldComplete(clearedWords, wordIds)).toBe(false)
  })

  it('wordIds が空のとき true を返す（ボスのみワールド想定）', () => {
    expect(isWorldComplete({}, [])).toBe(true)
  })
})

describe('isBossCleared', () => {
  it('boss-grade1 キーが 1 以上のとき true を返す', () => {
    expect(isBossCleared({ 'boss-grade1': 1 }, 'grade1')).toBe(true)
  })

  it('boss-grade1 キーがないとき false を返す', () => {
    expect(isBossCleared({}, 'grade1')).toBe(false)
  })

  it('boss-grade1 が 0 のとき false を返す', () => {
    expect(isBossCleared({ 'boss-grade1': 0 }, 'grade1')).toBe(false)
  })
})

describe('isWorldUnlocked', () => {
  it('最初のワールド（idx=0）は常に解放済み', () => {
    expect(isWorldUnlocked({}, WORLDS, 0)).toBe(true)
  })

  it('前のワールドのボスが未撃破なら解放されない', () => {
    expect(isWorldUnlocked({}, WORLDS, 1)).toBe(false)
  })

  it('前のワールドのボスを倒していれば解放される', () => {
    expect(isWorldUnlocked({ 'boss-grade1': 1 }, WORLDS, 1)).toBe(true)
  })
})
