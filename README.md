# かきとりクエスト

ひらがなを書いて、文字キャラを召喚してバトルするドラクエ風書き取り練習ゲーム。

[@k1low/kakitori](https://github.com/k1LoW/kakitori) を使って、とめ・はね・はらいの正確さを判定します。

## ゲームの流れ

1. **ステージ選択** — ひらがなの単語を選ぶ
2. **書き取り** — 文字をなぞって書く（筆順ミスでハート消費）
3. **バトル** — とめ・はね・はらいの精度で召喚キャラの強さが決まり、崩れた文字モンスターとオート決着
4. **繰り返し** — 単語内の全文字を書ききるとステージクリア（★1〜3評価）

ハートが0になるとゲームオーバー。

## 特徴

- ドラクエ風レトロ UI（黒背景・白枠・ドットフォント）
- 書き取りエリアの位置を左・右・下・自動から設定可能（利き手・タブレット向き対応）
- 文字サイズを小・中・大から設定可能
- とめ・はね・はらいの間違いをわかりやすくフィードバック
- 35語の手作りひらがな単語リスト
- クリア実績を localStorage に保存

## 動作環境

タブレットブラウザ（Chrome / Safari）推奨。

## ローカルでの開発

```bash
npm install
npm run dev
```

### テスト

```bash
npm test
```

### ビルド

```bash
npm run build
```

## 技術スタック

| 領域 | 採用 |
|------|------|
| フレームワーク | React 19 + Vite |
| 言語 | TypeScript |
| 状態管理 | Zustand |
| アニメーション | Framer Motion |
| 書き取り判定 | [@k1low/kakitori](https://github.com/k1LoW/kakitori) |
| フォント | [DotGothic16](https://fonts.google.com/specimen/DotGothic16) (Google Fonts) |
| ホスティング | GitHub Pages |

## ライセンス

[MIT](LICENSE)

---

[@k1low](https://github.com/k1LoW) さんの「kakitori を使ったゲームを教えてほしい」という呼びかけに応えて作りました。
