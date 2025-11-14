/*
  # カフェ茶々日和 POSシステム - 初期データ投入
  
  このマイグレーションは、システムの初期データを投入します。
  
  ## 投入データ
  
  ### メニュー項目
  - 定食メニュー（3種類）
  - ドリンクメニュー（3種類）
  - デザートメニュー（3種類）
  
  ### テーブル
  - T1〜T8（2〜8席）
*/

-- ============================================================================
-- メニューデータ投入
-- ============================================================================

INSERT INTO menu_items (name, price, category, description, image_url, is_active) VALUES
  -- 定食メニュー
  (
    '本日の日替わり定食',
    980,
    '定食',
    '季節の食材を使った栄養バランスの良い定食。ご飯、味噌汁、小鉢、漬物付き。',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
    true
  ),
  (
    '鶏の唐揚げ定食',
    850,
    '定食',
    'ジューシーな鶏の唐揚げ定食。ご飯、味噌汁、キャベツ、漬物付き。',
    'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=300',
    true
  ),
  (
    '焼き魚定食',
    920,
    '定食',
    '新鮮な魚の焼き物定食。ご飯、味噌汁、小鉢、漬物付き。',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
    true
  ),
  
  -- ドリンクメニュー
  (
    '緑茶',
    200,
    'ドリンク',
    '香り高い緑茶。ホットまたはアイスをお選びいただけます。',
    'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=300',
    true
  ),
  (
    'ほうじ茶',
    200,
    'ドリンク',
    '香ばしいほうじ茶。ホットまたはアイスをお選びいただけます。',
    'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=300',
    true
  ),
  (
    '抹茶',
    350,
    'ドリンク',
    '本格的な抹茶。伝統的な茶道の作法で点てた一杯。',
    'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=300',
    true
  ),
  
  -- デザートメニュー
  (
    'わらび餅',
    380,
    'デザート',
    'なめらかなわらび餅。きな粉と黒蜜をかけてお召し上がりください。',
    'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=300',
    true
  ),
  (
    'みたらし団子',
    320,
    'デザート',
    '甘辛いみたらし団子。もちもちの食感が楽しめます。',
    'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=300',
    true
  ),
  (
    'あんみつ',
    450,
    'デザート',
    '和風あんみつ。寒天、白玉、あんこ、フルーツの贅沢な組み合わせ。',
    'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=300',
    true
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- テーブルデータ投入
-- ============================================================================

INSERT INTO tables (number, seats, status) VALUES
  ('T1', 2, 'available'),
  ('T2', 4, 'available'),
  ('T3', 2, 'available'),
  ('T4', 6, 'available'),
  ('T5', 4, 'available'),
  ('T6', 2, 'available'),
  ('T7', 4, 'available'),
  ('T8', 8, 'available')
ON CONFLICT (number) DO NOTHING;
