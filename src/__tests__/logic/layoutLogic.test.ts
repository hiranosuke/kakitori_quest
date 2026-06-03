import { describe, it, expect } from 'vitest'
import { getEffectiveLayout } from '../../logic/layoutLogic'

describe('getEffectiveLayout', () => {
  it("'auto' + 横長 → 'right' を返す", () => {
    expect(getEffectiveLayout('auto', true)).toBe('right')
  })

  it("'auto' + 縦長 → 'bottom' を返す", () => {
    expect(getEffectiveLayout('auto', false)).toBe('bottom')
  })

  it("'left' は isLandscape に関わらず 'left' を返す", () => {
    expect(getEffectiveLayout('left', true)).toBe('left')
    expect(getEffectiveLayout('left', false)).toBe('left')
  })

  it("'right' は isLandscape に関わらず 'right' を返す", () => {
    expect(getEffectiveLayout('right', true)).toBe('right')
    expect(getEffectiveLayout('right', false)).toBe('right')
  })

  it("'bottom' は isLandscape に関わらず 'bottom' を返す", () => {
    expect(getEffectiveLayout('bottom', true)).toBe('bottom')
    expect(getEffectiveLayout('bottom', false)).toBe('bottom')
  })
})
