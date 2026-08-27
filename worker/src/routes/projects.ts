import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { Env } from '../bindings';
import { getDb, type Db } from '../db/client';
import {
  projects,
  projectMemberAssignments,
  projectVehicleAssignments,
  projectExternalPartnerAssignments,
  projectLabels,
  checklistItems,
} from '../db/schema';
import { ok, fail } from '../lib/response';
import { serializeProject, type ProjectAssociations } from '../lib/serialize';

export const projectRoutes = new Hono<{ Bindings: Env }>();

const externalPartnerAssignmentSchema = z.object({
  partnerId: z.string().min(1),
  kind: z.enum(['subcontractor', 'hired_vehicle']).default('subcontractor'),
  memberCount: z.number().int().min(1),
  representativeName: z.string().default(''),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  vehicleType: z.string().optional().nullable(),
});

const timeRangeSchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
});

const projectInputSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  jobNo: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  salesRep: z.string().optional().nullable(),
  orderType: z.string().optional().nullable(),
  date: z.string().min(1),
  endDate: z.string().optional().nullable(),
  workTime: z.object({
    start: z.string().min(1),
    end: z.string().min(1),
  }),
  location: z.string().min(1),
  workContent: z.string().default(''),
  requiredMembers: z.number().int().min(1).default(1),
  notes: z.string().default(''),
  leadMemberId: z.string().min(1).optional().nullable(),
  contactMemberId: z.string().min(1).optional().nullable(),
  assignedMembers: z.array(z.string().min(1)).default([]),
  memberTimes: z.record(z.string(), timeRangeSchema).default({}),
  memberRoleCodes: z.record(z.string(), z.string()).default({}),
  assignedVehicleIds: z.array(z.string().min(1)).default([]),
  externalPartners: z.array(externalPartnerAssignmentSchema).default([]),
  labelIds: z.array(z.string().min(1)).default([]),
  workflowStatus: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  isActive: z.boolean().default(true),
});

const emptyAssociations = (): ProjectAssociations => ({
  assignedMembers: [],
  memberTimes: {},
  memberRoleCodes: {},
  assignedVehicleIds: [],
  externalPartners: [],
  labelIds: [],
  checklistSummary: { total: 0, done: 0 },
});

const loadAllAssociations = async (db: Db): Promise<Map<string, ProjectAssociations>> => {
  const [memberRows, vehicleRows, partnerRows, labelRows, checklistRows] = await Promise.all([
    db.select().from(projectMemberAssignments).all(),
    db.select().from(projectVehicleAssignments).all(),
    db.select().from(projectExternalPartnerAssignments).all(),
    db.select().from(projectLabels).all(),
    db.select().from(checklistItems).all(),
  ]);

  const map = new Map<string, ProjectAssociations>();
  const getOrCreate = (projectId: string): ProjectAssociations => {
    const existing = map.get(projectId);
    if (existing) return existing;
    const created = emptyAssociations();
    map.set(projectId, created);
    return created;
  };

  for (const row of memberRows) {
    const assoc = getOrCreate(row.projectId);
    assoc.assignedMembers.push(row.memberId);
    if (row.startTime && row.endTime) {
      assoc.memberTimes[row.memberId] = { start: row.startTime, end: row.endTime };
    }
    if (row.roleCode) {
      assoc.memberRoleCodes[row.memberId] = row.roleCode;
    }
  }
  for (const row of vehicleRows) {
    getOrCreate(row.projectId).assignedVehicleIds.push(row.vehicleId);
  }
  for (const row of partnerRows) {
    getOrCreate(row.projectId).externalPartners.push({
      partnerId: row.partnerId,
      kind: row.kind,
      memberCount: row.memberCount,
      representativeName: row.representativeName,
      startTime: row.startTime ?? undefined,
      endTime: row.endTime ?? undefined,
      vehicleNumber: row.vehicleNumber ?? undefined,
      vehicleType: row.vehicleType ?? undefined,
    });
  }
  for (const row of labelRows) {
    getOrCreate(row.projectId).labelIds.push(row.labelId);
  }
  for (const row of checklistRows) {
    const summary = getOrCreate(row.projectId).checklistSummary;
    summary.total += 1;
    if (row.isDone) summary.done += 1;
  }

  return map;
};

projectRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db.select().from(projects).all();
  const associations = await loadAllAssociations(db);
  return c.json(
    ok(rows.map((row) => serializeProject(row, associations.get(row.id) ?? emptyAssociations())))
  );
});

projectRoutes.put('/', async (c) => {
  const body = await c.req.json();
  const parsed = projectInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const input = parsed.data;
  const db = getDb(c.env.DB);
  const now = new Date();
  const id = input.id ?? crypto.randomUUID();

  const values = {
    name: input.name,
    jobNo: input.jobNo ?? null,
    customerName: input.customerName ?? null,
    salesRep: input.salesRep ?? null,
    orderType: input.orderType ?? null,
    date: input.date,
    endDate: input.endDate ?? null,
    workTimeStart: input.workTime.start,
    workTimeEnd: input.workTime.end,
    location: input.location,
    workContent: input.workContent,
    requiredMembers: input.requiredMembers,
    notes: input.notes,
    leadMemberId: input.leadMemberId ?? null,
    contactMemberId: input.contactMemberId ?? null,
    isActive: input.isActive,
    workflowStatus: input.workflowStatus,
    priority: input.priority,
    updatedAt: now,
  };

  await db
    .insert(projects)
    .values({ id, ...values, createdAt: now })
    .onConflictDoUpdate({ target: projects.id, set: values });

  await db.batch([
    db.delete(projectMemberAssignments).where(eq(projectMemberAssignments.projectId, id)),
    ...(input.assignedMembers.length
      ? [
          db.insert(projectMemberAssignments).values(
            input.assignedMembers.map((memberId) => ({
              projectId: id,
              memberId,
              startTime: input.memberTimes[memberId]?.start ?? null,
              endTime: input.memberTimes[memberId]?.end ?? null,
              roleCode: input.memberRoleCodes[memberId] ?? null,
            }))
          ),
        ]
      : []),
    db.delete(projectVehicleAssignments).where(eq(projectVehicleAssignments.projectId, id)),
    ...(input.assignedVehicleIds.length
      ? [
          db
            .insert(projectVehicleAssignments)
            .values(input.assignedVehicleIds.map((vehicleId) => ({ projectId: id, vehicleId }))),
        ]
      : []),
    db
      .delete(projectExternalPartnerAssignments)
      .where(eq(projectExternalPartnerAssignments.projectId, id)),
    ...(input.externalPartners.length
      ? [
          db.insert(projectExternalPartnerAssignments).values(
            input.externalPartners.map((p) => ({
              projectId: id,
              partnerId: p.partnerId,
              kind: p.kind,
              memberCount: p.memberCount,
              representativeName: p.representativeName,
              startTime: p.startTime ?? null,
              endTime: p.endTime ?? null,
              vehicleNumber: p.vehicleNumber ?? null,
              vehicleType: p.vehicleType ?? null,
            }))
          ),
        ]
      : []),
    db.delete(projectLabels).where(eq(projectLabels.projectId, id)),
    ...(input.labelIds.length
      ? [db.insert(projectLabels).values(input.labelIds.map((labelId) => ({ projectId: id, labelId })))]
      : []),
  ]);

  const [row] = await db.select().from(projects).where(eq(projects.id, id));
  const associations = await loadAllAssociations(db);
  return c.json(ok(serializeProject(row, associations.get(id) ?? emptyAssociations())));
});
