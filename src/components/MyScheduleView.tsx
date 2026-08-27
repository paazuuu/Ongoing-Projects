import React, { useMemo, useState, useEffect } from 'react';
import { Project, Member, CalendarEvent } from '../types';
import { isMemberAssigned } from '../utils/projectFilter';
import { checkScheduleConflicts } from '../utils/conflictChecker';
import { workflowStatusLabel, workflowStatusColor, priorityLabel, priorityColor } from '../utils/workflowStatus';
import { WEEKDAY_LABELS, todayKey, formatEventTimeLabel } from '../utils/calendar';
import { getEventType } from '../utils/eventTypes';
import { CalendarClock, Clock, MapPin, Crown, AlertTriangle, User, CalendarDays } from 'lucide-react';

interface MyScheduleViewProps {
  projects: Project[];
  members: Member[];
  calendarEvents: CalendarEvent[];
  onProjectSelect: (project: Project) => void;
}

const STORAGE_KEY = 'my-member-id';

const relativeDateLabel = (dateStr: string): string => {
  const today = todayKey();
  const d = new Date(`${dateStr}T00:00:00`);
  const t = new Date(`${today}T00:00:00`);
  const diff = Math.round((d.getTime() - t.getTime()) / (24 * 60 * 60 * 1000));
  const base = `${d.getMonth() + 1}月${d.getDate()}日 (${WEEKDAY_LABELS[d.getDay()]})`;
  if (diff === 0) return `${base}・今日`;
  if (diff === 1) return `${base}・明日`;
  if (diff === -1) return `${base}・昨日`;
  if (diff > 0) return `${base}・${diff}日後`;
  return `${base}・${Math.abs(diff)}日前`;
};

const MyScheduleView: React.FC<MyScheduleViewProps> = ({
  projects,
  members,
  calendarEvents,
  onProjectSelect,
}) => {
  const today = todayKey();
  const [memberId, setMemberId] = useState('');
  const [showPast, setShowPast] = useState(false);

  // 選択メンバーを復元／保存
  useEffect(() => {
    let stored = '';
    try {
      stored = window.localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
      stored = '';
    }
    if (stored && members.some((m) => m.id === stored)) {
      setMemberId(stored);
    } else if (members.length > 0) {
      setMemberId(members[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.length]);

  const handleSelectMember = (id: string) => {
    setMemberId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // 無視
    }
  };

  const myProjects = useMemo(
    () => (memberId ? projects.filter((p) => isMemberAssigned(p, memberId)) : []),
    [projects, memberId]
  );

  const conflicts = useMemo(() => {
    const all = checkScheduleConflicts(projects, members);
    return all.filter((c) => c.memberId === memberId);
  }, [projects, members, memberId]);

  const todayCount = myProjects.filter((p) => p.date === today).length;
  const upcomingCount = myProjects.filter((p) => p.date >= today).length;

  const myEvents = useMemo(
    () => (memberId ? calendarEvents.filter((e) => e.memberIds.includes(memberId)) : []),
    [calendarEvents, memberId]
  );

  const visibleProjects = showPast ? myProjects : myProjects.filter((p) => p.date >= today);
  const visibleEvents = showPast ? myEvents : myEvents.filter((e) => e.date >= today);

  // 日付ごとにプロジェクトと予定をまとめて昇順ソート
  const grouped = useMemo(() => {
    const map = new Map<string, { projects: Project[]; events: CalendarEvent[] }>();
    const ensure = (date: string) => {
      let g = map.get(date);
      if (!g) {
        g = { projects: [], events: [] };
        map.set(date, g);
      }
      return g;
    };
    for (const p of visibleProjects) ensure(p.date).projects.push(p);
    for (const e of visibleEvents) ensure(e.date).events.push(e);

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, g]) => ({
        date,
        projects: g.projects.sort((a, b) => a.workTime.start.localeCompare(b.workTime.start)),
        events: g.events.sort((a, b) =>
          (a.startTime ?? '00:00').localeCompare(b.startTime ?? '00:00')
        ),
      }));
  }, [visibleProjects, visibleEvents]);

  const selectedMember = members.find((m) => m.id === memberId);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto">
      {/* ヘッダー */}
      <div className="px-6 py-4 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">マイスケジュール</h1>
              <p className="text-sm text-gray-500">自分の担当プロジェクトを日付順で確認</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <select
              value={memberId}
              onChange={(e) => handleSelectMember(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="表示するメンバー"
            >
              {members.length === 0 && <option value="">メンバーがいません</option>}
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}（{m.team}）
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* サマリー */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">今日の担当</p>
            <p className="text-2xl font-bold text-gray-900">{todayCount} 件</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">今後の担当</p>
            <p className="text-2xl font-bold text-gray-900">{upcomingCount} 件</p>
          </div>
          <div
            className={`rounded-lg border p-4 ${
              conflicts.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
            }`}
          >
            <p className="text-sm text-gray-600">スケジュール競合</p>
            <p className={`text-2xl font-bold ${conflicts.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {conflicts.length} 件
            </p>
          </div>
        </div>

        {/* 競合警告 */}
        {conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-900">時間の重複があります</h3>
            </div>
            <div className="space-y-1">
              {conflicts.map((c, i) => (
                <p key={i} className="text-sm text-red-700">
                  {c.date}：{c.conflictingProjects.join(' / ')}（{c.timeRange}）
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 過去表示トグル */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedMember ? `${selectedMember.name} さんの予定` : '予定'}
          </h2>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            過去も表示
          </label>
        </div>

        {/* アジェンダ */}
        {grouped.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
            <CalendarClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {showPast ? '担当プロジェクトはありません' : '今後の担当プロジェクトはありません'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ date, projects: dayProjects, events: dayEvents }) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-sm font-semibold ${
                      date === today ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {relativeDateLabel(date)}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-2">
                  {/* 本人の予定（有給・不在など） */}
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="w-full text-left bg-white rounded-lg border-l-4 border border-gray-200 p-3"
                      style={{ borderLeftColor: event.color }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-800 truncate">{event.title}</span>
                          {getEventType(event.eventType) && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                              style={{ backgroundColor: event.color }}
                            >
                              {getEventType(event.eventType)!.label}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatEventTimeLabel(event)}
                        </span>
                      </div>
                      {event.memo && (
                        <p className="text-xs text-gray-500 mt-1 ml-6 truncate">{event.memo}</p>
                      )}
                    </div>
                  ))}
                  {dayProjects.map((project) => {
                    const isLead = project.leadMemberId === memberId;
                    return (
                      <button
                        key={project.id}
                        onClick={() => onProjectSelect(project)}
                        className="w-full text-left bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                            {isLead && (
                              <span className="flex items-center gap-0.5 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                <Crown className="w-3 h-3" />
                                リーダー
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${workflowStatusColor(
                                project.workflowStatus
                              )}`}
                            >
                              {workflowStatusLabel(project.workflowStatus)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColor(
                                project.priority
                              )}`}
                            >
                              {priorityLabel(project.priority)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {project.workTime.start} - {project.workTime.end}
                          </span>
                          {project.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-4 h-4" />
                              {project.location}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyScheduleView;
