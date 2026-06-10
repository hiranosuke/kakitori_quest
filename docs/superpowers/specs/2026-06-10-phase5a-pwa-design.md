# Phase 5-A 設計書：PWA化

作成日: 2026-06-10

## 概要

kakitori Quest をホーム画面に追加してアプリとして使えるようにする（PWA化）。
Service Worker によるランタイムキャッシュで、一度プレイした単語はオフラインでも動作する。
オフライン時はバッジを表示し、タップすると注意事項を案内する。

---

## 1. 依存関係

| パッケージ | 種別 | 用途 |
|---|---|---|
| `vite-plugin-pwa` | devDependency | Manifest 生成・Service Worker（Workbox）生成 |

Workbox は `vite-plugin-pwa` に同梱されるため追加不要。

---

## 2. Web App Manifest

`vite.config.ts` の VitePWA プラグイン設定でインライン定義する。

| フィールド | 値 |
|---|---|
| `name` | `かきとりクエスト` |
| `short_name` | `かきとりQ` |
| `display` | `standalone` |
| `background_color` | `#000000` |
| `theme_color` | `#000000` |
| `start_url` | `/kakitori_quest/` |
| `scope` | `/kakitori_quest/` |
| `lang` | `ja` |
| `icons` | 192×192 / 512×512 PNG |

`standalone` 指定により URL バー・ブラウザ UI が非表示になりアプリ風の全画面表示になる。

---

## 3. アイコン

| ファイルパス | サイズ |
|---|---|
| `public/icons/icon-192.png` | 192×192px |
| `public/icons/icon-512.png` | 512×512px |

実装時に手動で用意して配置する。`vite-plugin-pwa` の `icons` 配列で参照する。

---

## 4. Service Worker（ランタイムキャッシュのみ）

アプリ本体（HTML/JS/CSS）は **precache しない**。
CDN からのストロークデータ取得に **Stale-While-Revalidate** 戦略を適用する。

### キャッシュ対象

| 対象 | URL パターン | 戦略 |
|---|---|---|
| hanzi-writer-data（CDN） | `https://cdn.jsdelivr.net/*` | Stale-While-Revalidate |

### 動作

- **初回アクセス**: ネットワークから取得しキャッシュに保存
- **2回目以降（オンライン）**: キャッシュから即返しつつバックグラウンドで更新
- **オフライン・キャッシュあり**: キャッシュから返す（動作する）
- **オフライン・キャッシュなし**: ネットワークエラー（初プレイの単語は動作しない）

アプリ本体は precache しないため、オフライン時に初めてアクセスした場合はアプリ自体が開かない。ホーム画面追加後に一度オンラインで起動することで以降のキャッシュが蓄積される。

---

## 5. オフラインインジケーター

### ファイル構成

| ファイル | 役割 |
|---|---|
| `src/hooks/useOnlineStatus.ts` | `navigator.onLine` + イベント監視で boolean を返す |
| `src/components/ui/OfflineBadge.tsx` | バッジ + タップ時ポップアップ |

### useOnlineStatus

```ts
export function useOnlineStatus(): boolean
```

`navigator.onLine` を初期値とし、`window.addEventListener('online' / 'offline')` でリアルタイム更新する。

### OfflineBadge の表示仕様

**バッジ（オフライン時のみ表示）**

| 項目 | 値 |
|---|---|
| 位置 | `position: fixed`, `top: 8px`, `left: 8px`, `z-index: 9999` |
| 内容 | `📵 オフライン` |
| スタイル | 黒背景 / accent カラー文字、既存 DQWindow 系に統一 |
| タップ | ポップアップを開く |

**ポップアップ（バッジタップ時）**

```
┌──────────────────────────┐
│ 📵 オフラインです         │
│                          │
│ いちどあそんだことばは    │
│ そのままつかえます。      │
│                          │
│ はじめてのことばには      │
│ インターネットが          │
│ ひつようです。            │
│                          │
│        [とじる]          │
└──────────────────────────┘
```

| 項目 | 値 |
|---|---|
| 位置 | 画面中央（`position: fixed` + transform センタリング） |
| スタイル | DQWindow コンポーネントを流用 |
| 閉じ方 | 「とじる」ボタン、またはオーバーレイタップ |

**文言定義場所**: `src/config/messages.ts` の `MSG.offline` に追加。

### App.tsx への組み込み

```tsx
// App.tsx の return 内、switch の外側に追加
<>
  {renderScreen()}
  <OfflineBadge />
</>
```

`OfflineBadge` 内部で `useOnlineStatus` を参照し、オンライン時は `null` を返す。

---

## 6. 変更ファイル一覧

| ファイル | 変更種別 |
|---|---|
| `package.json` | `vite-plugin-pwa` を devDependency に追加 |
| `vite.config.ts` | VitePWA プラグイン設定を追加 |
| `index.html` | `<meta name="theme-color">` を追加 |
| `src/config/messages.ts` | `MSG.offline` を追加 |
| `src/hooks/useOnlineStatus.ts` | 新規作成 |
| `src/components/ui/OfflineBadge.tsx` | 新規作成 |
| `src/App.tsx` | `OfflineBadge` を追加 |
| `public/icons/icon-192.png` | 手動配置（実装時） |
| `public/icons/icon-512.png` | 手動配置（実装時） |

---

## 7. スコープ外（Phase 6 以降）

- iOS 向け `apple-touch-icon` / `apple-mobile-web-app-*` メタタグ
- プッシュ通知
- バックグラウンド同期
- アプリ本体の precache（完全オフライン対応）
