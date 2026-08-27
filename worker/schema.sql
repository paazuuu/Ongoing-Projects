-- 工事・請負プロジェクト管理 — Cloudflare D1 スキーマ（bootstrap用）
-- 適用: wrangler d1 execute DB --file=./schema.sql --remote  （--local でローカルにも）
-- drizzle-kit を使う場合は `npm run db:generate` → `npm run db:migrate:remote` でも可。
-- src/db/schema.ts と対応。boolean は integer(0/1)、timestamp は integer(ms)。

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  qualifications TEXT NOT NULL DEFAULT '[]',
  available_hours_start TEXT NOT NULL DEFAULT '08:00',
  available_hours_end TEXT NOT NULL DEFAULT '18:00',
  available_areas TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS external_partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  plate_number TEXT,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  job_no TEXT,
  customer_name TEXT,
  sales_rep TEXT,
  order_type TEXT,
  date TEXT NOT NULL,
  end_date TEXT,
  work_time_start TEXT NOT NULL,
  work_time_end TEXT NOT NULL,
  location TEXT NOT NULL,
  work_content TEXT NOT NULL DEFAULT '',
  required_members INTEGER NOT NULL DEFAULT 1,
  notes TEXT NOT NULL DEFAULT '',
  lead_member_id TEXT REFERENCES members(id),
  contact_member_id TEXT REFERENCES members(id),
  is_active INTEGER NOT NULL DEFAULT 1,
  workflow_status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS project_member_assignments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  start_time TEXT,
  end_time TEXT,
  role_code TEXT,
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS project_member_unique ON project_member_assignments (project_id, member_id);

CREATE TABLE IF NOT EXISTS project_vehicle_assignments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS project_vehicle_unique ON project_vehicle_assignments (project_id, vehicle_id);

CREATE TABLE IF NOT EXISTS project_external_partner_assignments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  partner_id TEXT NOT NULL REFERENCES external_partners(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'subcontractor',
  member_count INTEGER NOT NULL DEFAULT 1,
  representative_name TEXT NOT NULL DEFAULT '',
  start_time TEXT,
  end_time TEXT,
  vehicle_number TEXT,
  vehicle_type TEXT,
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS project_partner_unique ON project_external_partner_assignments (project_id, partner_id);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS attachments_entity_idx ON attachments (entity_type, entity_id);

CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS project_labels (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label_id TEXT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, label_id)
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_done INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_name TEXT,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  is_all_day INTEGER NOT NULL DEFAULT 1,
  start_time TEXT,
  end_time TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  memo TEXT NOT NULL DEFAULT '',
  event_type TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS calendar_events_date_idx ON calendar_events (date);

CREATE TABLE IF NOT EXISTS calendar_event_members (
  event_id TEXT NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, member_id)
);
