# プロジェクト実行メンバー管理アプリ

電気設備保守業務のプロジェクトメンバー配置を管理するモバイル＆Webアプリケーションです。

## 機能

- **プロジェクト管理**: 作業日程、場所、必要人数の管理
- **メンバー管理**: 技術者の資格、稼働時間、エリア管理
- **協力業者管理**: 外部パートナーの管理
- **配置管理**: ドラッグ&ドロップによる直感的なメンバー配置
- **競合検知**: スケジュール重複の自動検出
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

- `GET /api/health` - データベース接続確認
- `GET /api/members` - メンバー一覧取得
- `PUT /api/members` - メンバー更新
- `GET /api/projects` - プロジェクト一覧取得
- `PUT /api/projects` - プロジェクト更新
- `GET /api/external-partners` - 協力業者一覧取得
- `PUT /api/external-partners` - 協力業者更新

## データベーススキーマ

主要テーブル:
- `members` - メンバー情報
- `projects` - プロジェクト情報
- `external_partners` - 協力業者情報
- `project_member_assignments` - メンバー配置
- `project_external_partner_assignments` - 協力業者配置

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

## ライセンス

MIT License