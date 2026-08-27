import React, { useMemo, useState } from 'react';
import { Project, Member, CalendarEvent } from '../types';
import { WEEKDAY_LABELS, toDateKey, todayKey, monthTitle, projectColor } from '../utils/calendar';
import { projectDateRange, rangesOverlap } from '../utils/availability';
import { isMemberAssigned } from '../utils/projectFilter';
import { getEventType } from '../utils/eventTypes';
import { ChevronLeft, ChevronRight, Grid3x3 } from 'lucide-react';

interface MatrixViewProps {
  projects: Project[];
  members: Member[];
  calendarEvents: CalendarEvent[];
  onProjectSelect: (project: Project) => void;
}

interface CellItem {
  kind: 'project' | 'event';
  id: string;
  label: string;
  color: string;
  sub?: string; // 作業/役割の略号（操配表の副セル）
}

const MatrixView: React.FC<MatrixViewProps> = ({ projects, members, calendarEvents, onProjectSelect }) => {
  const now = new Date();
  const today = todayKey();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const days = useMemo(() => {
    const count = new Date(viewYear, viewMonth + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => new Date(viewYear, viewMonth, i + 1));
  }, [viewYear, viewMonth]);

  const monthStart = toDateKey(new Date(viewYear, viewMonth, 1));
  const monthEnd = toDateKey(new Date(viewYear, viewMonth, days.length));

  // key: `${memberId}|${dateKey}` -> CellItem[]
  const cellMap = useMemo(() => {
    const map = new Map<string, CellItem[]>();
    const push = (memberId: string, dateKey: string, item: CellItem) => {
      const k = `${memberId}|${dateKey}`;
      const arr = map.get(k);
      if (arr) arr.push(item);
      else map.set(k, [item]);
    };

    // プロジェクト（担当作業員の各日に展開）
    for (const p of projects) {
      if (!p.isActive) continue;
      const r = projectDateRange(p);
      if (!rangesOverlap(monthStart, monthEnd, r.start, r.end)) continue;
      const assigned = members.filter((m) => isMemberAssigned(p, m.id));
      if (assigned.length === 0) continue;
      const cur = new Date(`${r.start}T00:00:00`);
      const end = new Date(`${r.end}T00:00:00`);
      let guard = 0;
      while (cur <= end && guard < 400) {
        const key = toDateKey(cur);
        if (key >= monthStart && key <= monthEnd) {
          for (const m of assigned) {
            push(m.id, key, {
              kind: 'project',
              id: p.id,
              label: p.name,
              color: projectColor(p.priority),
              sub: p.memberRoleCodes?.[m.id],
            });
          }
        }
        cur.setDate(cur.getDate() + 1);
        guard += 1;
      }
    }

    // 予定（勤怠など、ひも付く作業員のその日）
    for (const e of calendarEvents) {
      if (e.date < monthStart || e.date > monthEnd) continue;
      const label = getEventType(e.eventType)?.label ?? e.title;
      for (const memberId of e.memberIds) {
        push(memberId, e.date, { kind: 'event', id: e.id, label, color: e.color });
      }
    }
    return map;
  }, [projects, members, calendarEvents, monthStart, monthEnd]);

  const goPrev = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goNext = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  const activeMembers = members.filter((m) => m.isActive);

  const handleItemClick = (item: CellItem) => {
    if (item.kind === 'project') {
      const p = projects.find((pp) => pp.id === item.id);
      if (p) onProjectSelect(p);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-h-0">
      {/* ツールバー */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <Grid3x3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">操配表</h2>
          <span className="text-sm text-gray-500">作業員 × 日 の月間俯瞰</span>
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-700 min-w-[8rem] text-right">
            {monthTitle(viewYear, viewMonth)}
          </h3>
          <button onClick={goPrev} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="前の月">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={goNext} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="次の月">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={goToday} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700">
            今日
          </button>
        </div>
      </div>

      {/* マトリクス（横スクロール・見出し固定） */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-20 bg-gray-100 border-b border-r border-gray-300 px-3 py-2 text-left text-gray-600 font-semibold w-32 min-w-[8rem]">
                作業員
              </th>
              {days.map((d) => {
                const key = toDateKey(d);
                const dow = d.getDay();
                const isToday = key === today;
                return (
                  <th
                    key={key}
                    className={`sticky top-0 z-10 border-b border-r border-gray-200 px-1 py-1 text-center font-medium w-12 min-w-[3rem] ${
                      isToday ? 'bg-blue-100' : dow === 0 ? 'bg-red-50' : dow === 6 ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`text-xs ${dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                      {d.getDate()}
                    </div>
                    <div className={`text-[10px] ${dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                      {WEEKDAY_LABELS[dow]}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {activeMembers.map((m) => (
              <tr key={m.id}>
                <th className="sticky left-0 z-10 bg-white border-b border-r border-gray-300 px-3 py-2 text-left align-top w-32 min-w-[8rem]">
                  <div className="font-medium text-gray-800 truncate">{m.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{m.team}</div>
                </th>
                {days.map((d) => {
                  const key = toDateKey(d);
                  const items = cellMap.get(`${m.id}|${key}`) ?? [];
                  const dow = d.getDay();
                  const isToday = key === today;
                  return (
                    <td
                      key={key}
                      className={`border-b border-r border-gray-100 p-0.5 align-top w-12 min-w-[3rem] h-12 ${
                        isToday ? 'bg-blue-50/40' : dow === 0 ? 'bg-red-50/30' : dow === 6 ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        {items.slice(0, 2).map((item, idx) => (
                          <div
                            key={`${item.kind}-${item.id}-${idx}`}
                            onClick={() => handleItemClick(item)}
                            title={item.sub ? `${item.label}（${item.sub}）` : item.label}
                            className={`relative text-[9px] leading-tight rounded px-1 py-0.5 text-white truncate ${
                              item.kind === 'project' ? 'cursor-pointer hover:opacity-90' : ''
                            }`}
                            style={{ backgroundColor: item.color }}
                          >
                            {item.label}
                            {item.sub && (
                              <span
                                className="absolute -top-1 -right-1 bg-white text-gray-800 border border-gray-300 rounded px-0.5 text-[8px] font-bold leading-none shadow-sm"
                                title={`略号: ${item.sub}`}
                              >
                                {item.sub}
                              </span>
                            )}
                          </div>
                        ))}
                        {items.length > 2 && (
                          <div className="text-[9px] text-gray-500 px-1">+{items.length - 2}</div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {activeMembers.length === 0 && (
              <tr>
                <td colSpan={days.length + 1} className="text-center text-gray-400 py-10">
                  作業員が登録されていません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatrixView;
