/*
  # カフェ茶々日和 POSシステム - 初期スキーマ
  
  このマイグレーションは、カフェPOSシステムの完全なデータベーススキーマを作成します。
  
  ## テーブル構成
  
  ### 1. tables - テーブル管理
  レストランの物理的なテーブルを管理します。
  - id: テーブルのユニークID
  - number: テーブル番号（表示用）
  - seats: 席数
  - status: 状態（available, occupied, reserved, cleaning）
  - customer_count: 現在の客数
  - order_start_time: 注文開始時刻
  - total_amount: 現在の合計金額
  
  ### 2. menu_items - メニュー項目
  提供可能な商品のマスターデータです。
  - id: メニューアイテムのユニークID
  - name: 商品名
  - price: 価格（円）
  - category: カテゴリ（定食、ドリンク、デザート等）
  - description: 商品説明
  - image_url: 商品画像URL
  - is_active: 有効フラグ
  
  ### 3. orders - 注文
  テーブルごとの注文明細を管理します。
  - id: 注文のユニークID
  - table_id: テーブルへの参照
  - menu_item_id: メニューアイテムへの参照
  - quantity: 数量
  - unit_price: 単価（注文時点の価格）
  
  ### 4. order_history - 注文履歴
  完了した注文の履歴を保存します。
  - id: 履歴のユニークID
  - table_number: テーブル番号
  - items: 注文項目（JSONB形式）
  - total_amount: 合計金額
  - completed_at: 完了時刻
  
  ## セキュリティ
  
  開発環境用にRow Level Security (RLS) を無効化しています。
  本番環境では必ずRLSを有効化し、適切な認証・認可ポリシーを設定してください。
*/

-- ============================================================================
-- テーブル作成
-- ============================================================================

-- テーブル管理テーブル
CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  seats integer NOT NULL DEFAULT 2,
  status text NOT NULL DEFAULT 'available',
  customer_count integer DEFAULT 0,
  order_start_time timestamptz,
  total_amount integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT tables_status_check CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning'))
);

-- メニュー項目テーブル
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 注文テーブル
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price integer NOT NULL CHECK (unit_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- 注文履歴テーブル
CREATE TABLE IF NOT EXISTS order_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number text NOT NULL,
  items jsonb NOT NULL,
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  completed_at timestamptz DEFAULT now()
);

-- ============================================================================
-- インデックス作成
-- ============================================================================

-- テーブル状態検索用
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status) WHERE is_active = true;

-- メニュー検索用
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);

-- 注文検索用
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 注文履歴検索用
CREATE INDEX IF NOT EXISTS idx_order_history_completed_at ON order_history(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_history_table_number ON order_history(table_number);

-- ============================================================================
-- Row Level Security (RLS) 設定
-- ============================================================================

-- 開発環境用: RLSを無効化
-- 注意: 本番環境では必ずRLSを有効化し、適切なポリシーを設定してください
ALTER TABLE tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_history DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- トリガー関数
-- ============================================================================

-- updated_at自動更新用のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_atトリガーを各テーブルに設定
CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
