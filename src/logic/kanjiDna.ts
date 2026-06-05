import type { KanjiDNA } from '../types/game'

export interface HanziWriterData {
  strokes: string[]
  medians: number[][][]
}

// ---- ピュアな抽出関数 ----

export function extractDNA(char: string, data: HanziWriterData): KanjiDNA {
  const { strokes, medians } = data
  const strokeCount = strokes.length
  const hue = (char.codePointAt(0) ?? 0) % 360

  const hRatio =
    strokeCount === 0
      ? 0
      : medians.filter((m) => {
          if (m.length < 2) return false
          const dx = Math.abs(m[m.length - 1][0] - m[0][0])
          const dy = Math.abs(m[m.length - 1][1] - m[0][1])
          return dx > dy
        }).length / strokeCount

  const curvature =
    strokeCount === 0
      ? 0
      : medians.reduce((sum, m) => sum + strokeCurvature(m), 0) / strokeCount

  const allX = medians.flatMap((m) => m.map(([x]) => x))
  const symmetry = computeSymmetry(allX)

  return { strokeCount, hRatio, curvature, symmetry, hue }
}

export function combineDNA(dnaList: KanjiDNA[]): KanjiDNA {
  if (dnaList.length === 0) throw new Error('dnaList must not be empty')
  const n = dnaList.length
  return {
    strokeCount: dnaList.reduce((s, d) => s + d.strokeCount, 0),
    hRatio: dnaList.reduce((s, d) => s + d.hRatio, 0) / n,
    curvature: Math.max(...dnaList.map((d) => d.curvature)),
    symmetry: Math.min(...dnaList.map((d) => d.symmetry)),
    hue: dnaList[0].hue,
  }
}

// ---- ヘルパー ----

function strokeCurvature(median: number[][]): number {
  if (median.length < 3) return 0
  const start = median[0]
  const end = median[median.length - 1]
  const lineLen = Math.hypot(end[0] - start[0], end[1] - start[1])
  if (lineLen === 0) return 0
  let maxDev = 0
  for (const pt of median.slice(1, -1)) {
    maxDev = Math.max(maxDev, pointToLineDist(pt, start, end))
  }
  return Math.min(maxDev / lineLen, 1)
}

function pointToLineDist(pt: number[], a: number[], b: number[]): number {
  const num = Math.abs(
    (b[1] - a[1]) * pt[0] - (b[0] - a[0]) * pt[1] + b[0] * a[1] - b[1] * a[0],
  )
  const den = Math.hypot(b[1] - a[1], b[0] - a[0])
  return den === 0 ? 0 : num / den
}

function computeSymmetry(allX: number[]): number {
  if (allX.length === 0) return 1
  const cx = allX.reduce((s, x) => s + x, 0) / allX.length
  const leftMean = avg(allX.filter((x) => x < cx).map((x) => cx - x))
  const rightMean = avg(allX.filter((x) => x >= cx).map((x) => x - cx))
  const total = leftMean + rightMean
  return total === 0 ? 1 : 1 - Math.abs(leftMean - rightMean) / total
}

function avg(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length
}

// ---- CDN フェッチ ----

const CDN = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest'

export async function fetchWordDNA(word: string): Promise<KanjiDNA> {
  const dnaList = await Promise.all(
    word.split('').map(async (char) => {
      const data = await fetchHanziData(char)
      return data ? extractDNA(char, data) : fallbackDNA(char)
    }),
  )
  return combineDNA(dnaList)
}

async function fetchHanziData(char: string): Promise<HanziWriterData | null> {
  try {
    const res = await fetch(`${CDN}/${char}.json`)
    if (!res.ok) return null
    return res.json() as Promise<HanziWriterData>
  } catch {
    return null
  }
}

function fallbackDNA(char: string): KanjiDNA {
  const hue = (char.codePointAt(0) ?? 0) % 360
  return { strokeCount: 4, hRatio: 0.5, curvature: 0.3, symmetry: 0.8, hue }
}
