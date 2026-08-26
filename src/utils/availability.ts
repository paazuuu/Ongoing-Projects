import { Project, Member, CalendarEvent } from '../types';

// プロジェクトの実効的な日程レンジ [開始日, 終了日]（endDate未設定なら単日）
export const projectDateRange = (project: Project): { start: string; end: string } => {
  const start = project.date;
  const end = project.endDate && project.endDate >= project.date ? project.endDate : project.date;
  return { start, end };
};

// 2つの日付レンジ（YYYY-MM-DD文字列）が1日でも重なるか
export const rangesOverlap = (
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean => aStart <= bEnd && bStart <= aEnd;

export type AvailabilitySource = 'project' | 'event';

export interface AvailabilityConflict {
  source: AvailabilitySource;
  id: string;
  name: string;
  start: string;
  end: string;
}

export interface MemberAvailability {
  available: boolean;
  conflicts: AvailabilityConflict[]; // 重複している他案件・予定
  reason: string; // 表示用の理由（空なら空き）
}

const formatRange = (start: string, end: string): string =>
  start === end ? start : `${start}〜${end}`;

// 対象プロジェクトの日程に対して、あるメンバーが割当可能か
// （他案件・本人の予定と日程が重ならないか）を判定する。
// - 対象プロジェクト自身への割当は除外して判定
// - 論理削除された(isActive=false)プロジェクトは無視
// - events: 本人にひも付いた予定（有給・不在など）も重複として扱う
export const getMemberAvailability = (
  member: Member,
  targetProject: Project,
  allProjects: Project[],
  events: CalendarEvent[] = []
): MemberAvailability => {
  const target = projectDateRange(targetProject);

  const projectConflicts: AvailabilityConflict[] = allProjects
    .filter(
      (p) =>
        p.id !== targetProject.id &&
        p.isActive &&
        p.assignedMembers.includes(member.id)
    )
    .map((p) => {
      const r = projectDateRange(p);
      return {
        source: 'project' as const,
        id: p.id,
        name: p.name,
        start: r.start,
        end: r.end,
      };
    })
    .filter((c) => rangesOverlap(target.start, target.end, c.start, c.end));

  const eventConflicts: AvailabilityConflict[] = events
    .filter((e) => e.memberIds?.includes(member.id))
    .map((e) => ({
      source: 'event' as const,
      id: e.id,
      name: e.title,
      start: e.date,
      end: e.date,
    }))
    .filter((c) => rangesOverlap(target.start, target.end, c.start, c.end));

  const conflicts = [...projectConflicts, ...eventConflicts];
  const available = conflicts.length === 0;
  const reason = available
    ? ''
    : conflicts
        .map((c) =>
          c.source === 'project'
            ? `${formatRange(c.start, c.end)}「${c.name}」に割当済み`
            : `${formatRange(c.start, c.end)}「${c.name}」の予定`
        )
        .join(' / ');

  return { available, conflicts, reason };
};

export { formatRange as formatDateRange };
