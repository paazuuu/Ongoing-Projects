import React, { useMemo, useState } from 'react';
import { Project, Member, ExternalPartner, Vehicle, CalendarEvent } from '../types';
import { projectDateRange, rangesOverlap } from '../utils/availability';
import { getEventType } from '../utils/eventTypes';
import { vehicleCategoryLabel } from '../utils/vehicles';
import { todayKey, monthTitle } from '../utils/calendar';
import { Printer, ClipboardList } from 'lucide-react';

interface WorkPlanPrintViewProps {
  projects: Project[];
  members: Member[];
  externalPartners: ExternalPartner[];
  vehicles: Vehicle[];
  calendarEvents: CalendarEvent[];
}

// 既存Excel「作業計画（予定）表」= 日次 JOB別 配車・配員計画 の印刷用ビュー。
// 選択日に稼働する案件を JOB ごとに1ブロックで並べ、紙で現場配布できる体裁にする。
const WorkPlanPrintView: React.FC<WorkPlanPrintViewProps> = ({
  projects,
  members,
  externalPartners,
  vehicles,
  calendarEvents,
}) => {
  const [date, setDate] = useState(todayKey());

  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const partnerById = useMemo(() => new Map(externalPartners.map((p) => [p.id, p])), [externalPartners]);
  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);

  // その日に稼働する案件（単日・複数日の期間内）
  const dayProjects = useMemo(() => {
    return projects
      .filter((p) => p.isActive)
      .filter((p) => {
        const r = projectDateRange(p);
        return rangesOverlap(date, date, r.start, r.end);
      })
      .sort((a, b) => (a.jobNo ?? '').localeCompare(b.jobNo ?? '') || a.name.localeCompare(b.name));
  }, [projects, date]);

  // その日の勤怠・予定（占有=休み等）
  const dayEvents = useMemo(
    () => calendarEvents.filter((e) => e.date === date && e.memberIds.length > 0),
    [calendarEvents, date]
  );

  const memberTime = (p: Project, memberId: string) =>
    p.memberTimes?.[memberId] ?? { start: p.workTime.start, end: p.workTime.end };

  const roleBadge = (p: Project, memberId: string) => {
    const marks: string[] = [];
    if (p.leadMemberId === memberId) marks.push('👑リーダー');
    if (p.contactMemberId === memberId) marks.push('★連絡係');
    return marks.join(' ');
  };

  const formatDateHeading = (key: string) => {
    const d = new Date(`${key}T00:00:00`);
    const w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
    return `${monthTitle(d.getFullYear(), d.getMonth())}${d.getDate()}日（${w}）`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 min-h-0">
      {/* ツールバー（印刷時は非表示） */}
      <div className="no-print flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">作業計画表</h2>
          <span className="text-sm text-gray-500">日次 JOB別 配車・配員計画（印刷用）</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value || todayKey())}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            印刷 / PDF保存
          </button>
        </div>
      </div>

      {/* 印刷領域 */}
      <div className="flex-1 overflow-auto min-h-0 p-6">
        <div className="print-area mx-auto bg-white" style={{ maxWidth: '210mm' }}>
          {/* 帳票ヘッダー */}
          <div className="flex items-end justify-between border-b-2 border-gray-800 pb-2 mb-4 px-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900">作業計画表</h1>
              <p className="text-sm text-gray-600">工事・請負プロジェクト管理</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{formatDateHeading(date)}</div>
              <div className="text-xs text-gray-500">JOB件数: {dayProjects.length}</div>
            </div>
          </div>

          {dayProjects.length === 0 && (
            <div className="text-center text-gray-400 py-16 border border-dashed rounded-lg">
              この日に稼働する案件はありません
            </div>
          )}

          {/* JOBブロック（1案件=1ブロック、印刷時に途中改ページしない） */}
          <div className="space-y-3">
            {dayProjects.map((p) => {
              const subcontractors = p.externalPartners.filter((a) => (a.kind ?? 'subcontractor') === 'subcontractor');
              const hiredVehicles = p.externalPartners.filter((a) => a.kind === 'hired_vehicle');
              const assignedVehicles = (p.assignedVehicleIds ?? [])
                .map((id) => vehicleById.get(id))
                .filter((v): v is Vehicle => Boolean(v));
              return (
                <div
                  key={p.id}
                  className="border border-gray-400 rounded-lg overflow-hidden"
                  style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                >
                  {/* 基本欄 */}
                  <div className="bg-gray-100 px-3 py-1.5 grid grid-cols-12 gap-2 text-sm border-b border-gray-300">
                    <div className="col-span-2 font-mono font-bold text-gray-800">{p.jobNo || '—'}</div>
                    <div className="col-span-5 font-semibold text-gray-900 truncate">{p.name}</div>
                    <div className="col-span-3 text-gray-700 truncate">{p.customerName || ''}</div>
                    <div className="col-span-2 text-right text-gray-700">{p.workTime.start}-{p.workTime.end}</div>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-12 gap-x-4 gap-y-1 text-xs">
                    <div className="col-span-4"><span className="text-gray-400">現場/所在</span> {p.location || '—'}</div>
                    <div className="col-span-4"><span className="text-gray-400">営業担当</span> {p.salesRep || '—'}</div>
                    <div className="col-span-4"><span className="text-gray-400">発注形態</span> {p.orderType || '—'}</div>
                    <div className="col-span-12"><span className="text-gray-400">作業内容</span> {p.workContent || '—'}</div>

                    {/* 配員（社員） */}
                    <div className="col-span-12 mt-1">
                      <span className="text-gray-400">配員</span>
                      {p.assignedMembers.length === 0 ? (
                        <span className="ml-1 text-gray-400">なし</span>
                      ) : (
                        <div className="mt-0.5 flex flex-wrap gap-1.5">
                          {p.assignedMembers.map((mid) => {
                            const m = memberById.get(mid);
                            if (!m) return null;
                            const t = memberTime(p, mid);
                            const badge = roleBadge(p, mid);
                            const code = p.memberRoleCodes?.[mid];
                            return (
                              <span key={mid} className="inline-flex items-center gap-1 border border-gray-300 rounded px-1.5 py-0.5">
                                <span className="font-medium text-gray-800">{m.name}</span>
                                {code && <span className="bg-gray-800 text-white rounded px-1 text-[10px]">{code}</span>}
                                <span className="text-gray-500">{t.start}-{t.end}</span>
                                {badge && <span className="text-[10px] text-amber-700">{badge}</span>}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 社外戦力 */}
                    {subcontractors.length > 0 && (
                      <div className="col-span-6">
                        <span className="text-gray-400">下請</span>
                        <div className="mt-0.5 space-y-0.5">
                          {subcontractors.map((a, i) => {
                            const name = partnerById.get(a.partnerId)?.name ?? '協力業者';
                            return (
                              <div key={i}>
                                {name} / {a.memberCount}名
                                {a.representativeName && ` / ${a.representativeName}`}
                                {(a.startTime || a.endTime) && ` / ${a.startTime ?? ''}-${a.endTime ?? ''}`}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {hiredVehicles.length > 0 && (
                      <div className="col-span-6">
                        <span className="text-gray-400">傭車</span>
                        <div className="mt-0.5 space-y-0.5">
                          {hiredVehicles.map((a, i) => {
                            const name = partnerById.get(a.partnerId)?.name ?? '傭車';
                            return (
                              <div key={i}>
                                {name}
                                {a.vehicleType && ` / ${a.vehicleType}`}
                                {a.vehicleNumber && `（${a.vehicleNumber}）`}
                                {` / ${a.memberCount}台`}
                                {a.representativeName && ` / ${a.representativeName}`}
                                {(a.startTime || a.endTime) && ` / ${a.startTime ?? ''}-${a.endTime ?? ''}`}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 車両手配 */}
                    {assignedVehicles.length > 0 && (
                      <div className="col-span-12">
                        <span className="text-gray-400">車両</span>{' '}
                        {assignedVehicles
                          .map((v) => `${v.name}（${vehicleCategoryLabel(v.category)}${v.plateNumber ? ' ' + v.plateNumber : ''}）`)
                          .join(' / ')}
                      </div>
                    )}

                    {p.notes && (
                      <div className="col-span-12"><span className="text-gray-400">備考</span> {p.notes}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* その日の勤怠・不在（休み等） */}
          {dayEvents.length > 0 && (
            <div className="mt-4 border border-gray-400 rounded-lg overflow-hidden" style={{ breakInside: 'avoid' }}>
              <div className="bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-800 border-b border-gray-300">
                勤怠・不在（この日）
              </div>
              <div className="px-3 py-2 flex flex-wrap gap-2 text-xs">
                {dayEvents.map((e) => {
                  const label = getEventType(e.eventType)?.label ?? e.title;
                  const names = e.memberIds.map((id) => memberById.get(id)?.name).filter(Boolean).join('・');
                  return (
                    <span key={e.id} className="inline-flex items-center gap-1 border border-gray-300 rounded px-1.5 py-0.5">
                      <span className="font-medium" style={{ color: e.color }}>{label}</span>
                      <span className="text-gray-600">{names}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkPlanPrintView;
