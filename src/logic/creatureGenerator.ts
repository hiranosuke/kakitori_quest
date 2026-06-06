import type { KanjiDNA, CreatureSpec } from '../types/game'

const f = (n: number) => n.toFixed(1)
const wrap = (parts: string[]) =>
  `<svg width="120" height="120" viewBox="0 0 120 120">${parts.join('')}</svg>`

function colors(hue: number) {
  return {
    main: `hsl(${hue},72%,52%)`,
    dark: `hsl(${hue},72%,32%)`,
    light: `hsl(${hue},72%,72%)`,
    accent: `hsl(${(hue + 180) % 360},80%,60%)`,
  }
}

function spikePolygon(
  cx: number, cy: number, rx: number, ry: number,
  n: number, sym: number, fill: string, stroke: string,
): string {
  let pts = ''
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2
    const outer = i % 2 === 0
    const s = outer ? 1.2 : 0.78
    const xs = sym < 0.5 && Math.cos(a) < 0 ? 0.65 : 1.0
    pts += `${f(cx + Math.cos(a) * rx * s * xs)},${f(cy + Math.sin(a) * ry * s)} `
  }
  return `<polygon points="${pts.trim()}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`
}

// ── 種族 0: 二足歩行 ──────────────────────────────────────────
function generateBiped(dna: KanjiDNA): string {
  const { strokeCount: sc, hRatio, curvature, symmetry, hue } = dna
  const c = colors(hue)
  const scale = Math.min(0.65 + sc * 0.015, 0.95)
  const cx = 60, bodyCy = 70
  const bw = (11 + hRatio * 26) * scale
  const bh = (13 + (1 - hRatio) * 16 + sc * 0.55) * scale
  const hr = (9 + sc * 0.52) * scale
  const hy = bodyCy - bh - hr * 0.55
  const er = (2.2 + curvature * 2.8) * scale
  const esp = hr * 0.48
  const pairs = sc <= 4 ? 1 : sc <= 9 ? 2 : 3
  const parts: string[] = []

  // Body
  if (curvature > 0.55)
    parts.push(spikePolygon(cx, bodyCy, bw, bh, Math.round(4 + sc * 0.35), symmetry, c.main, c.dark))
  else if (curvature < 0.18)
    parts.push(`<rect x="${f(cx - bw)}" y="${f(bodyCy - bh)}" width="${f(bw * 2)}" height="${f(bh * 2)}" rx="${f(3 * scale)}" fill="${c.main}"/>`)
  else
    parts.push(`<ellipse cx="${cx}" cy="${f(bodyCy)}" rx="${f(bw)}" ry="${f(bh)}" fill="${c.main}"/>`)

  // Arms
  for (let p = 0; p < pairs; p++) {
    const ay = bodyCy - bh * (0.72 - p * 0.42)
    const al = (10 + sc * 0.85) * scale
    const lm = symmetry < 0.5 ? 0.65 : 1.0
    const sw = `stroke="${c.dark}" stroke-width="${f(4.5 * scale)}" fill="none" stroke-linecap="round"`
    if (curvature > 0.32) {
      parts.push(`<path d="M${f(cx - bw)},${f(ay)} Q${f(cx - bw - al * 0.4)},${f(ay - curvature * 14)} ${f(cx - bw - al * lm)},${f(ay + al * 0.35)}" ${sw}/>`)
      parts.push(`<path d="M${f(cx + bw)},${f(ay)} Q${f(cx + bw + al * 0.4)},${f(ay - curvature * 14)} ${f(cx + bw + al)},${f(ay + al * 0.35)}" ${sw}/>`)
    } else {
      parts.push(`<line x1="${f(cx - bw)}" y1="${f(ay)}" x2="${f(cx - bw - al * lm)}" y2="${f(ay + al * 0.4)}" ${sw}/>`)
      parts.push(`<line x1="${f(cx + bw)}" y1="${f(ay)}" x2="${f(cx + bw + al)}" y2="${f(ay + al * 0.4)}" ${sw}/>`)
    }
  }

  // Legs
  const ly = bodyCy + bh
  const ll = (11 + sc * 0.4) * scale
  const lsw = `stroke="${c.dark}" stroke-width="${f(5 * scale)}" stroke-linecap="round"`
  parts.push(`<line x1="${f(cx - bw * 0.5)}" y1="${f(ly)}" x2="${f(cx - bw * 0.4)}" y2="${f(ly + ll)}" ${lsw}/>`)
  parts.push(`<line x1="${f(cx + bw * 0.5)}" y1="${f(ly)}" x2="${f(cx + bw * 0.4)}" y2="${f(ly + ll)}" ${lsw}/>`)

  // Head
  parts.push(`<circle cx="${cx}" cy="${f(hy)}" r="${f(hr)}" fill="${c.light}"/>`)

  // Eyes
  const lEx = cx - esp * (symmetry < 0.5 ? 1.4 : 1.0)
  const lEy = hy + (symmetry < 0.4 ? -hr * 0.12 : 0)
  parts.push(`<circle cx="${f(lEx)}" cy="${f(lEy)}" r="${f(er)}" fill="${c.dark}"/>`)
  parts.push(`<circle cx="${f(cx + esp)}" cy="${f(hy)}" r="${f(er)}" fill="${c.dark}"/>`)
  parts.push(`<circle cx="${f(lEx + er * 0.28)}" cy="${f(lEy - er * 0.28)}" r="${f(er * 0.38)}" fill="white" opacity="0.8"/>`)
  parts.push(`<circle cx="${f(cx + esp + er * 0.28)}" cy="${f(hy - er * 0.28)}" r="${f(er * 0.38)}" fill="white" opacity="0.8"/>`)

  if (symmetry > 0.7) {
    const hh = (5 + symmetry * 7) * scale
    parts.push(`<polygon points="${f(cx)},${f(hy - hr - hh)} ${f(cx - 3.5 * scale)},${f(hy - hr + 1)} ${f(cx + 3.5 * scale)},${f(hy - hr + 1)}" fill="${c.dark}" opacity="0.9"/>`)
  }
  if (symmetry < 0.5) {
    const tx = cx + bw * 0.4, ty = bodyCy + bh * 0.4
    parts.push(`<path d="M${f(tx)},${f(ty)} Q${f(tx + 22 * scale)},${f(ty + 8 * scale)} ${f(tx + 16 * scale)},${f(ty + 26 * scale)}" stroke="${c.dark}" stroke-width="${f(3.8 * scale)}" fill="none" stroke-linecap="round"/>`)
  }
  if (sc >= 6) {
    const dots = Math.min(Math.floor(sc / 3), 4)
    for (let i = 0; i < dots; i++)
      parts.push(`<circle cx="${f(cx - (dots - 1) * 5 + i * 10)}" cy="${f(bodyCy)}" r="${f(2.4 * scale)}" fill="${c.accent}" opacity="0.75"/>`)
  }
  return wrap(parts)
}

// ── 種族 1: スライム ──────────────────────────────────────────
function generateSlime(dna: KanjiDNA): string {
  const { strokeCount: sc, hRatio, curvature, symmetry, hue } = dna
  const c = colors(hue)
  const scale = Math.min(0.65 + sc * 0.015, 0.95)
  const cx = 60, cy = 48
  const rx = (16 + hRatio * 18 + sc * 0.5) * scale
  const ry = (15 + (1 - hRatio) * 10 + sc * 0.4) * scale
  const bumps = Math.round(4 + curvature * 6)
  const parts: string[] = []

  // Blob body
  {
    let pts = ''
    for (let i = 0; i < bumps * 2; i++) {
      const a = (i / (bumps * 2)) * Math.PI * 2 - Math.PI / 2
      const outer = i % 2 === 0
      const r = outer ? 1.15 : 0.85
      const xs = symmetry < 0.5 && Math.cos(a) < 0 ? 0.7 : 1.0
      pts += `${f(cx + Math.cos(a) * rx * r * xs)},${f(cy + Math.sin(a) * ry * r)} `
    }
    parts.push(`<polygon points="${pts.trim()}" fill="${c.main}"/>`)
  }

  // Drips
  const drips = Math.min(sc, 5)
  for (let i = 0; i < drips; i++) {
    const dx = cx - (drips - 1) * 7 + i * 14
    const dh = (5 + i * 1.5) * scale
    parts.push(`<ellipse cx="${f(dx)}" cy="${f(cy + ry + dh * 0.5)}" rx="${f(3.5 * scale)}" ry="${f(dh)}" fill="${c.main}"/>`)
  }

  // Eyes
  const eyeR = (5 + curvature * 3) * scale
  const eyeX = rx * 0.38
  const eyeY = cy - ry * 0.1
  parts.push(`<circle cx="${f(cx - eyeX)}" cy="${f(eyeY)}" r="${f(eyeR)}" fill="white"/>`)
  parts.push(`<circle cx="${f(cx + eyeX)}" cy="${f(eyeY)}" r="${f(eyeR)}" fill="white"/>`)
  parts.push(`<circle cx="${f(cx - eyeX + 1)}" cy="${f(eyeY + 1)}" r="${f(eyeR * 0.55)}" fill="${c.dark}"/>`)
  parts.push(`<circle cx="${f(cx + eyeX + 1)}" cy="${f(eyeY + 1)}" r="${f(eyeR * 0.55)}" fill="${c.dark}"/>`)
  parts.push(`<circle cx="${f(cx - eyeX + eyeR * 0.3)}" cy="${f(eyeY - eyeR * 0.3)}" r="${f(eyeR * 0.28)}" fill="white" opacity="0.8"/>`)
  parts.push(`<circle cx="${f(cx + eyeX + eyeR * 0.3)}" cy="${f(eyeY - eyeR * 0.3)}" r="${f(eyeR * 0.28)}" fill="white" opacity="0.8"/>`)

  if (symmetry > 0.65) {
    const cr = (6 + symmetry * 5) * scale
    parts.push(`<circle cx="${f(cx)}" cy="${f(cy - ry - cr * 0.5)}" r="${f(cr)}" fill="${c.light}"/>`)
  }
  return wrap(parts)
}

// ── 種族 2: 触手眼 ──────────────────────────────────────────
function generateEyeTentacle(dna: KanjiDNA): string {
  const { strokeCount: sc, curvature, symmetry, hue } = dna
  const c = colors(hue)
  const scale = Math.min(0.65 + sc * 0.015, 0.95)
  const cx = 60, cy = 55
  const bodyR = (14 + sc * 0.45) * scale
  const tentCount = Math.min(3 + Math.round(sc * 0.5), 8)
  const tentLen = (14 + sc * 0.9) * scale
  const parts: string[] = []

  parts.push(`<circle cx="${cx}" cy="${f(cy)}" r="${f(bodyR)}" fill="${c.main}"/>`)

  for (let i = 0; i < tentCount; i++) {
    const a = (i / tentCount) * Math.PI * 2 - Math.PI / 2
    const sx = cx + Math.cos(a) * bodyR, sy = cy + Math.sin(a) * bodyR
    const lm = symmetry < 0.5 && Math.cos(a) < 0 ? 0.65 : 1.0
    const ex = cx + Math.cos(a) * (bodyR + tentLen * lm)
    const ey = cy + Math.sin(a) * (bodyR + tentLen * lm)
    const cpx = (sx + ex) / 2 - Math.sin(a) * curvature * tentLen * 0.7
    const cpy = (sy + ey) / 2 + Math.cos(a) * curvature * tentLen * 0.7
    parts.push(`<path d="M${f(sx)},${f(sy)} Q${f(cpx)},${f(cpy)} ${f(ex)},${f(ey)}" stroke="${c.dark}" stroke-width="${f(4 * scale)}" fill="none" stroke-linecap="round"/>`)
  }

  const eyeR = bodyR * (0.62 + symmetry * 0.08)
  const irisR = eyeR * 0.65
  const pupilR = irisR * 0.55
  parts.push(`<circle cx="${cx}" cy="${f(cy)}" r="${f(eyeR)}" fill="white"/>`)
  parts.push(`<circle cx="${cx}" cy="${f(cy)}" r="${f(irisR)}" fill="${c.dark}"/>`)
  parts.push(`<circle cx="${cx}" cy="${f(cy)}" r="${f(pupilR)}" fill="#000"/>`)
  parts.push(`<circle cx="${f(cx + pupilR * 0.35)}" cy="${f(cy - pupilR * 0.35)}" r="${f(pupilR * 0.3)}" fill="white" opacity="0.8"/>`)
  return wrap(parts)
}

// ── 種族 3: 四足獣 ──────────────────────────────────────────
function generateBeast(dna: KanjiDNA): string {
  const { strokeCount: sc, hRatio, curvature, symmetry, hue } = dna
  const c = colors(hue)
  const scale = Math.min(0.65 + sc * 0.015, 0.95)
  const bx = 52, by = 56
  const bw = (20 + hRatio * 16) * scale
  const bh = (11 + (1 - hRatio) * 8 + sc * 0.35) * scale
  const headR = (10 + sc * 0.35) * scale
  const legCount = sc >= 10 ? 6 : 4
  const legLen = (13 + sc * 0.3) * scale
  const tailLen = symmetry * 26 * scale
  const parts: string[] = []

  parts.push(`<ellipse cx="${f(bx)}" cy="${f(by)}" rx="${f(bw)}" ry="${f(bh)}" fill="${c.main}"/>`)

  const hx = bx + bw + headR * 0.55, hy = by - bh * 0.2
  parts.push(`<circle cx="${f(hx)}" cy="${f(hy)}" r="${f(headR)}" fill="${c.light}"/>`)

  const er = (3 + curvature * 2) * scale
  parts.push(`<circle cx="${f(hx + headR * 0.3)}" cy="${f(hy - headR * 0.15)}" r="${f(er)}" fill="${c.dark}"/>`)
  parts.push(`<circle cx="${f(hx + headR * 0.3 + er * 0.3)}" cy="${f(hy - headR * 0.15 - er * 0.3)}" r="${f(er * 0.35)}" fill="white" opacity="0.8"/>`)

  if (symmetry > 0.6)
    parts.push(`<polygon points="${f(hx)},${f(hy - headR - 8 * scale)} ${f(hx - 4 * scale)},${f(hy - headR + 2)} ${f(hx + 4 * scale)},${f(hy - headR + 2)}" fill="${c.dark}"/>`)

  if (tailLen > 4) {
    const tx = bx - bw
    parts.push(`<path d="M${f(tx)},${f(by)} Q${f(tx - tailLen * 0.5)},${f(by - tailLen * 0.3)} ${f(tx - tailLen)},${f(by + tailLen * 0.1)}" stroke="${c.dark}" stroke-width="${f(5 * scale)}" fill="none" stroke-linecap="round"/>`)
  }

  for (let i = 0; i < legCount; i++) {
    const lx = bx - bw * 0.7 + (i / (legCount - 1)) * bw * 1.4
    const ex = lx + (i < legCount / 2 ? -2 : 2) * scale
    const ey = by + bh + legLen
    if (curvature > 0.3)
      parts.push(`<path d="M${f(lx)},${f(by + bh)} Q${f(lx)},${f(by + bh + legLen * 0.5)} ${f(ex)},${f(ey)}" stroke="${c.dark}" stroke-width="${f(5 * scale)}" fill="none" stroke-linecap="round"/>`)
    else
      parts.push(`<line x1="${f(lx)}" y1="${f(by + bh)}" x2="${f(ex)}" y2="${f(ey)}" stroke="${c.dark}" stroke-width="${f(5 * scale)}" stroke-linecap="round"/>`)
  }
  return wrap(parts)
}

// ── 種族 4: 浮遊体 ──────────────────────────────────────────
function generateOrb(dna: KanjiDNA): string {
  const { strokeCount: sc, hRatio, curvature, symmetry, hue } = dna
  const c = colors(hue)
  const scale = Math.min(0.65 + sc * 0.015, 0.95)
  const cx = 60, cy = 46
  const orbR = (14 + sc * 0.38) * scale
  const wingW = (10 + hRatio * 22) * scale
  const wingH = wingW * (0.5 + curvature * 0.5)
  const tentCount = Math.min(1 + Math.round(sc / 3), 4)
  const tentLen = (14 + sc * 0.5) * scale
  const parts: string[] = []

  parts.push(`<circle cx="${cx}" cy="${f(cy)}" r="${f(orbR + 8 * scale)}" fill="none" stroke="${c.main}" stroke-width="1.5" opacity="0.3" stroke-dasharray="4,3"/>`)
  parts.push(`<circle cx="${cx}" cy="${f(cy)}" r="${f(orbR + 14 * scale)}" fill="none" stroke="${c.main}" stroke-width="1" opacity="0.15" stroke-dasharray="3,5"/>`)

  const wby = cy - orbR * 0.3
  const wb = `stroke="${c.dark}" stroke-width="${f(5 * scale)}" fill="none" stroke-linecap="round"`
  const rm = symmetry < 0.5 ? 0.7 : 1.0
  if (curvature > 0.3) {
    parts.push(`<path d="M${f(cx - orbR)},${f(wby)} Q${f(cx - orbR - wingW * 0.5)},${f(wby - wingH)} ${f(cx - orbR - wingW)},${f(wby - wingH * 0.3)}" ${wb}/>`)
    parts.push(`<path d="M${f(cx + orbR)},${f(wby)} Q${f(cx + orbR + wingW * 0.5 * rm)},${f(wby - wingH * rm)} ${f(cx + orbR + wingW * rm)},${f(wby - wingH * 0.3 * rm)}" ${wb}/>`)
  } else {
    parts.push(`<line x1="${f(cx - orbR)}" y1="${f(wby)}" x2="${f(cx - orbR - wingW)}" y2="${f(wby - wingH * 0.5)}" ${wb}/>`)
    parts.push(`<line x1="${f(cx + orbR)}" y1="${f(wby)}" x2="${f(cx + orbR + wingW * rm)}" y2="${f(wby - wingH * 0.5 * rm)}" ${wb}/>`)
  }

  parts.push(`<circle cx="${cx}" cy="${f(cy)}" r="${f(orbR)}" fill="${c.main}"/>`)

  const er = (3 + curvature * 2) * scale
  const esp = orbR * 0.35
  parts.push(`<circle cx="${f(cx - esp)}" cy="${f(cy - orbR * 0.05)}" r="${f(er)}" fill="${c.dark}"/>`)
  parts.push(`<circle cx="${f(cx + esp)}" cy="${f(cy - orbR * 0.05)}" r="${f(er)}" fill="${c.dark}"/>`)
  parts.push(`<circle cx="${f(cx - esp + er * 0.3)}" cy="${f(cy - orbR * 0.05 - er * 0.3)}" r="${f(er * 0.35)}" fill="white" opacity="0.8"/>`)
  parts.push(`<circle cx="${f(cx + esp + er * 0.3)}" cy="${f(cy - orbR * 0.05 - er * 0.3)}" r="${f(er * 0.35)}" fill="white" opacity="0.8"/>`)

  for (let i = 0; i < tentCount; i++) {
    const tx = cx - ((tentCount - 1) * 8) / 2 + i * 8
    const cdx = (i - (tentCount - 1) / 2) * curvature * 12
    parts.push(`<path d="M${f(tx)},${f(cy + orbR)} Q${f(tx + cdx)},${f(cy + orbR + tentLen * 0.5)} ${f(tx + cdx * 0.5)},${f(cy + orbR + tentLen)}" stroke="${c.dark}" stroke-width="${f(3.5 * scale)}" fill="none" stroke-linecap="round"/>`)
  }
  return wrap(parts)
}

// ── パブリック API ──────────────────────────────────────────

const GENERATORS = [
  generateBiped,
  generateSlime,
  generateEyeTentacle,
  generateBeast,
  generateOrb,
]

export function selectSpecies(dna: KanjiDNA, word: string): number {
  const wordHash = word.split('').reduce((s, c) => s + (c.codePointAt(0) ?? 0), 0)
  return (dna.strokeCount + Math.round(dna.hRatio * 10) + wordHash) % 5
}

const SPECIES_NAME_FN: ((word: string) => string)[] = [
  (word) => `「${word}」マン`,
  (word) => `「${word}」ののろい`,
  (word) => `「${word}」アイ`,
  (word) => `「${word}」のけもの`,
  (word) => `そらとぶ「${word}」`,
]

export function generateCreatureName(species: number, word: string): string {
  return SPECIES_NAME_FN[species](word)
}

export function generateCreature(dna: KanjiDNA, word: string): CreatureSpec {
  const species = selectSpecies(dna, word)
  const svgString = GENERATORS[species](dna)
  const name = generateCreatureName(species, word)
  return { species, dna, svgString, name }
}
