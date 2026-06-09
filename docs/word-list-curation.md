# 単語リスト追加プロセス

kakitori_quest の単語リスト（`src/data/wordList.ts`）と各ワールドへの配置（`src/config/worlds.ts`）を追加・更新するときの手順。

## 基本方針

- 各ワールドの単語は **文部科学省の学年別漢字配当表** に準拠する
- その学年以下で習う漢字のみを使った単語を選ぶ（例：2年生ワールドは1〜2年生の漢字のみ）
- データソース: [kanjiapi.dev](https://kanjiapi.dev/) — 認証不要の無料JSON API

### 単語選定の基準

| 基準 | 内容 |
|---|---|
| 対象年齢 | 小学生（対象は主にお子さんがタブレットで使う想定） |
| 語彙の具体性 | 動物・食べ物・自然など、子どもが目で見てわかる具体的な単語を優先 |
| 読みの明確さ | 読み方が複数ある場合は、子どもに馴染みのある訓読みを優先 |
| 文字数 | 1〜5文字程度（長すぎる単語はゲームバランスを崩す） |
| ヒント絵文字 | 単語の意味を直感的に表す絵文字を1つ付ける |

---

## スクリプトを使った追加手順

### Step 1: 該当学年の漢字テンプレートを生成

```bash
node scripts/fetch-grade-kanji.mjs <学年>
```

例（2年生）:
```bash
node scripts/fetch-grade-kanji.mjs 2
```

出力例:
```
  { id: 'うみ', word: '海', reading: 'うみ', hint: '❓' }, // ocean
  { id: 'くも', word: '雲', reading: 'くも', hint: '❓' }, // cloud
  ...
// スキップした漢字（訓読みなし）:
//   万（訓読みなし、音読み: マン・バン）
```

### Step 2: 出力を手動でキュレーション

スクリプトの出力をそのまま使うことはできない。以下を確認してから使う：

1. **読みの確認** — `kun_readings` の最初の要素を採用しているが、より自然な読みに変更する
   - 例: `人` → スクリプトは「と」を出すが「ひと」の方が適切
   - 例: `大` → スクリプトは「おおいに」を出すが「おお」の方が適切

2. **不要な単語を削除** — 子どもに馴染みのない単語・抽象的な概念・固有名詞は除く

3. **絵文字ヒントを追加** — `❓` を適切な絵文字に変更する

4. **id の重複確認** — 既存の `wordList.ts` と id が重複していないか確認する
   - 重複する場合は `id: 'うみ-kanji'` のように区別する

5. **漢字の学年確認** — 単語内の全漢字がその学年以下であることを確認する
   - kanjiapi.dev で個別確認: `curl https://kanjiapi.dev/v1/kanji/海`
   - レスポンスの `"grade"` フィールドで確認

### Step 3: wordList.ts に追加

`src/data/wordList.ts` の該当学年のセクションに追記する：

```ts
// 漢字1文字（小学2年生）
{ id: 'うみ', word: '海', reading: 'うみ', hint: '🌊' },
{ id: 'くも-kanji', word: '雲', reading: 'くも', hint: '☁️' }, // 'くも'はひらがな版と重複するため区別
```

### Step 4: worlds.ts の wordIds に追加

`src/config/worlds.ts` の該当ワールドの `wordIds` 配列に追加した単語の `id` を追記する：

```ts
{
  id: 'grade2',
  name: '2ねんせいワールド',
  wordIds: ['うみ', 'くも-kanji', ...],
  bossWord: 'しんりんのとり',
  bossHint: '🐦',
}
```

### Step 5: 動作確認

```bash
npm run dev
```

ワールド選択 → 2年生ワールド → 追加した単語がステージとして表示されることを確認する。

---

## 手動で追加する場合（スクリプトを使わない場合）

1. [kanjiapi.dev](https://kanjiapi.dev/) で対象漢字の学年を確認
   ```
   curl https://kanjiapi.dev/v1/kanji/海
   ```
2. 上記 Step 3〜5 を実施する

---

## kanjiapi.dev APIリファレンス

| エンドポイント | 内容 |
|---|---|
| `GET /v1/kanji/grade-{1〜6}` | その学年の配当漢字リスト（配列） |
| `GET /v1/kanji/{漢字}` | 漢字詳細（読み・学年・画数・意味） |
| `GET /v1/kanji/joyo` | 常用漢字2140字リスト |
| `GET /v1/words/{漢字}` | その漢字を含む単語一覧 |

認証不要・無料・CORS対応。

### レスポンス例（`/v1/kanji/海`）

```json
{
  "kanji": "海",
  "grade": 2,
  "stroke_count": 9,
  "meanings": ["ocean", "sea"],
  "kun_readings": ["うみ"],
  "on_readings": ["カイ"],
  "jlpt": 4
}
```

---

## 関連ファイル

| ファイル | 役割 |
|---|---|
| `src/data/wordList.ts` | 全単語の定義（id・word・reading・hint） |
| `src/config/worlds.ts` | ワールドと wordIds・ボス単語の対応 |
| `scripts/fetch-grade-kanji.mjs` | 学年別漢字テンプレート生成スクリプト |
| `docs/superpowers/specs/2026-06-09-phase4-world-structure-design.md` | Phase 4 設計書 |
