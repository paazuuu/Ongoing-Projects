import type { members, projects, externalPartners, vehicles, calendarEvents } from '../db/schema';

type MemberRow = typeof members.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;
type ExternalPartnerRow = typeof externalPartners.$inferSelect;
type VehicleRow = typeof vehicles.$inferSelect;
type CalendarEventRow = typeof calendarEvents.$inferSelect;

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

export interface PartnerAssignmentPayload {
  partnerId: string;
  kind: 'subcontractor' | 'hired_vehicle';
  memberCount: number;
  representativeName: string;
  startTime?: string;
  endTime?: string;
  vehicleNumber?: string;
  vehicleType?: string;
}

export interface ProjectAssociations {
  assignedMembers: string[];
  memberTimes: { [memberId: string]: { start: string; end: string } };
  assignedVehicleIds: string[];
  externalPartners: PartnerAssignmentPayload[];
  labelIds: string[];
  checklistSummary: { total: number; done: number };
}

export const serializeProject = (row: ProjectRow, associations: ProjectAssociations) => ({
  id: row.id,
  name: row.name,
  jobNo: row.jobNo ?? undefined,
  customerName: row.customerName ?? undefined,
  salesRep: row.salesRep ?? undefined,
  orderType: row.orderType ?? undefined,
  date: row.date,
  endDate: row.endDate ?? undefined,
  workTime: {
    start: row.workTimeStart,
    end: row.workTimeEnd,
  },
  location: row.location,
  workContent: row.workContent,
  requiredMembers: row.requiredMembers,
  notes: row.notes,
  leadMemberId: row.leadMemberId ?? undefined,
  contactMemberId: row.contactMemberId ?? undefined,
  assignedMembers: associations.assignedMembers,
  memberTimes: associations.memberTimes,
  assignedVehicleIds: associations.assignedVehicleIds,
  externalPartners: associations.externalPartners,
  labelIds: associations.labelIds,
  checklistSummary: associations.checklistSummary,
  workflowStatus: row.workflowStatus,
  priority: row.priority,
  isActive: row.isActive,
  createdAt: new Date(row.createdAt).toISOString(),
  updatedAt: new Date(row.updatedAt).toISOString(),
});

export const serializeVehicle = (row: VehicleRow) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  plateNumber: row.plateNumber ?? undefined,
  notes: row.notes ?? undefined,
  isActive: row.isActive,
  createdAt: new Date(row.createdAt).toISOString(),
  updatedAt: new Date(row.updatedAt).toISOString(),
});

export const serializeCalendarEvent = (row: CalendarEventRow, memberIds: string[]) => ({
  id: row.id,
  title: row.title,
  date: row.date,
  isAllDay: row.isAllDay,
  startTime: row.startTime ?? undefined,
  endTime: row.endTime ?? undefined,
  color: row.color,
  memo: row.memo,
  memberIds,
  eventType: row.eventType ?? undefined,
  createdAt: new Date(row.createdAt).toISOString(),
  updatedAt: new Date(row.updatedAt).toISOString(),
});
