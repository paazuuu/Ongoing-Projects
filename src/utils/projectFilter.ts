import { Project, ProjectPriority } from '../types';

export interface ProjectFilterState {
  memberId: string; // '' = 全員
  priority: '' | ProjectPriority;
  labelId: string; // '' = すべて
  keyword: string;
}

export const emptyProjectFilter: ProjectFilterState = {
  memberId: '',
  priority: '',
  labelId: '',
  keyword: '',
};

// メンバーが担当（配置 or リーダー）しているか
export const isMemberAssigned = (project: Project, memberId: string): boolean =>
  project.leadMemberId === memberId || project.assignedMembers.includes(memberId);

export const applyProjectFilter = (
  projects: Project[],
  filter: ProjectFilterState
): Project[] => {
  const kw = filter.keyword.trim().toLowerCase();
  return projects.filter((p) => {
    if (filter.memberId && !isMemberAssigned(p, filter.memberId)) return false;
    if (filter.priority && p.priority !== filter.priority) return false;
    if (filter.labelId && !p.labelIds.includes(filter.labelId)) return false;
    if (kw) {
      const haystack = `${p.name} ${p.jobNo ?? ''} ${p.customerName ?? ''} ${p.salesRep ?? ''} ${p.location} ${p.workContent}`.toLowerCase();
      if (!haystack.includes(kw)) return false;
    }
    return true;
  });
};

export const isFilterActive = (filter: ProjectFilterState): boolean =>
  Boolean(filter.memberId || filter.priority || filter.labelId || filter.keyword.trim());
