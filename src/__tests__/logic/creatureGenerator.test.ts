import { describe, it, expect } from 'vitest'
import { generateCreature, generateCreatureName, selectSpecies } from '../../logic/creatureGenerator'
import type { KanjiDNA } from '../../types/game'

const base: KanjiDNA = { strokeCount: 5, hRatio: 0.5, curvature: 0.3, symmetry: 0.8, hue: 120 }

describe('generateCreature', () => {
  it('同じDNA・単語から常に同じSVGを返す（決定的）', () => {
    expect(generateCreature(base, '花').svgString).toBe(generateCreature(base, '花').svgString)
  })

  it('有効なSVG文字列を返す', () => {
    const { svgString } = generateCreature(base, '花')
    expect(svgString).toMatch(/^<svg/)
    expect(svgString).toContain('</svg>')
  })

  it('species は 0〜4 の範囲', () => {
    for (let i = 0; i < 20; i++) {
      const dna: KanjiDNA = { ...base, strokeCount: i + 1 }
      const { species } = generateCreature(dna, `word${i}`)
      expect(species).toBeGreaterThanOrEqual(0)
      expect(species).toBeLessThanOrEqual(4)
    }
  })

  it('dna と species を CreatureSpec として返す', () => {
    const spec = generateCreature(base, '花')
    expect(spec.dna).toEqual(base)
    expect(typeof spec.species).toBe('number')
  })
})

describe('generateCreatureName', () => {
  it('種族0(Biped)は「XXマン」を返す', () => {
    expect(generateCreatureName(0, 'ゆ')).toBe('「ゆ」マン')
  })
  it('種族1(Slime)は「XXののろい」を返す', () => {
    expect(generateCreatureName(1, 'ゆ')).toBe('「ゆ」ののろい')
  })
  it('種族2(EyeTentacle)は「XXアイ」を返す', () => {
    expect(generateCreatureName(2, 'ゆ')).toBe('「ゆ」アイ')
  })
  it('種族3(Beast)は「XXのけもの」を返す', () => {
    expect(generateCreatureName(3, 'ゆ')).toBe('「ゆ」のけもの')
  })
  it('種族4(Orb)は「そらとぶXX」を返す', () => {
    expect(generateCreatureName(4, 'ゆ')).toBe('そらとぶ「ゆ」')
  })
  it('generateCreature の戻り値に name フィールドが含まれる', () => {
    const spec = generateCreature(base, 'ゆ')
    expect(typeof spec.name).toBe('string')
    expect(spec.name.length).toBeGreaterThan(0)
  })
})

describe('selectSpecies', () => {
  it('「三」と「一二」は同画数でも別種族', () => {
    // 三: wordHash=19977, (3+10+19977)%5=0
    const dna三: KanjiDNA = { strokeCount: 3, hRatio: 0.95, curvature: 0.05, symmetry: 0.95, hue: 177 }
    // 一二: wordHash=40076, (3+10+40076)%5=4
    const dna一二: KanjiDNA = { strokeCount: 3, hRatio: 1.0, curvature: 0.05, symmetry: 1.0, hue: 168 }
    expect(selectSpecies(dna三, '三')).toBe(0)
    expect(selectSpecies(dna一二, '一二')).toBe(4)
    expect(selectSpecies(dna三, '三')).not.toBe(selectSpecies(dna一二, '一二'))
  })
})
