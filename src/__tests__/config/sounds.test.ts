// src/__tests__/config/sounds.test.ts
import { describe, it, expect } from 'vitest'
import { SOUND_SPECS, SOUND_IDS } from '../../config/sounds'

describe('SOUND_SPECS', () => {
  it('11種すべての SoundId に非空の spec が定義されている', () => {
    expect(SOUND_IDS).toHaveLength(11)
    for (const id of SOUND_IDS) {
      const spec = SOUND_SPECS[id]
      expect(spec, `spec for ${id}`).toBeDefined()
      expect(spec.length, `notes for ${id}`).toBeGreaterThan(0)
    }
  })

  it('各 Note は正の周波数・長さと有効な波形を持つ', () => {
    const valid = ['sine', 'square', 'sawtooth', 'triangle']
    for (const id of SOUND_IDS) {
      for (const note of SOUND_SPECS[id]) {
        expect(note.freq).toBeGreaterThan(0)
        expect(note.duration).toBeGreaterThan(0)
        expect(note.start).toBeGreaterThanOrEqual(0)
        expect(valid).toContain(note.type)
      }
    }
  })
})
