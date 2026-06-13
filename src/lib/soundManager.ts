// src/lib/soundManager.ts
import { SOUND_SPECS, ATTACK_SEC, type SoundId } from '../config/sounds'

let ctx: AudioContext | null = null
let muted = false

const SILENT = 0.0001

function getCtx(): AudioContext | null {
  if (ctx) return ctx
  const Ctor =
    (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  return ctx
}

export function setMuted(value: boolean): void {
  muted = value
}

export function play(id: SoundId): void {
  if (muted) return
  const audio = getCtx()
  if (!audio) return
  if (audio.state === 'suspended') audio.resume?.()

  const now = audio.currentTime
  for (const note of SOUND_SPECS[id]) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    const t0 = now + note.start
    const t1 = t0 + note.duration

    osc.type = note.type
    osc.frequency.setValueAtTime(note.freq, t0)
    if (note.freqEnd !== undefined) {
      osc.frequency.linearRampToValueAtTime(note.freqEnd, t1)
    }

    // クリック音を避けるための簡易ADエンベロープ
    gain.gain.setValueAtTime(SILENT, t0)
    gain.gain.exponentialRampToValueAtTime(note.gain, t0 + ATTACK_SEC)
    gain.gain.exponentialRampToValueAtTime(SILENT, t1)

    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start(t0)
    osc.stop(t1)
  }
}
