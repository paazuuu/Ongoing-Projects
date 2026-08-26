import type { members, projects, externalPartners } from '../db/schema';

type MemberRow = typeof members.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;
type ExternalPartnerRow = typeof externalPartners.$inferSelect;

export const serializeMember = (row: MemberRow) => ({
  id: row.id,
  name: row.name,
  team: row.team,
  qualifications: row.qualifications,
  availableHours: {
    start: row.availableHoursStart,
    end: row.availableHoursEnd,
  },
  availableAreas: row.availableAreas,
  notes: row.notes,
  isActive: row.isActive,
  createdAt: new Date(row.createdAt).toISOString(),
  updatedAt: new Date(row.updatedAt).toISOString(),
});

export const serializeExternalPartner = (row: ExternalPartnerRow) => ({
  id: row.id,
  name: row.name,
  isActive: row.isActive,
  createdAt: new Date(row.createdAt).toISOString(),
  updatedAt: new Date(row.updatedAt).toISOString(),
});

export interface ProjectAssociations {
  assignedMembers: string[];
  externalPartners: { partnerId: string; memberCount: number; representativeName: string }[];
  labelIds: string[];
  checklistSummary: { total: number; done: number };
}

export const serializeProject = (row: ProjectRow, associations: ProjectAssociations) => ({
  id: row.id,
  name: row.name,
  date: row.date,
  workTime: {
    start: row.workTimeStart,
    end: row.workTimeEnd,
  },
  location: row.location,
  workContent: row.workContent,
  requiredMembers: row.requiredMembers,
  notes: row.notes,
  leadMemberId: row.leadMemberId ?? undefined,
  assignedMembers: associations.assignedMembers,
  externalPartners: associations.externalPartners,
  labelIds: associations.labelIds,
  checklistSummary: associations.checklistSummary,
  workflowStatus: row.workflowStatus,
  priority: row.priority,
  isActive: row.isActive,
  createdAt: new Date(row.createdAt).toISOString(),
  updatedAt: new Date(row.updatedAt).toISOString(),
});
