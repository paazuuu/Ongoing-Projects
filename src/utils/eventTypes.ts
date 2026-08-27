// 操配表で実際に使われている勤怠・予定の語彙を種別として標準化したもの。
// blocks=true の種別はその日その作業員を「割当不可」にする（空き状況判定に連動）。

export type EventTypeCategory = '休暇' | '勤怠' | '業務' | '会議・研修' | 'その他';

export interface EventTypeDef {
  code: string;
  label: string;
  category: EventTypeCategory;
  color: string;
  blocks: boolean; // その日は他案件へ割り当て不可にするか
}

export const EVENT_TYPES: EventTypeDef[] = [
  // 休暇（不在＝割当不可）
  { code: 'nenkyu', label: '年休', category: '休暇', color: '#a855f7', blocks: true },
  { code: 'nenkyu_pm', label: 'PM年休（半休）', category: '休暇', color: '#c084fc', blocks: true },
  { code: 'zenkyu', label: '全休', category: '休暇', color: '#9333ea', blocks: true },
  { code: 'furikyu', label: '振休', category: '休暇', color: '#8b5cf6', blocks: true },
  { code: 'houshou', label: '褒賞休暇', category: '休暇', color: '#7c3aed', blocks: true },
  { code: 'yasumi', label: '休み', category: '休暇', color: '#94a3b8', blocks: true },
  { code: 'zettai_yasumi', label: '絶対休み', category: '休暇', color: '#64748b', blocks: true },
  { code: 'genchi_kyu', label: '現地休', category: '休暇', color: '#a1a1aa', blocks: true },

  // 勤怠（体調・不在系）
  { code: 'byouketsu', label: '病欠', category: '勤怠', color: '#ef4444', blocks: true },
  { code: 'byouin', label: '病院', category: '勤怠', color: '#f87171', blocks: true },
  { code: 'corona', label: 'コロナ', category: '勤怠', color: '#dc2626', blocks: true },
  { code: 'chikoku_soutai', label: '遅刻・早退', category: '勤怠', color: '#fb923c', blocks: false },

  // 業務（稼働中だが現場配置ではない）
  { code: 'dandori', label: '段取り', category: '業務', color: '#0ea5e9', blocks: true },
  { code: 'katazuke', label: '片付け', category: '業務', color: '#38bdf8', blocks: true },
  { code: 'idou', label: '移動', category: '業務', color: '#14b8a6', blocks: true },
  { code: 'idou_w', label: '移動W', category: '業務', color: '#0d9488', blocks: true },
  { code: 'taiki', label: '待機', category: '業務', color: '#22c55e', blocks: false },
  { code: 'remote', label: 'リモート', category: '業務', color: '#10b981', blocks: false },
  { code: 'shucchou', label: '出張', category: '業務', color: '#0891b2', blocks: true },

  // 会議・研修
  { code: 'kenshu', label: '研修', category: '会議・研修', color: '#f59e0b', blocks: true },
  { code: 'tenjou', label: '添乗指導', category: '会議・研修', color: '#d97706', blocks: true },
  { code: 'sanyaku_kaigi', label: '三役会議', category: '会議・研修', color: '#eab308', blocks: false },
  { code: 'souhai_kaigi', label: '操配会議', category: '会議・研修', color: '#ca8a04', blocks: false },
  { code: 'shigyoushiki', label: '始業式', category: '会議・研修', color: '#facc15', blocks: true },
  { code: 'shokuba_zentai', label: '職場全体', category: '会議・研修', color: '#fbbf24', blocks: false },

  // その他
  { code: 'other', label: 'その他の予定', category: 'その他', color: '#6b7280', blocks: false },
];

export const EVENT_TYPE_MAP: Map<string, EventTypeDef> = new Map(
  EVENT_TYPES.map((t) => [t.code, t])
);

export const getEventType = (code?: string): EventTypeDef | undefined =>
  code ? EVENT_TYPE_MAP.get(code) : undefined;

// 種別がその日を占有（割当不可）にするか。未設定の予定は占有扱い（従来動作を踏襲）。
export const eventTypeBlocks = (code?: string): boolean => {
  if (!code) return true;
  const t = EVENT_TYPE_MAP.get(code);
  return t ? t.blocks : true;
};

// カテゴリ順（フォームのグルーピング用）
export const EVENT_TYPE_CATEGORIES: EventTypeCategory[] = [
  '休暇',
  '勤怠',
  '業務',
  '会議・研修',
  'その他',
];
