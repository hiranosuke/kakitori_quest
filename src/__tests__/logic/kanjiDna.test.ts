import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { KanjiDNA } from '../../types/game'
import { extractDNA, combineDNA, fetchWordDNA } from '../../logic/kanjiDna'

const straightH: number[][][] = [[[0, 0], [50, 0], [100, 0]]]
const straightV: number[][][] = [[[0, 0], [0, 50], [0, 100]]]
const curved: number[][][] = [[[0, 0], [50, 50], [100, 0]]]

describe('extractDNA', () => {
  it('横画のみ → hRatio=1', () => {
    expect(extractDNA('一', { strokes: ['M0 0'], medians: straightH }).hRatio).toBe(1)
  })

  it('縦画のみ → hRatio=0', () => {
    expect(extractDNA('丨', { strokes: ['M0 0'], medians: straightV }).hRatio).toBe(0)
  })

  it('横縦1本ずつ → hRatio=0.5', () => {
    expect(
      extractDNA('十', { strokes: ['M0 0', 'M0 0'], medians: [...straightH, ...straightV] }).hRatio
    ).toBe(0.5)
  })

  it('直線 → curvature=0', () => {
    expect(extractDNA('一', { strokes: ['M0 0'], medians: straightH }).curvature).toBe(0)
  })

  it('弧画 → curvature>0', () => {
    expect(extractDNA('弧', { strokes: ['M0 0'], medians: curved }).curvature).toBeGreaterThan(0)
  })

  it('strokeCount は画数と一致', () => {
    expect(
      extractDNA('二', { strokes: ['M0 0', 'M0 0'], medians: [...straightH, ...straightH] }).strokeCount
    ).toBe(2)
  })

  it('hue は charCode % 360', () => {
    expect(extractDNA('山', { strokes: ['M0 0'], medians: straightV }).hue).toBe('山'.codePointAt(0)! % 360)
  })
})

describe('combineDNA', () => {
  const d1: KanjiDNA = { strokeCount: 3, hRatio: 0.9, curvature: 0.1, symmetry: 0.9, hue: 0 }
  const d2: KanjiDNA = { strokeCount: 2, hRatio: 0.6, curvature: 0.5, symmetry: 0.7, hue: 100 }

  it('strokeCount は合計', () => { expect(combineDNA([d1, d2]).strokeCount).toBe(5) })
  it('hRatio は平均', () => { expect(combineDNA([d1, d2]).hRatio).toBeCloseTo(0.75) })
  it('curvature は最大値', () => { expect(combineDNA([d1, d2]).curvature).toBe(0.5) })
  it('symmetry は最小値', () => { expect(combineDNA([d1, d2]).symmetry).toBe(0.7) })
  it('hue は先頭 DNA の値', () => { expect(combineDNA([d1, d2]).hue).toBe(0) })
  it('1要素の場合はそのまま返す', () => { expect(combineDNA([d1])).toEqual(d1) })
})

const mockData = {
  strokes: ['M0 0', 'M0 0'],
  medians: [[[0, 0], [50, 0], [100, 0]], [[0, 0], [0, 50], [0, 100]]],
}

describe('fetchWordDNA', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockData),
    }))
  })
  afterEach(() => { vi.unstubAllGlobals() })

  it('1文字: strokeCount=2, hRatio=0.5', async () => {
    const dna = await fetchWordDNA('山')
    expect(dna.strokeCount).toBe(2)
    expect(dna.hRatio).toBe(0.5)
  })

  it('2文字: strokeCount は合計(4)', async () => {
    expect((await fetchWordDNA('山田')).strokeCount).toBe(4)
  })

  it('fetch が失敗した場合フォールバックDNAを返す', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const dna = await fetchWordDNA('山')
    expect(dna.strokeCount).toBe(4)
    expect(dna.hRatio).toBe(0.5)
  })
})
