# バンドル済み Claude Code スキル

このディレクトリには、本プロジェクトのシステム改修・バージョンアップを支援するために
同梱した外部スキルが含まれています。Claude Code（web / CLI / IDE）でこのリポジトリを
開くと自動的に読み込まれ、UI/UX 設計や計画立案の場面で利用できます。

## 同梱スキル一覧

### UI/UX 設計支援 — `ui-ux-pro-max`
出典: https://github.com/paazuuu/ui-ux-pro-max-skill （MIT License）

UI/UX デザインの知見をローカル DB 化したスキル群。画面・コンポーネント設計、
配色、タイポグラフィ、レイアウト、アクセシビリティ、データ可視化のレビュー等に使う。

- `ui-ux-pro-max` — スタイル/パレット/フォント/スタック検索の中核スキル
- `ui-styling` — 実装スタイリング支援（canvas フォント同梱）
- `design` — ロゴ/アイコン/モックアップ等のデザイン
- `design-system` — デザイントークン設計
- `brand` — ブランドガイドライン管理
- `banner-design` — バナー制作
- `slides` — スライド/資料デザイン

### 計画立案支援 — `planning-with-files`
出典: https://github.com/paazuuu/planning-with-files （MIT License, upstream: OthmanAdi）

`task_plan.md` / `findings.md` / `progress.md` などのファイルで計画を永続化し、
コンテキスト喪失や `/clear` をまたいでも作業を継続できるようにするスキル。
長時間の改修作業やセッション復帰時に有効。

## ライセンス

各スキルは元リポジトリの MIT License に従います。再配布・改変の際は上記出典を
明記してください。詳細は各スキルの元リポジトリを参照してください。
