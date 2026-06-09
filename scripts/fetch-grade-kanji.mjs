/**
 * 学年別漢字リスト取得スクリプト
 *
 * 使い方:
 *   node scripts/fetch-grade-kanji.mjs <学年>
 *
 * 例:
 *   node scripts/fetch-grade-kanji.mjs 2
 *
 * 出力: src/data/wordList.ts にコピペできる WordEntry テンプレート
 *
 * 出力後の作業（人間が行う）:
 *   1. ❓ ヒント絵文字を実際の絵文字に変更する
 *   2. ゲームに不適切な単語（難しすぎる・子どもに馴染みのない語）を削除する
 *   3. id が既存の wordList.ts と重複していないか確認する
 *   4. 単語を worlds.ts の該当ワールドの wordIds に追加する
 *
 * データソース: https://kanjiapi.dev/
 *   GET /v1/kanji/grade-{n} → その学年の配当漢字リスト
 *   GET /v1/kanji/{漢字}    → 漢字詳細（訓読み・画数・意味など）
 */

const BASE_URL = 'https://kanjiapi.dev/v1'
const DELAY_MS = 100 // レート制限対策

const grade = process.argv[2]

if (!grade || isNaN(Number(grade)) || Number(grade) < 1 || Number(grade) > 6) {
  console.error('使い方: node scripts/fetch-grade-kanji.mjs <学年(1〜6)>')
  process.exit(1)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function cleanReading(reading) {
  // kun_readings は "やま" や "やま.する" や "-やま" の形式があるので整形
  return reading.replace(/[.\-]/g, '').split('.')[0]
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch failed: ${url} (${res.status})`)
  return res.json()
}

async function main() {
  console.log(`// ===== ${grade}年生 配当漢字 WordEntry テンプレート =====`)
  console.log(`// 生成日: ${new Date().toISOString().slice(0, 10)}`)
  console.log(`// kanjiapi.dev から取得`)
  console.log(`//`)
  console.log(`// ❓ を実際の絵文字ヒントに変えてから wordList.ts に追加してください`)
  console.log(`// ゲームに不適切な単語は削除してください`)
  console.log()

  const kanjis = await fetchJson(`${BASE_URL}/kanji/grade-${grade}`)
  console.log(`// ${grade}年生配当漢字: ${kanjis.length}字\n`)

  const entries = []
  const skipped = []

  for (const kanji of kanjis) {
    await sleep(DELAY_MS)
    try {
      const detail = await fetchJson(`${BASE_URL}/kanji/${encodeURIComponent(kanji)}`)
      const kunReadings = (detail.kun_readings ?? []).map(cleanReading).filter(Boolean)

      if (kunReadings.length === 0) {
        skipped.push(`${kanji}（訓読みなし、音読み: ${(detail.on_readings ?? []).join('・')}）`)
        continue
      }

      const reading = kunReadings[0]
      const id = reading
      const meaningEn = detail.meanings?.[0] ?? ''

      entries.push(
        `  { id: '${id}', word: '${kanji}', reading: '${reading}', hint: '❓' }, // ${meaningEn}`,
      )
    } catch (e) {
      skipped.push(`${kanji}（取得エラー: ${e.message}）`)
    }
  }

  console.log('// --- 1文字漢字 エントリ ---')
  for (const entry of entries) {
    console.log(entry)
  }

  if (skipped.length > 0) {
    console.log()
    console.log(`// --- スキップした漢字（${skipped.length}字）---`)
    for (const s of skipped) {
      console.log(`//   ${s}`)
    }
  }

  console.log()
  console.log(`// 合計 ${entries.length}語 出力 / ${skipped.length}字スキップ`)
}

main().catch((e) => {
  console.error('エラー:', e.message)
  process.exit(1)
})
