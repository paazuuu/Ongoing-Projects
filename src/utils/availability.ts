import { Project, Member } from '../types';

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

export interface AvailabilityConflict {
  projectId: string;
  projectName: string;
  start: string;
  end: string;
}

export interface MemberAvailability {
  available: boolean;
  conflicts: AvailabilityConflict[]; // 重複している他プロジェクト
  reason: string; // 表示用の理由（空なら空き）
}

const formatRange = (start: string, end: string): string =>
  start === end ? start : `${start}〜${end}`;

// 対象プロジェクトの日程に対して、あるメンバーが割当可能か（他案件と日程が重ならないか）を判定する。
// - 対象プロジェクト自身への割当は除外して判定
// - 論理削除された(isActive=false)プロジェクトは無視
export const getMemberAvailability = (
  member: Member,
  targetProject: Project,
  allProjects: Project[]
): MemberAvailability => {
  const target = projectDateRange(targetProject);

  const conflicts: AvailabilityConflict[] = allProjects
    .filter(
      (p) =>
        p.id !== targetProject.id &&
        p.isActive &&
        p.assignedMembers.includes(member.id)
    )
    .map((p) => {
      const r = projectDateRange(p);
      return { projectId: p.id, projectName: p.name, start: r.start, end: r.end };
    })
    .filter((c) => rangesOverlap(target.start, target.end, c.start, c.end));

  const available = conflicts.length === 0;
  const reason = available
    ? ''
    : conflicts
        .map((c) => `${formatRange(c.start, c.end)}「${c.projectName}」に割当済み`)
        .join(' / ');

  return { available, conflicts, reason };
};

export { formatRange as formatDateRange };
