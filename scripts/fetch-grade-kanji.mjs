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
 *   1. reading: '' に適切なひらがな読みをセットする（kakitori に渡す読み）
 *   2. ❓ ヒント絵文字を実際の絵文字に変更する
 *   3. ゲームに不適切な単語（難しすぎる・子どもに馴染みのない語）を削除する
 *   4. 単語を worlds.ts の該当ワールドの wordIds に追加する
 *
 * id の設計:
 *   漢字1文字の場合は文字そのものを id にする（例: id: '海'）
 *   漢字複合語の場合は語全体を id にする（例: id: '火山'）
 *   これにより id は常に一意で、reading の揺れによる衝突が起きない
 *
 * データソース: https://kanjiapi.dev/
 *   GET /v1/kanji/grade-{n} → その学年の配当漢字リスト
 *   GET /v1/kanji/{漢字}    → 漢字詳細（画数・意味・訓音読みなど）
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
  console.log(`// reading: '' に適切なひらがな読みを手動でセットしてください`)
  console.log(`// ❓ を実際の絵文字ヒントに変えてください`)
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
      const meaningEn = detail.meanings?.[0] ?? ''
      const hasKun = (detail.kun_readings ?? []).length > 0
      const hasOn = (detail.on_readings ?? []).length > 0

      // 訓読み参考情報をコメントとして付ける（reading は手動でセット）
      const readingHint = [
        hasKun ? `訓: ${detail.kun_readings.join('・')}` : '',
        hasOn ? `音: ${detail.on_readings.join('・')}` : '',
      ]
        .filter(Boolean)
        .join(' / ')

      entries.push(
        `  { id: '${kanji}', word: '${kanji}', reading: '', hint: '❓' }, // ${meaningEn}　${readingHint}`,
      )
    } catch (e) {
      skipped.push(`${kanji}（取得エラー: ${e.message}）`)
    }
  }

  console.log('// --- WordEntry テンプレート ---')
  for (const entry of entries) {
    console.log(entry)
  }

  if (skipped.length > 0) {
    console.log()
    console.log(`// --- スキップ（${skipped.length}字）---`)
    for (const s of skipped) {
      console.log(`//   ${s}`)
    }
  }

  console.log()
  console.log(`// 合計 ${entries.length}語 出力`)
}

main().catch((e) => {
  console.error('エラー:', e.message)
  process.exit(1)
})
