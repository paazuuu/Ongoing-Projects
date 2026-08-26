import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { Env } from '../bindings';
import { getDb } from '../db/client';
import { checklistItems } from '../db/schema';
import { ok, fail } from '../lib/response';

export const checklistRoutes = new Hono<{ Bindings: Env }>();

const serializeChecklistItem = (row: typeof checklistItems.$inferSelect) => ({
  id: row.id,
  projectId: row.projectId,
  content: row.content,
  isDone: row.isDone,
  sortOrder: row.sortOrder,
  createdAt: new Date(row.createdAt).toISOString(),
  updatedAt: new Date(row.updatedAt).toISOString(),
});

const createSchema = z.object({
  content: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

const updateSchema = z.object({
  content: z.string().min(1).optional(),
  isDone: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

checklistRoutes.get('/projects/:projectId/checklist', async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.projectId, c.req.param('projectId')))
    .all();
  return c.json(ok(rows.map(serializeChecklistItem)));
});

checklistRoutes.post('/projects/:projectId/checklist', async (c) => {
  const body = await c.req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const db = getDb(c.env.DB);
  const [row] = await db
    .insert(checklistItems)
    .values({ projectId: c.req.param('projectId'), ...parsed.data })
    .returning();
  return c.json(ok(serializeChecklistItem(row)), 201);
});

checklistRoutes.put('/checklist/:id', async (c) => {
  const body = await c.req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const db = getDb(c.env.DB);
  const [row] = await db
    .update(checklistItems)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(checklistItems.id, c.req.param('id')))
    .returning();
  if (!row) return c.json(fail('Checklist item not found'), 404);
  return c.json(ok(serializeChecklistItem(row)));
});

checklistRoutes.delete('/checklist/:id', async (c) => {
  const db = getDb(c.env.DB);
  await db.delete(checklistItems).where(eq(checklistItems.id, c.req.param('id')));
  return c.json(ok(null));
});
