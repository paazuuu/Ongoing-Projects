import { Project, CalendarEvent, CalendarItem, ProjectPriority } from '../types';

export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

// TIMETREE風のカラーラベル候補
export const EVENT_COLORS: { label: string; value: string }[] = [
  { label: 'レッド', value: '#ef4444' },
  { label: 'オレンジ', value: '#f59e0b' },
  { label: 'グリーン', value: '#10b981' },
  { label: 'ブルー', value: '#3b82f6' },
  { label: 'パープル', value: '#a855f7' },
  { label: 'ピンク', value: '#ec4899' },
  { label: 'ティール', value: '#14b8a6' },
  { label: 'グレー', value: '#6b7280' },
];

// プロジェクトの優先度から表示色を決める（カレンダー上のバー色）
export const projectColor = (priority: ProjectPriority): string => {
  switch (priority) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#3b82f6';
    case 'low':
      return '#94a3b8';
  }
};

export const pad2 = (n: number): string => String(n).padStart(2, '0');

// ローカルタイムでの YYYY-MM-DD
export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const todayKey = (): string => toDateKey(new Date());

// 指定月のカレンダーグリッド（週の始まりは日曜、6週=42マス）
export const buildMonthMatrix = (year: number, month: number): Date[] => {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0=日
  const gridStart = new Date(year, month, 1 - startOffset);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return days;
};

export const monthTitle = (year: number, month: number): string =>
  `${year}年${month + 1}月`;

export const formatEventTimeLabel = (event: CalendarEvent): string => {
  if (event.isAllDay) return '終日';
  const start = event.startTime ?? '';
  const end = event.endTime ?? '';
  if (start && end) return `${start}-${end}`;
  return start || end || '';
};

// プロジェクトと予定を、日付キー -> CalendarItem[] のマップに束ねる
export const buildItemsByDate = (
  projects: Project[],
  events: CalendarEvent[]
): Map<string, CalendarItem[]> => {
  const map = new Map<string, CalendarItem[]>();
  const push = (key: string, item: CalendarItem) => {
    const arr = map.get(key);
    if (arr) arr.push(item);
    else map.set(key, [item]);
  };

  for (const p of projects) {
    if (!p.isActive) continue;
    const start = p.date;
    const end = p.endDate && p.endDate >= p.date ? p.endDate : p.date;
    const isMultiDay = end > start;
    const timeLabel = isMultiDay ? `${start}〜${end}` : `${p.workTime.start}-${p.workTime.end}`;

    // 複数日にまたがる場合は各日にバーを表示（最大62日で打ち切り）
    const cursor = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    let guard = 0;
    while (cursor <= endDate && guard < 62) {
      const key = toDateKey(cursor);
      push(key, {
        kind: 'project',
        id: p.id,
        date: key,
        title: p.name,
        color: projectColor(p.priority),
        timeLabel,
        sortKey: p.workTime.start,
      });
      cursor.setDate(cursor.getDate() + 1);
      guard += 1;
    }
  }

  for (const e of events) {
    push(e.date, {
      kind: 'event',
      id: e.id,
      date: e.date,
      title: e.title,
      color: e.color,
      timeLabel: formatEventTimeLabel(e),
      sortKey: e.isAllDay ? '00:00' : e.startTime ?? '23:59',
    });
  }

  // 各日を時刻順に並べる（終日/早い時刻が先）
  for (const arr of map.values()) {
    arr.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }
  return map;
};
