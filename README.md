# 工事・請負プロジェクト管理（仮）

土木・建築などの工事、および請負プロジェクトの**案件づくりと人員割り振り**を
まとめて管理するモバイル＆Webアプリケーションです。無料から使えるタスク・
プロジェクト管理ツール **Jooto** の考え方（プロジェクト＝案件をボードで俯瞰し、
担当を割り当てて進捗を見える化する）を参考にしています。

> 電気設備保守はあくまで一例で、対象は工事・土木・建築・請負など幅広い現場業務です。

## コンセプト・想定ユーザー

このアプリは、立場の違う2種類のユーザーを想定しています。

- **プロジェクト作成者 / 管理職（数人）**
  案件（プロジェクト）を作成し、メンバーを割り振る人たち。
  各プロジェクトの内容・日付・担当・進捗を**俯瞰**したい。
  → ダッシュボード / ステータスボード（Jooto風）/ カレンダーで全体を把握し、
    担当者・優先度・ラベル・キーワードで**絞り込み**できます。

- **割り振られたメンバー（現場担当）**
  自分がいつ・どの現場に入るのかを知りたい人たち。
  → **マイスケジュール**で、自分の担当プロジェクトを日付順に確認できます
    （時間の重複＝競合も警告表示）。

## 機能

- **プロジェクト管理**: 工事・請負案件の日程、場所、作業内容、必要人数の管理。**JOB No. / 顧客名 / 営業担当 / 発注形態**（既存Excelの基本欄）も登録・表示・検索可能
- **メンバー管理**: 担当者の資格・保有スキル、稼働時間、対応エリアの管理
- **協力業者管理**: 外注・協力会社（外部パートナー）の管理
- **配置管理**: ドラッグ&ドロップによる直感的な人員割り振り。**その日程に空いている作業員だけ**を「選択可能な作業員」サイドバーから選べ、他案件と日程が重なる人はグレーアウト＆割当不可（二重配置を防止）
- **リーダー／連絡係**: 配置済み作業員に「リーダー（王冠）」と「連絡係（星）」を設定可能。連絡係はタップで星のON/OFFを切り替えられ、臨時変更も簡単。誰が連絡係かをダッシュボード・ステータスボードでも一目で確認できる
- **複数日程の案件**: 開始日・終了日を指定でき、期間中はその作業員を別案件に割り当て不可（例: 9/1〜9/10 現場に入っている人は 9/7 の別案件に選べない）
- **競合検知**: 同一メンバーのスケジュール重複を自動検出
- **ステータスボード（Jooto風）**: 未着手→進行中→完了をカンバンで俯瞰・ドラッグ移動。担当者/優先度/ラベル/キーワードで絞り込み
- **操配表（俯瞰マトリクス）**: 作業員 × 日 の月間マトリクスで、誰がいつどの現場か・休みかを一覧表示（既存Excel「操配表」の再現）。各セルの隅には作業/役割の**略号（副セル）**（幅・真・下・W・10t 等）を表示し、Excelの手書き注記を再現
- **作業員ごとの作業時間**: 配置メンバーごとに始/終を個別設定（既定は案件全体の時間）
- **車両管理**: 社有車両（営業車/連絡車/Wキャブ/レンタカー/機動）をマスタ管理し、案件へ割当
- **マイスケジュール**: 担当者ごとに、自分の案件を日付順のアジェンダで表示
- **カレンダー**: TIMETREE風の月表示。プロジェクト（案件）と軽量な予定を色分け表示し、日付から予定・案件を直接追加。担当者で絞り込み可能
- **予定の担当者ひも付け**: 予定（有給・不在・研修など）に作業員をひも付け可能。ひも付けた人はその日に他案件へ割り当て不可になり、本人のマイスケジュールにも表示される
- **勤怠・休暇の種別**: 予定に種別（年休/PM年休/振休/褒賞休暇/病欠/病院/コロナ/段取り/移動/待機/研修/各種会議/始業式 など）を設定可能。既存Excel（操配表）の語彙に準拠。「占有」種別（休暇・段取り等）はその日の割当を自動でブロック、会議・待機など非占有の種別は制限しない
- **作業計画表（印刷/PDF）**: 日付を選ぶと、その日に稼働する案件をJOBごとに1ブロックで並べたA4帳票を表示。JOB No./顧客/現場/営業/発注形態/作業内容/配員（略号・個別時間・リーダー/連絡係）/下請・傭車/車両/備考＋その日の勤怠・不在をまとめ、ブラウザ印刷でそのままPDF保存・紙配布できる（既存Excel「作業計画表」の印刷運用を置き換え）
- **社外作業戦力（下請・傭車）**: 協力業者を「下請／傭車」で区分。人数・代表者名（傭車はドライバー氏名）・開始/終了時刻に加え、傭車は車番・車種まで登録可能（作業計画表の欄に準拠）
- **データベース連携**: Supabase PostgreSQL対応

## 技術スタック

- **Frontend**: React Native + Expo + TypeScript
- **Database**: Supabase (PostgreSQL) - **維持費無料**
- **ORM**: Prisma
- **Mobile**: Expo Router
- **Deployment**: Expo Application Services (EAS)

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd project-member-management
npm install
```

### 2. データベースセットアップ (Supabase - 無料)

1. [Supabase](https://supabase.com/)でアカウント作成
2. 新しいプロジェクトを作成
3. Database > Settings > Database から接続文字列を取得
4. API > Settings から Project URL と API Keys を取得

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集:
```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"

# Supabase API (React Native用)
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[ANON-KEY]
```

### 4. 依存関係のインストール

```bash
npm install
```

### 5. データベーススキーマの同期

```bash
npm run db:generate
npm run db:push
```

### 6. 開発サーバーの起動

```bash
npm start
```

## Expoデプロイ手順

### 1. EAS CLIのインストール

```bash
npm install -g @expo/cli eas-cli
```

### 2. Expo/EASログイン

```bash
expo login
eas login
```

### 3. プロジェクト設定

```bash
eas build:configure
```

### 4. ビルド実行

```bash
# Android
eas build --platform android

# iOS  
eas build --platform ios

# Web
expo export:web
```

## 使用方法

### プロジェクト作成
1. 「新規プロジェクト」ボタンをクリック
2. 作業日、時間、場所、必要人数を入力
3. 協力業者が必要な場合は追加

### メンバー配置
1. プロジェクトを選択
2. 利用可能メンバーから配置済みエリアにドラッグ&ドロップ
3. 担当メンバーを設定（王冠アイコンをクリック）
4. 「データベースに保存」ボタンで確定

### 競合管理
- 同じメンバーが同時刻に複数プロジェクトに配置された場合、自動的にアラート表示
- 赤色のインジケーターで競合を視覚的に確認

## API エンドポイント

バックエンドは `worker/`（Cloudflare Workers + Hono + D1 + drizzle）。フロントは
`VITE_API_BASE_URL` 経由で以下を呼び、DB未接続時はモックデータ＋localStorageで動作します。

- `GET /api/health` - データベース接続確認
- `GET /api/members` / `PUT /api/members` - メンバー取得・更新
- `GET /api/projects` / `PUT /api/projects` - プロジェクト取得・更新（JOB No./顧客名/営業担当/発注形態/終了日/連絡係/作業員別始終/割当車両/下請・傭車の詳細まで永続化）
- `GET /api/external-partners` / `PUT /api/external-partners` - 協力業者取得・更新
- `GET /api/labels` / `POST` / `PUT /:id` / `DELETE /:id` - ラベル
- `GET /api/vehicles` / `PUT /api/vehicles` / `DELETE /:id` - 社有車両マスタ
- `GET /api/calendar-events` / `POST` / `PUT /:id` / `DELETE /:id` - カレンダー予定（作業員ひも付け・勤怠種別を含む）

## データベーススキーマ

主要テーブル（`worker/src/db/schema.ts`。bootstrap用SQLは `worker/schema.sql`）:
- `members` - メンバー情報
- `projects` - プロジェクト情報（JOB No./顧客名/営業担当/発注形態/終了日/連絡係ほか）
- `external_partners` - 協力業者情報
- `vehicles` - 社有車両マスタ
- `calendar_events` / `calendar_event_members` - カレンダー予定と作業員ひも付け
- `project_member_assignments` - メンバー配置（作業員別の始/終を含む）
- `project_vehicle_assignments` - 車両割当
- `project_external_partner_assignments` - 協力業者配置（下請/傭車の区分・時刻・車番・車種）

### D1 の初期化（バックエンド連携）

```bash
cd worker
npm install
npx wrangler d1 create ongoing-projects-db   # 出力の database_id を wrangler.toml に貼る
npx wrangler d1 execute DB --file=./schema.sql --remote   # スキーマ適用（--local でローカルにも）
npm run deploy                                 # Worker をデプロイ
```

デプロイした Worker の URL をフロントの `.env`（`VITE_API_BASE_URL`）に設定すると、
`/api/health` が通り自動的にDBモードへ切り替わります。

## 開発コマンド

```bash
# アプリケーション実行
npm start           # Expo開発サーバー起動
npm run android     # Android実行
npm run ios         # iOS実行  
npm run web         # Web実行

# データベース関連
npm run db:generate # Prismaクライアント生成
npm run db:push     # スキーマをデータベースに同期
npm run db:migrate  # マイグレーション実行
npm run db:studio   # Prisma Studio起動
```

## なぜSupabaseに変更したか

- **コスト削減**: PlanetScaleは月額課金があるが、Supabaseは無料プランで十分な機能を提供
- **PostgreSQL**: より豊富な機能とデータ型をサポート
- **統合機能**: リアルタイム機能、認証、ストレージが統合されている
- **React Native対応**: `@supabase/supabase-js`でネイティブアプリから直接アクセス可能

## カレンダー機能（TIMETREE参考）

サイドバーの「カレンダー」から月表示カレンダーを開けます。

- **表示**: 各日にプロジェクト（優先度で色分け）と予定（カラーラベル）をまとめて表示
- **予定の追加/編集**: 「予定を追加」または日付を選択して追加。タイトル・日付・終日/時刻・カラー・メモを設定
- **プロジェクト作成**: 選択日から「新規プロジェクト」を開くと、その日付が初期入力される
- **データ保持**: DB未接続時は予定を `localStorage` に保存。DB接続時は `/api/calendar-events` と同期（`useDatabaseData` 参照）

主要ファイル:
- `src/components/CalendarView.tsx` — 月カレンダー本体
- `src/components/EventForm.tsx` — 予定の追加/編集モーダル
- `src/utils/calendar.ts` — 日付ユーティリティ・カラー・アイテム束ね

## 開発支援スキル（Claude Code）

`.claude/skills/` に UI/UX 設計支援（`ui-ux-pro-max` ほか）と計画立案支援
（`planning-with-files`）のスキルを同梱しています。Claude Code でこのリポジトリを
開くと自動的に読み込まれ、システムのバージョンアップ作業を支援します。
詳細と出典は `.claude/skills/README.md` を参照してください。

## ライセンス

MIT License