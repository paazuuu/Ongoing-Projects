export interface Member {
  id: string;
  name: string;
  team: string;
  qualifications: string[];
  availableHours: {
    start: string;
    end: string;
  };
  availableAreas: string[];
  notes: string;
  isActive: boolean; // 論理削除フラグ
  createdAt: string;
  updatedAt: string;
}

export type ProjectWorkflowStatus = 'todo' | 'in_progress' | 'done';
export type ProjectPriority = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  name: string;
  date: string;
  workTime: {
    start: string;
    end: string;
  };
  location: string;
  workContent: string;
  requiredMembers: number;
  notes: string;
  assignedMembers: string[];
  leadMemberId?: string; // 担当メンバーID
  externalPartners: ExternalPartnerAssignment[]; // 協力業者配置情報
  labelIds: string[];
  workflowStatus: ProjectWorkflowStatus;
  priority: ProjectPriority;
  checklistSummary?: { total: number; done: number };
  isActive: boolean; // 論理削除フラグ
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  projectId: string;
  content: string;
  isDone: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  authorName: string | null;
  body: string;
  createdAt: string;
}

export interface ExternalPartner {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalPartnerAssignment {
  partnerId: string;
  memberCount: number;
  representativeName: string;
}

export interface Assignment {
  memberId: string;
  projectId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface ConflictAlert {
  memberId: string;
  memberName: string;
  conflictingProjects: string[];
  date: string;
  timeRange: string;
}

export interface ProjectFormData {
  name: string;
  date: string;
  workTimeStart: string;
  workTimeEnd: string;
  location: string;
  workContent: string;
  requiredMembers: number;
  notes: string;
  priority: ProjectPriority;
  labelIds: string[];
}

export interface ProjectSaveData {
  name: string;
  date: string;
  workTime: {
    start: string;
    end: string;
  };
  location: string;
  workContent: string;
  requiredMembers: number;
  notes: string;
  priority: ProjectPriority;
  labelIds: string[];
  externalPartners: ExternalPartnerAssignment[];
  leadMemberId?: string;
}

export interface MemberFormData {
  name: string;
  team: string;
  qualifications: string[];
  availableHoursStart: string;
  availableHoursEnd: string;
  availableAreas: string[];
  notes: string;
}