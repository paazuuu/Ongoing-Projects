import { sqliteTable, text, integer, uniqueIndex, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const members = sqliteTable('members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  team: text('team').notNull(),
  qualifications: text('qualifications', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  availableHoursStart: text('available_hours_start').notNull().default('08:00'),
  availableHoursEnd: text('available_hours_end').notNull().default('18:00'),
  availableAreas: text('available_areas', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  notes: text('notes').notNull().default(''),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

export const externalPartners = sqliteTable('external_partners', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  date: text('date').notNull(),
  workTimeStart: text('work_time_start').notNull(),
  workTimeEnd: text('work_time_end').notNull(),
  location: text('location').notNull(),
  workContent: text('work_content').notNull().default(''),
  requiredMembers: integer('required_members').notNull().default(1),
  notes: text('notes').notNull().default(''),
  leadMemberId: text('lead_member_id').references(() => members.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  workflowStatus: text('workflow_status', { enum: ['todo', 'in_progress', 'done'] }).notNull().default('todo'),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

export const projectMemberAssignments = sqliteTable('project_member_assignments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  memberId: text('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  projectMemberUnique: uniqueIndex('project_member_unique').on(t.projectId, t.memberId),
}));

export const projectExternalPartnerAssignments = sqliteTable('project_external_partner_assignments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  partnerId: text('partner_id').notNull().references(() => externalPartners.id, { onDelete: 'cascade' }),
  memberCount: integer('member_count').notNull().default(1),
  representativeName: text('representative_name').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  projectPartnerUnique: uniqueIndex('project_partner_unique').on(t.projectId, t.partnerId),
}));

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  entityType: text('entity_type', { enum: ['project', 'member'] }).notNull(),
  entityId: text('entity_id').notNull(),
  r2Key: text('r2_key').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  entityIdx: index('attachments_entity_idx').on(t.entityType, t.entityId),
}));

export const labels = sqliteTable('labels', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  color: text('color').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

export const projectLabels = sqliteTable('project_labels', {
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  labelId: text('label_id').notNull().references(() => labels.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.projectId, t.labelId] }),
}));

export const checklistItems = sqliteTable('checklist_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isDone: integer('is_done', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  authorName: text('author_name'),
  body: text('body').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});
