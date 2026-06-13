// src/__tests__/lib/soundManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SOUND_IDS } from '../../config/sounds'

// --- AudioContext モック ---
function makeParam() {
  return {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
}
function makeOscillator() {
  return {
    type: 'sine',
    frequency: makeParam(),
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }
}
function makeGain() {
  return { gain: makeParam(), connect: vi.fn() }
}

let ctorCount = 0
let lastCtx: any
function installAudioMock() {
  ctorCount = 0
  lastCtx = undefined
  class FakeAudioContext {
    currentTime = 0
    state = 'running'
    destination = {}
    resume = vi.fn()
    createOscillator = vi.fn(() => makeOscillator())
    createGain = vi.fn(() => makeGain())
    constructor() {
      ctorCount++
      lastCtx = this
    }
  }
  ;(globalThis as any).AudioContext = FakeAudioContext
  ;(globalThis as any).webkitAudioContext = FakeAudioContext
}

async function freshManager() {
  vi.resetModules()
  installAudioMock()
  return await import('../../lib/soundManager')
}

describe('soundManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AudioContext を遅延生成し、複数回 play しても1つだけ使い回す', async () => {
    const sm = await freshManager()
    expect(ctorCount).toBe(0) // import だけでは生成しない
    sm.play('correct_stroke')
    sm.play('mistake')
    expect(ctorCount).toBe(1)
  })

  it('ミュート中は音を生成しない', async () => {
    const sm = await freshManager()
    sm.setMuted(true)
    sm.play('correct_stroke')
    expect(ctorCount).toBe(0)
    expect(lastCtx).toBeUndefined()
  })

  it('setMuted(false) で再び鳴る', async () => {
    const sm = await freshManager()
    sm.setMuted(true)
    sm.play('correct_stroke')
    sm.setMuted(false)
    sm.play('correct_stroke')
    expect(lastCtx.createOscillator).toHaveBeenCalled()
  })

  it('全 SoundId が例外なく再生でき、spec の音数ぶん oscillator を生成する', async () => {
    const sm = await freshManager()
    for (const id of SOUND_IDS) {
      expect(() => sm.play(id)).not.toThrow()
    }
    // 少なくとも SoundId 数ぶんは生成されている
    expect(lastCtx.createOscillator.mock.calls.length).toBeGreaterThanOrEqual(SOUND_IDS.length)
  })
})
